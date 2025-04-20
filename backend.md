Below is a **“build‑ready” engineering specification** you can hand to a full‑stack team.  
It is organized so that each subsection can be implemented sequentially (or in parallel) with **Python + FastAPI** on the backend and **Next 13 (app router) + React/TypeScript** on the ­frontend.  No model fine‑tuning is required; we rely on **hosted LLMs** with structured tool calling.

---

## 0 . High‑Level Architecture

```
┌───────────────────────────┐        ┌─────────────────────────────┐
│        Next.js 13         │  HTTP  │        FastAPI Gateway      │
│  (app router + React UI)  │ ─────► │ (Auth, rate‑limit, routing) │
└───────────────────────────┘        └─────────────────────────────┘
                   ▲  SSE / WS                         │
                   │                                   ▼
     ┌─────────────────────────┐        ┌─────────────────────────┐
     │     Collaboration WS    │  Redis │      Async Workers      │
     │ (OT + presence, uvicorn)│ ◄────► │ (RAG, CRM, Compliance,  │
     └─────────────────────────┘        │  Doc‑Assembly, E‑mail)  │
                   ▲                    └─────────────────────────┘
                   │                                  │
                   │                                  ▼
          ┌──────────────────┐             ┌──────────────────────┐
          │ Postgres 15      │             │ Neo4j + PGVector     │
          │ (auth, docs, OT) │             │ (rules, embeddings)  │
          └──────────────────┘             └──────────────────────┘
```

---

## 1 . Backend (Python 3.11, FastAPI + async ecosystem)

### 1.1  Project Skeleton

```
backend/
├─ alembic/                 # migrations
├─ app/
│  ├─ main.py               # FastAPI factory
│  ├─ core/                 # settings, auth utils
│  ├─ api/
│  │  ├─ v1/
│  │  │  ├─ rag.py
│  │  │  ├─ agent.py
│  │  │  ├─ crm.py
│  │  │  ├─ compliance.py
│  │  │  ├─ assemble.py
│  ├─ services/             # business logic
│  │  ├─ agent_executor.py
│  │  ├─ vector_store.py
│  │  ├─ crm_client.py
│  │  ├─ compliance_engine.py
│  │  ├─ doc_assembler.py
│  │  ├─ guardrails.py
│  │  └─ email_sender.py
│  ├─ workers/              # Celery / RQ async tasks
│  └─ ws/                   # collaboration sockets
├─ Dockerfile
└─ pyproject.toml
```

### 1.2  Core Services & Tasks

