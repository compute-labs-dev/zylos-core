---
name: omni-search
description: "Search company internal knowledge base (Gmail, Drive, Slack, Notion, HubSpot) via Omni"
---

# omni-search

Search the company's internal knowledge base powered by Omni. Searches across Gmail, Google Drive, Slack, Notion, and HubSpot.

## When to use

Use this skill when you need to find internal company information: emails, documents, Slack messages, Notion pages, or HubSpot records. This is the primary way to access company knowledge.

## How to search

```bash
curl -s https://omni.computelabs.ai/api/v1/search \
  -X POST \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "<SEARCH_QUERY>",
    "mode": "hybrid",
    "limit": 10
  }'
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | **required** | Search query text |
| `mode` | string | `hybrid` | Search mode: `hybrid`, `fulltext`, or `semantic` |
| `source_types` | string[] | all | Filter by source: `gmail`, `google_drive`, `slack`, `notion`, `hubspot` |
| `content_types` | string[] | all | Filter by content type |
| `limit` | number | 20 | Max results (cap: 100) |
| `offset` | number | 0 | Pagination offset |

## Examples

**Search everything:**
```bash
curl -s https://omni.computelabs.ai/api/v1/search -X POST \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "quarterly revenue report", "limit": 5}'
```

**Search only Slack:**
```bash
curl -s https://omni.computelabs.ai/api/v1/search -X POST \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "deployment issue", "source_types": ["slack"], "limit": 10}'
```

**Search Google Drive documents:**
```bash
curl -s https://omni.computelabs.ai/api/v1/search -X POST \
  -H "Authorization: Bearer $OMNI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "meeting notes", "source_types": ["google_drive"], "limit": 5}'
```

## Response format

Results include: `document.id`, `document.title`, `document.url`, `score`, `highlights` (matched text with **bold** markers), `match_type`. Use `document.id` with the `omni-doc` skill to get full content.

## Environment

Requires `OMNI_API_KEY` environment variable set to a valid Omni API key (format: `omni_*`).
