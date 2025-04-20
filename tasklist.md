Backend Task List
(focus on LLM‑powered, agentic tool‑calling; no model fine‑tuning)

LLM‑Ops Core

Implement LangChain (or Semantic‑Kernel) Agent Executor with “tool‑calling” routing.

Register tools: vector_search, crm_fetch, compliance_check, format_converter, email_sender.

Build prompt/response schema using JSON mode for structured outputs.

Add automatic function‑calling fallback for OpenAI 0613 & Anthropic Tool‑use APIs.

Vector Store / RAG

Create ingestion pipeline for sample proposals & 990s → chunk, embed (OpenAI Ada‑3), store in Chroma/PGVector.

Implement hybrid retrieval (dense + BM25) with Reciprocal Rank Fusion.

Expose /rag/query endpoint with pagination & metadata filters.

CRM Integration Service

Build Salesforce & HubSpot connectors (OAuth2, refresh tokens, nightly sync jobs).

Normalize contact / donation / program tables → Postgres.

Provide /crm/org/:id/context API returning enriched JSON for RAG agent.

Mission‑Alignment Scorer (Stateless)

Prompt‑only similarity scoring via OpenAI text‑emb‑3 small vectors (cosine).

Cache top‑k scores per (org_id, funder_id) in Redis with 24 h TTL.

Compliance Engine

Ingest jurisdictional rules → Neo4j; build Cypher predicate library.

Implement check_compliance(text, geo_code) micro‑service (FastAPI).

Connect to RegTech API for daily rule updates; store versions.

Document Assembly & Formatting

Create Jinja2 template set for common RFP sections.

Build “field‑mapper” function (LLM prompt) that maps RFP JSON → template keys.

Provide /assemble endpoint returning DOCX & PDF via Pandoc.


Implement “constitutional” rule list (mission drift, restricted content).

Add guardrail tool that scans LLM drafts; returns severity & suggested rewrites.

Collaboration & Audit

WebSocket service with Operational‑Transform diff broadcasting.

Change‑log table (user_id, delta, ai_generated bool).

Endpoint /audit/:doc_id/diff/:v1/:v2 for version compare.

Auth & Gateway

FastAPI gateway with JWT (access + refresh), role scopes (viewer/editor/admin).

CORS & rate‑limit (100 RPM/user) middleware.

DevOps & Observability

Multi‑stage Dockerfiles; Helm charts (staging/prod).

GitHub Actions: lint → test → build → push → deploy.

Prometheus metrics: LLM latency, token usage, vector‑query QPS.

Grafana dashboards & alert rules (p95 > 3 s, error > 2 %).

🖥️ Frontend Task List
(React + TypeScript; agent‑centric UI; offline‑friendly)

Auth & Routing

JWT login flow; protected routes (React‑Router v6).

Role‑based component guards.

Workspace Shell

react-grid-layout canvas for draggable proposal sections.

Section Navigator sidebar with search & deep‑link anchors.

AI Assistant Panel

Floating action button → opens “GrantBot” chat drawer.

Chat component with streaming SSE from /rag/query & /agent/run.

Display tool‑calls (e.g., “🔍 Searching proposals…”) as system messages.

Content Generation UI

Rich‑text editor (Draft.js) with diff view (AI vs user).

“Insert suggestion” tooltip on highlighted AI blocks.

Alignment & Compliance Widgets

Radial score gauge (D3) for mission alignment.

Inline underline indicators for compliance issues; popover quick‑fix.

Toast alerts for ethical violations (React‑Toastify).

CRM Insights Dashboard

Victory.js donation bar chart, program line chart.

Filters: date range, donor tier.

Real‑Time Collaboration

OT client engine; visual presence cursors.

Conflict banner on simultaneous edits; merge dialog.

State Management & Persistence

Redux Toolkit slices: auth, workspace, aiDrafts, crmContext.

Dexie.js IndexedDB sync; optimistic updates + retry queue.

Compliance Matrix & Timeline

Victory heatmap of geo‑regulation pass/fail.

Deadline timeline with react-vertical‑timeline‑component.

Export & Submission

PDF/Markdown export buttons (server‑side /assemble).

“Submit” modal → triggers backend /submission and shows blockchain tx hash.

Audit Trail Viewer

Version slider; side‑by‑side diff with color coding.

Filter: user vs AI, date range.

PWA & Offline

Service Worker caching of static assets & last doc state.

“Offline” banner with auto‑sync on reconnect.

