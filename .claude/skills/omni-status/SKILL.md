---
name: omni-status
description: "Check Omni knowledge platform health and data source sync status"
---

# omni-status

Check the health of the Omni knowledge platform and the sync status of all data sources.

## When to use

Use this skill to check if the knowledge base is operational, see which sources are syncing, and get document counts per source.

## Health check (no auth required)

```bash
curl -s https://omni.computelabs.ai/api/v1/health
```

Returns status of all services: postgres, redis, searcher, indexer, connector_manager.

## Source status (requires auth)

```bash
curl -s https://omni.computelabs.ai/api/v1/sources \
  -H "Authorization: Bearer $OMNI_API_KEY"
```

Returns per-source: `name`, `source_type`, `document_count`, `sync_status`, `last_sync_at`, `documents_scanned`, `documents_processed`, `sync_error`.

## API key management

**Create a new key:**
```bash
curl -s https://omni.computelabs.ai/api/v1/api-keys -X POST \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-agent"}'
```

**List keys:**
```bash
curl -s https://omni.computelabs.ai/api/v1/api-keys \
  -H "Authorization: Bearer $OMNI_API_KEY"
```

**Revoke a key:**
```bash
curl -s https://omni.computelabs.ai/api/v1/api-keys -X PATCH \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"<KEY_ID>","action":"revoke"}'
```

## Environment

Requires `OMNI_API_KEY` environment variable set to a valid Omni API key (format: `omni_*`).
