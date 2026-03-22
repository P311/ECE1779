import fetch from "node-fetch";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/api/v1";

async function main() {
  console.log("=== Create Source ===");

  const sourceRes = await fetch(`${BASE_URL}/sources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `test-source-${Date.now()}`,
      description: "test",
    }),
  });

  if (!sourceRes.ok) {
    const body = await sourceRes.text();
    throw new Error(`Create source failed: ${sourceRes.status} ${body}`);
  }

  const sourceData = (await sourceRes.json()) as {
    id: string;
    [key: string]: any;
  };
  console.log(sourceData);

  const sourceId = sourceData.id;

  console.log("\n=== GET /sources ===");

  const getSourcesRes = await fetch(`${BASE_URL}/sources`, {
    method: "GET",
  });

  if (!getSourcesRes.ok) {
    const body = await getSourcesRes.text();
    throw new Error(`GET /sources failed: ${getSourcesRes.status} ${body}`);
  }

  const sourcesList = (await getSourcesRes.json()) as Array<{
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
  }>;
  console.log(sourcesList);

  const createdSource = sourcesList.find((s) => s.id === sourceId);
  if (!createdSource) {
    throw new Error("Created source was not found in GET /sources response");
  }

  console.log("\n=== POST /events (single) ===");

  const eventRes = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_id: sourceId,
      event_type: "user.login",
      severity: "info",
      payload: { user: "alice", browser: "Chrome" },
    }),
  });

  if (!eventRes.ok) {
    const body = await eventRes.text();
    throw new Error(`POST /events failed: ${eventRes.status} ${body}`);
  }

  const event = (await eventRes.json()) as {
    id: string;
    source_id: string;
    event_type: string;
    severity: string;
    payload?: Record<string, unknown>;
    ingested_at: string;
  };
  console.log(event);

  const createdEventId = event.id;

  console.log("\n=== POST /events/batch ===");

  const batchRes = await fetch(`${BASE_URL}/events/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_id: sourceId,
      events: [
        {
          event_type: "cpu.high",
          severity: "warning",
          payload: { cpu: 85 },
        },
        {
          event_type: "disk.full",
          severity: "critical",
          payload: { disk: "/dev/sda1", used: 99 },
        },
      ],
    }),
  });

  if (!batchRes.ok) {
    const body = await batchRes.text();
    throw new Error(`POST /events/batch failed: ${batchRes.status} ${body}`);
  }

  const batchResult = (await batchRes.json()) as { inserted: number };
  console.log(batchResult);

  console.log("\n=== GET /events ===");

  const getRes = await fetch(`${BASE_URL}/events?page=1`, {
    method: "GET",
  });

  if (!getRes.ok) {
    const body = await getRes.text();
    throw new Error(`GET /events failed: ${getRes.status} ${body}`);
  }

  const eventsList = (await getRes.json()) as {
    events?: Array<{ id?: string; [k: string]: any }>;
    page?: number;
    total?: number;
    [k: string]: any;
  };
  console.log(eventsList);

  console.log("\n=== DELETE /events/:id ===");

  const deleteRes = await fetch(`${BASE_URL}/events/${createdEventId}`, {
    method: "DELETE",
  });

  if (!deleteRes.ok && deleteRes.status !== 204) {
    const body = await deleteRes.text();
    throw new Error(`DELETE /events/:id failed: ${deleteRes.status} ${body}`);
  }

  console.log("Delete status:", deleteRes.status);

  console.log("\n=== Verify deletion ===");

  const verifyRes = await fetch(`${BASE_URL}/events?id=${createdEventId}`);

  if (!verifyRes.ok) {
    const body = await verifyRes.text();
    throw new Error(`Verify deletion failed: ${verifyRes.status} ${body}`);
  }

  const verifyData = await verifyRes.json();
  console.log(verifyData);
}

main().catch(console.error);
