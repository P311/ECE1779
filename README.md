# ECE1779

# Note: if IP changes, run `kubectl get svc backend-svc` to get the current IP

Backend API: http://159.203.49.172

### API Endpoints

- GET /api/v1/events
- POST /api/v1/events
- DELETE /api/v1/events/:id
- GET /api/v1/sources
- POST /api/v1/sources

## AI Assistance & Verification (Summary):
AI serves as a knowledge base and served as a design partner for API design. We also use it to implement simple CRUD methods that doesn't have complicated logic involved. The AI shows its limitation in not having a holistic understanding of our requirements. A representative case is when it stores a secret (api key) in our database, it stores it in plaintext. What's worse is because of the lack of semantic understanding of the key it actually returns the key in one of the get calls. We mainly verify the correctness of the AI output through 3 ways. Thorugh inspection by reviewing its changes line by line, detailed unit tests which runs after every change it makes to see what broke and what didn't, repeatable manual end to end tests scenarios to prevent regression. 