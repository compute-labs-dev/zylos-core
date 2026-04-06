---
name: omni-doc
description: "Read full document content from Omni knowledge base by document ID"
---

# omni-doc

Read the full content of a document from the Omni knowledge base. Use after searching with `omni-search` to get the complete text of a result.

## When to use

Use this skill when you have a document ID from search results and need to read the full content. The search results only show highlights — this returns the complete document.

## How to read a document

```bash
curl -s "https://omni.computelabs.ai/api/v1/documents/<DOCUMENT_ID>" \
  -H "Authorization: Bearer $OMNI_API_KEY"
```

## Parameters

| Parameter | Type | Where | Description |
|-----------|------|-------|-------------|
| `id` | string | URL path | Document ID from search results (`document.id`) |
| `start_line` | number | query param | Start line for large documents (optional) |
| `end_line` | number | query param | End line for large documents (optional) |

## Examples

**Read full document:**
```bash
curl -s "https://omni.computelabs.ai/api/v1/documents/01KNA3Q1CFK3SNJS2VSZNAAWV6" \
  -H "Authorization: Bearer $OMNI_API_KEY"
```

**Read specific line range (large documents):**
```bash
curl -s "https://omni.computelabs.ai/api/v1/documents/01KNA3Q1CFK3SNJS2VSZNAAWV6?start_line=1&end_line=50" \
  -H "Authorization: Bearer $OMNI_API_KEY"
```

## Response format

Returns: `id`, `title`, `url`, `source_type`, `content_type`, `content` (full text), `match_type`, `metadata`, `created_at`, `updated_at`.

The `content` field contains the full plaintext of the document. For large documents, use `start_line`/`end_line` to retrieve specific sections.

## Environment

Requires `OMNI_API_KEY` environment variable set to a valid Omni API key (format: `omni_*`).