| # | Component | What to Build | Key Packages |
|---|-----------|---------------|--------------|
| **B‑01** | **Auth / Gateway** | FastAPI dependency for JWT (access 15 m, refresh 7 d); scopes: `viewer`, `editor`, `admin`. Add **`slowapi`** for `100 req/min/user`. | `python-jose`, `passlib`, `slowapi` |
| **B‑02** | **LLM‑Ops Agent** | `AgentExecutor` (LangChain) with **function‑calling router**. Register tools:<br>• `vector_search(query)`<br>• `crm_fetch(org_id)`<br>• `compliance_check(text, geo)`<br>• `format_converter(html→docx/pdf)`<br>• `email_sender(to, subject, body)` | `langchain`, `openai 1.x` |
| **B‑03** | **Vector Store / RAG** | Ingestion CLI: chunk PDF/Docx 🔪→ embed via `text-embedding-3-small` → store in PGVector.<br>Hybrid retrieval = cosine + BM25 → Reciprocal Rank Fusion. | `pgvector`, `chromadb`, `pymupdf`, `tiktoken` |
| **B‑04** | **RAG API** | `GET /rag/query?q=&top_k=&filter=` → returns passages + metadata (paginated). |
| **B‑05** | **CRM Integration** | *Salesforce* (REST / Bulk) + *HubSpot* (OAuth **code + refresh**). Nightly ETL to `crm_*` tables (`contacts`, `donations`, `programs`).<br>`GET /crm/org/{id}/context` merges latest metrics. | `simple‑salesforce`, `hubspot-api-client`, `apscheduler` |
| **B‑06** | **Mission Alignment** | `post /align` body: `{org_id, funder_id}` → cosine between two embedding centroids, return score 0‑1.<br>Cache `Redis.setex(f"align:{org}:{fund}", score, 86400)`. | `redis-py` |
| **B‑07** | **Compliance Engine** | - Load YAML rule sets ➜ Neo4j nodes (`Reg`, `Geo`, `Version`).<br>- `check_compliance(text, geo)` walks Cypher predicates and returns `[{rule_id, passed, msg}]`.<br>- Daily rule updater via RegTech REST feed. | `neo4j-driver`, `spacy‑legal‑trf` |
| **B‑08** | **Document Assembly** | Jinja2 templates for **cover letter, narrative, budget**.<br>`POST /assemble` `{template_id, context_json}` → DOCX & PDF (Pandoc). |
| **B‑09** | **Guardrails** | Hard‑coded constitution rules (mission drift phrases, disallowed activities). `guardrails.scan(text)` → severity + suggestions. |
| **B‑10** | **Collaboration WS** | Uvicorn sub‑app `/ws/{doc_id}` with **Operational‑Transform** (`y‑js` protocol). Broadcast deltas; persist every 5 s snapshot → `doc_versions` table. |
| **B‑11** | **Audit Endpoints** | `GET /audit/{doc_id}/diff?v1=&v2=` returns JSON diff; `GET /audit/{doc_id}/timeline` list. |
| **B‑12** | **Emails & Notifications** | Simple SMTP wrapper (SendGrid). Tool callable from Agent (`email_sender`). |
| **B‑13** | **Observability** | Prometheus middleware; metrics: `llm_request_latency_seconds`, `rag_qps`, `agent_errors_total`. Grafana dashboard JSON provisioning in Helm chart. |
| **B‑14** | **CI/CD & Ops** | • Multi‑stage Dockerfile (slim‑python → prod).<br>• Helm charts (`values-staging.yaml`, `values-prod.yaml`).<br>• GitHub Actions: `flake8` → `pytest` → `docker build` → `helm upgrade`. |

---

## 2 . Database Schemas (Postgres 15)

```sql
-- auth
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email CITEXT UNIQUE,
  pwd_hash TEXT,
  role TEXT CHECK (role IN ('viewer','editor','admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- grant docs (versioned)
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  org_id UUID,
  title TEXT,
  current_version INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ
);

CREATE TABLE doc_versions (
  doc_id UUID,
  version INT,
  content JSONB,          -- serialized OT snapshot
  ai_generated BOOLEAN,
  created_at TIMESTAMPTZ
);

-- crm normalized
CREATE TABLE crm_donations (...);
CREATE TABLE crm_programs (...);

-- vector store handled by pgvector extension
ALTER TABLE embeddings ADD COLUMN embedding VECTOR(1536);
```

---

## 3 . Frontend (Next 13 + TypeScript)

### 3.1  Folder Layout

```
frontend/
├─ app/
│  ├─ layout.tsx            # shell with AuthProvider
│  ├─ login/page.tsx
│  ├─ dashboard/page.tsx
│  ├─ grant/[id]/page.tsx   # main workspace
│  ├─ api/llm/stream.ts     # Next proxy for SSE
├─ components/
│  ├─ EditorCanvas.tsx
│  ├─ GrantBotDrawer.tsx
│  ├─ AlignmentGauge.tsx
│  ├─ ComplianceMarks.tsx
│  ├─ CrmCharts.tsx
│  └─ DiffView.tsx
├─ hooks/
├─ store/   (Redux Toolkit)
├─ lib/     (fetchers with SWR)
└─ public/sw.js  (service‑worker)
```

### 3.2  Implementation Check‑list

