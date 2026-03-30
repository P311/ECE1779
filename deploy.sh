#!/bin/bash
# Prerequisites (run these once before using this script):
#
# 1. Login to GitHub Container Registry:
#    echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
#
# 2. Export the kubeconfig (download from DigitalOcean control panel):
#    export KUBECONFIG=~/Downloads/k8s-1-35-1-do-0-tor1-1774148828091-kubeconfig.yaml
#
# 3. Create the secrets (only needed on first deploy or fresh cluster):
#    kubectl apply -f k8s/00-postgres-secret.yaml
#    kubectl apply -f k8s/00-backend-secret.yaml
#    kubectl create secret docker-registry ghcr-secret \
#      --docker-server=ghcr.io \
#      --docker-username=saosnsa \
#      --docker-password=YOUR_GITHUB_TOKEN
# 4. Add metrics
#    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

set -e  # stop if any command fails

echo "Building and pushing image..."
docker build --platform linux/amd64 -t ghcr.io/saosnsa/ece1779-backend:latest ./backend
docker push ghcr.io/saosnsa/ece1779-backend:latest

echo "Applying k8s manifests..."
kubectl apply -f k8s/01-postgres-service.yaml
kubectl apply -f k8s/02-postgres-statefulset.yaml
kubectl apply -f k8s/03-backend-deployment.yaml
kubectl apply -f k8s/04-backend-hpa.yaml
kubectl apply -f k8s/05-backend-service.yaml
kubectl apply -f k8s/06-db-backup-cronjob.yaml

echo "Waiting for postgres to be ready..."
kubectl wait --for=condition=ready pod/postgres-0 --timeout=120s

echo "Running migrations..."
kubectl exec -i postgres-0 -- psql -U pguser -d eventsdb < backend/db/migrations/001_create_sources.sql || true
kubectl exec -i postgres-0 -- psql -U pguser -d eventsdb < backend/db/migrations/002_create_events.sql || true
kubectl exec -i postgres-0 -- psql -U pguser -d eventsdb < backend/db/migrations/003_create_alert.sql || true

echo "Restarting backend to pull latest image..."
kubectl rollout restart deployment/backend

echo "Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

echo "Getting backend URL..."
kubectl get svc backend-svc

echo "Done! Your backend is live."