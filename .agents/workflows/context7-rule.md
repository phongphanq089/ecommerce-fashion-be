---
description: Always query context7 for the latest documentation before fulfilling requests
---

# Context7 Rule

Before answering questions or implementing features related to libraries, frameworks, or APIs (e.g., Next.js, React, Shadcn, etc.), you MUST query the `context7` MCP server to get the most up-to-date documentation and code examples.

## Steps:

1. Identify the library or framework involved in the user's request.
2. Call `mcp_context7_resolve-library-id` to find the correct `libraryId` for the identified technology.
3. Call `mcp_context7_query-docs` using the obtained `libraryId` and a specific query related to the user's request.
4. Read the results from `context7`.
5. Incorporate the up-to-date information into your plan, code, or response.

Do not rely solely on your internal knowledge for rapidly changing technologies.