| # | Feature | Steps / Libraries |
|---|---------|------------------|
| **F‑01** | **Auth Flow** | Next.js **credentials provider** → call `/auth/login`, store `access` in HttpOnly cookie, `refresh` in memory. |
| **F‑02** | **Protected Routes** | Server components check cookie; client guard via `useAuth()` hook. |
| **F‑03** | **Workspace Shell** | `react-grid-layout` canvas; each section = React component with drag/resize; left sidebar navigator. |
| **F‑04** | **AI Assistant (GrantBot)** | `<Drawer>` with chat history.<br>Client opens SSE (`/agent/run?doc_id=`).<br>Render streaming tokens; system tool‑call messages shown with emoji badges. |
| **F‑05** | **Rich‑Text Editor** | `draft-js` + custom block renderers; diff view uses `diff-match-patch`. |
| **F‑06** | **Alignment Gauge** | `d3‑arc` radial; updates on `/align` response via SWR mutate. |
| **F‑07** | **Compliance Indicators** | Text decorations from `/compliance/check` result; click → popover fix suggestion. |
| **F‑08** | **CRM Dashboard** | `VictoryBar` & `VictoryLine`; date‑range picker; fetch `/crm/org/{id}/context`. |
| **F‑09** | **Real‑Time Presence** | `y-websocket` client; colored cursors; conflict banner if >1 unsynced ops. |
| **F‑10** | **Export / Submit** | Buttons call `/assemble` then `file‑saver`; submit calls `/submission` → shows tx hash toast. |
| **F‑11** | **Audit Viewer** | Slider (MUI) + side‑by‑side diff; filter chips “AI / User”. |
| **F‑12** | **PWA & Offline** | `next-pwa` plugin; service‑worker caches `/_next/static` and last doc snapshot.<br>Offline banner when `navigator.onLine === false`; auto‑sync queue on reconnect. |

---

## 4 . API Contract (OpenAPI snippets)

```yaml
GET /rag/query:
  parameters:
    - {name: q, in: query, required: true, schema: {type: string}}
    - {name: top_k, in: query, schema: {type: integer, default: 6}}
    - {name: filter, in: query, schema: {type: string}}
  responses:
    200:
      application/json:
        schema:
          type: object
          properties:
            passages:
              type: array
              items: { $ref: '#/components/schemas/Passage' }

POST /agent/run:
  requestBody:
    application/json:
      schema:
        {type: object, properties: {doc_id:{type:string}, user_msg:{type:string}}}
  responses:
    "200":
      description: SSE stream
```

*(Provide full OpenAPI YAML in repo’s `specs/` folder.)*

---

## 5 . DevOps

1. **Dockerfile**  
   ```Dockerfile
   FROM python:3.11-slim AS base
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY app/ ./app
   CMD ["uvicorn","app.main:create_app","--factory","--host","0.0.0.0","--port","8000"]
   ```

2. **Helm Chart structure** (`charts/grant‑engine/`) with values for image tag, env, secrets.

3. **GitHub Actions**  
   - job 1: `lint` (`ruff`, `mypy`)  
   - job 2: `pytest -q`  
   - job 3: build & push image, then `helm upgrade --install --wait`.

4. **Prometheus** scrape `/metrics`; Grafana dashboards stored as JSON in `ops/grafana/`.

---

## 6 . Sequence to Stand‑up Local Dev

1. `docker compose up pg neo4j redis chroma minio`  
2. `python -m app.scripts.bootstrap_data sample_docs/`  
3. `uvicorn app.main:create_app --factory --reload`  
4. `pnpm dev` in `frontend/` (Next.js).  
5. Visit `localhost:3000/login`.

---

## 7 . Acceptance Criteria

| Module | Metric / Behaviour |
|--------|--------------------|
| Agent tool‑call | returns `function_call` JSON 100 % of times tool needed. |
| RAG retrieval | p95 latency ≤ 500 ms for top‑6 passages. |
| Mission alignment | cosine similarity exposed in ≤ 150 ms (cached). |
| Compliance check | covers ≥ 50 jurisdictions; 95 % rule recognition on test set. |
| Collaboration | OT sync latency \< 1 s with 3 concurrent editors. |
| CI/CD | green pipeline from PR merge to k8s deploy \< 10 min. |

---

### Deliverables

- **Backend**: FastAPI service, async worker layer, OpenAPI spec, Helm chart.  
- **Frontend**: Next 13 app, Redux store, PWA SW, full component library.  
- **Docs**: `README.md` (local dev), `ARCHITECTURE.md` (this spec), `API.md`.  
- **Scripts**: ingestion CLI, nightly CRM sync, rule updater.  
- **Dashboards**: Grafana JSON, Prometheus alert rules.  

> **Follow this document step‑by‑step** and the result is a fully functional, LLM‑powered grant‑proposal automation platform with CRM context, compliance guardrails, real‑time collaboration, and agentic tool‑calling—ready for staging in Kubernetes.