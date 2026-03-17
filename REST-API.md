# Event Logging and Analytics System — API Documentation

**Base URL:** `/api/v1`

---

## Auth

TBD

---

## Events

### `GET /events`

Retrieve a paginated list of events, sorted by `ingested_at` in descending order (most recent first). Each page contains **15** events unless there're less than 15 left. For example if we have 20 events in total, the first page will always have 15 events and the second will have 5.

**Query Parameters**

| Parameter    | Type    | Required | Description                                                        |
|--------------|---------|----------|--------------------------------------------------------------------|
| `page`       | integer | No       | Page number (default: `1`)                                         |
| `id`  | string  | No       | Substring filter on the `id` field  
| `source_id`  | string  | No       | Substring filter on the `source_id` field                          |
| `event_type` | string  | No       | Substring filter on the `event_type` field                         |
| `severity`   | string  | No       | Substring filter on the `severity` field                           |
| `payload`    | string  | No       | Substring filter on the stringified JSON `payload`                 |
| `ingested_at`   | string  | No       | Substring filter on the `ingested_at` field     

- All field filters perform **substring matching** (case-insensitive), not exact matching.
- For `payload`, the search is performed against its JSON string representation - e.g. `/events?payload=Chrome` matches any event whose serialized payload contains `"Chrome"`.
- For simplicity only one field filter is supported — e.g. `/events?severity=critical&event_type=login&page=2` will accept the first filter and page number.

**Response**

`200 OK`

```json
{
  "events": [
    {
      "id": "evt-0001-0000-0000-000000000001",
      "source_id": "11111111-1111-1111-1111-111111111111",
      "event_type": "user.login",
      "severity": "info",
      "payload": { "user_id": "u001", "ip": "192.168.1.10", "browser": "Chrome" },
      "ingested_at": "2026-03-09T10:00:00Z"
    }
  ],
  "page": 1,
  "total": 1
}
```

`400 Bad Request` — Invalid query parameter value.

```json
{
  "detail": "Invalid value for parameter 'page': must be a positive integer."
}
```

---

### `POST /events`

Create a new event. The `source_id` must reference an existing source in the database; otherwise the request is rejected.

If alert is active, check if the number of events within time window has exceeded the threshold. If so, send an notification email.

**Request Body**

```json
{
  "source_id": "11111111-1111-1111-1111-111111111111",
  "event_type": "user.login",
  "severity": "info",
  "payload": { "user_id": "u001", "ip": "192.168.1.10", "browser": "Chrome" }
}
```

| Field        | Type   | Required | Description                                            |
|--------------|--------|----------|--------------------------------------------------------|
| `source_id`  | string | Yes      | UUID of the event source (must exist in database)       |
| `event_type` | string | Yes      | Dot-namespaced event type (e.g. `user.login`)           |
| `severity`   | string | Yes      | Severity level (e.g. `info`, `warning`, `critical`)     |
| `payload`    | object | Yes      | Arbitrary JSON payload with event-specific data         |

- `id` and `ingested_at` are generated server-side and should not be included in the request.

**Response**

`201 Created`

```json
{
  "id": "evt-0001-0000-0000-000000000001",
  "source_id": "11111111-1111-1111-1111-111111111111",
  "event_type": "user.login",
  "severity": "info",
  "payload": { "user_id": "u001", "ip": "192.168.1.10", "browser": "Chrome" },
  "ingested_at": "2026-03-09T10:00:00Z"
}
```

`422 Unprocessable Content` — Source does not exist.

```json
{
  "detail": "Source '11111111-1111-1111-1111-111111111111' does not exist. Register it via POST /sources first."
}
```

`400 Bad Request` — Missing or invalid fields.

```json
{
  "detail": "Field 'event_type' is required."
}
```

---

### `DELETE /events/{id}`

Permanently remove an event by its ID.

**Path Parameters**

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | string | Yes      | UUID of the event        |

**Response**

`204 No Content` — Event successfully deleted (empty body).

`404 Not Found`

```json
{
  "detail": "Event with id 'evt-0001-0000-0000-000000000001' not found."
}
```

---

## Sources

### `GET /sources`

Return **all** registered event sources, including computed stats.

**Response**

`200 OK`

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "web-app",
    "description": "Primary web application",
    "created_at": "2026-03-01T00:00:00Z",
    "stats": {
      "total_events": 1240,
      "last_event_at": "2026-03-09T11:00:00Z",
      "critical_count_24h": 2
    }
  }
]
```

---

### `POST /sources`

Register a new event source. Once created, events referencing this source's `id` will be accepted by `POST /events`.

**Request Body**

```json
{
  "name": "web-app",
  "description": "Primary web application"
}
```

| Field         | Type   | Required | Description                             |
|---------------|--------|----------|-----------------------------------------|
| `name`        | string | Yes      | Unique name for the event source         |
| `description` | string | Yes      | Human-readable description of the source |

- `id`, `created_at`, and `stats` are generated server-side and should not be included in the request.

**Response**

`201 Created`

```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "name": "web-app",
  "description": "Primary web application",
  "created_at": "2026-03-01T00:00:00Z",
  "stats": {
    "total_events": 0,
    "last_event_at": null,
    "critical_count_24h": 0
  }
}
```

`409 Conflict` — Source name already exists.

```json
{
  "detail": "Source 'web-app' already exists."
}
```

`400 Bad Request` — Missing or invalid fields.

```json
{
  "detail": "Field 'name' is required."
}
```

---

## Analytics

### `GET /stats/timeline`

Return event counts grouped by time interval.

**Query Parameters**

| Parameter  | Type   | Required | Description                                          |
|------------|--------|----------|------------------------------------------------------|
| `group_by` | string | Yes      | Time granularity: `minute`, `hour`, `day`, or `month` |

**Response**

`200 OK`

```json
[
  { "time": "2026-03-15", "count": 10 },
  { "time": "2026-03-14", "count": 7 }
]
```

> The format of the `time` field depends on `group_by`:
> - `minute` → `2026-03-15T08:30`
> - `hour` → `2026-03-15T08:00`
> - `day` → `2026-03-15`
> - `month` → `2026-03`

`400 Bad Request` — Missing or invalid `group_by` value.

```json
{
  "detail": "Invalid group_by value. Must be one of: minute, hour, day, month."
}
```

---

### `GET /stats/source`

Return event counts grouped by source name.

**Response**

`200 OK`

```json
[
  { "source": "web-app", "count": 1240 },
  { "source": "auth-service", "count": 530 }
]
```

---

### `GET /stats/severity`

Return event counts grouped by severity level.

**Response**

`200 OK`

```json
[
  { "severity": "critical", "count": 20 },
  { "severity": "warning", "count": 15 },
  { "severity": "info", "count": 42 }
]
```

---

## Alert

### `PUT /alert/config`

Update the alert configuration. When active, the system sends an email notification if the number of events within the specified time window exceeds the threshold.

**Request Body**

```json
{
  "active": true,
  "time_window_minutes": 2500,
  "event_threshold": 10,
  "email": "test@mail.utoronto.ca"
}
```

| Field                 | Type    | Required | Description                                              |
|-----------------------|---------|----------|----------------------------------------------------------|
| `active`              | boolean | Yes      | Whether alerting is enabled                              |
| `time_window_minutes` | integer | Yes      | Size of the sliding time window in minutes               |
| `event_threshold`     | integer | Yes      | Number of events within the window that triggers an alert |
| `email`     | string | Yes      | The email address to receive high volume alert |
**Response**

`200 OK`

```json
{
  "active": true,
  "time_window_minutes": 2500,
  "event_threshold": 10
}
```

`400 Bad Request` — Missing or invalid fields.

```json
{
  "detail": "Field 'time_window_minutes' must be a positive integer."
}
```