# 🧱 POST-MVP MASTER PLAN

## apibld — From Generator to Backend Control Plane

---

# PHASE 2 (Months 3–6)

## Teams + GitHub PR Control Plane

You already locked this in, but here it is integrated into the bigger strategy.

---

## 🎯 Objective

Turn apibld into:

> The canonical source of truth for backend architecture, synchronised with real repos.

---

## Delivered Capabilities

### 1️⃣ Workspaces

* Multi-seat
* Role system (Owner, Admin, Editor, Viewer)
* Audit logs
* Project-level permissions

### 2️⃣ IR Versioning

* Snapshot per save
* IR diff viewer
* Compare versions
* Version metadata (who changed what)

### 3️⃣ GitHub App Integration

* Repo linking
* Base branch selection
* Secure installation model

### 4️⃣ PR Engine

* New branch per update
* IR diff → human-readable PR description
* Managed file overwrite only
* Manifest enforcement
* Abort on manual modification
* Webhook sync
* Post-merge verification (your B choice)

### 5️⃣ Repo Verification After Merge

After PR merge:

* Pull latest repo
* Verify manifest hash matches IR
* Verify generated files match expected output
* Update `lastMergedIrVersion`
* If mismatch → flag workspace warning

This adds professional trust.

---

## Pricing Impact

Team tier becomes justified:

* £199–299 per seat depending on positioning

Professional tier:

* Multi-repo linking
* Protected branch enforcement
* Required reviewers
* Custom PR templates
* Extended audit logs

This phase moves ARPU up.

---

# PHASE 3 (Months 6–12)

## Engineering Depth & Platform Expansion

This is where you build moat.

---

# 1️⃣ Multi-Framework Export

Now that IR is stable and PR engine exists, expand exporters.

Order of expansion:

1. Fastify (low complexity)
2. NestJS (huge demand)
3. Hono (modern crowd)
4. Django (market expansion)
5. Flask

Architecture:

```text
IR → Framework Adapter → Template Layer → File Tree
```

Each framework has:

* Router adapter
* Validation adapter
* ORM adapter mapping
* Auth adapter mapping
* Test adapter mapping

Do NOT fork logic.
All exporters consume IR.

---

# 2️⃣ Schema Drift Intelligence

When repo schema changes:

Instead of just warning, introduce:

* Drift detection dashboard
* “Compare repo vs IR”
* Highlight differences

Still no auto-import yet.

This makes apibld smarter without complexity explosion.

---

# 3️⃣ Controlled Custom Logic Nodes

Now expand graph system carefully.

Add:

* Transform node
* If condition node
* Map node
* External HTTP call node
* Background job enqueue node

Still no arbitrary code injection.

Graph becomes:

DAG (directed acyclic graph)

But keep safety constraints:

* Deterministic
* No loops (initially)
* No freeform scripting

This increases power massively.

---

# 4️⃣ Background Jobs & Workers

Add:

* BullMQ integration
* Worker generator
* Queue config
* Redis integration

Export now includes:

```text
/src/jobs
/src/worker.ts
```

This makes apibld serious backend infrastructure.

---

# 5️⃣ CI/CD Generation

Add export options for:

* GitHub Actions
* Docker image build pipeline
* Test pipeline
* Lint pipeline

This increases enterprise appeal significantly.

---

# 6️⃣ Observability Export

Generate:

* Structured logging
* Health endpoints
* Error boundary middleware
* Optional OpenTelemetry integration

Now exported APIs feel enterprise-ready.

---

# PHASE 4 (Year 2)

## Intelligence Layer & Migration Power

Now IR is mature.
PR engine stable.
Multi-framework working.

Time to add AI and migration tools.

---

# 1️⃣ AI IR Generator

User types:

> "Blog platform with users, posts, comments, admin role"

AI generates IR.

NOT code.

IR only.

Safer.
Cleaner.
Deterministic.

---

# 2️⃣ AI Refactor Advisor

Based on IR:

* Suggest missing indexes
* Suggest permission gaps
* Suggest model normalization
* Suggest validation improvements

AI acts as architecture advisor.

---

# 3️⃣ Import Existing Projects

Allow:

* Upload Prisma schema
* Connect to repo
* Parse project
* Convert to IR

This unlocks migration market.

Now you’re not just generator.
You’re modernization tool.

---

# PHASE 5 (Enterprise & Ecosystem)

---

# 1️⃣ Multi-Tenant Architecture Support

Add:

* Tenant-aware models
* Scoped RBAC
* Org-based permissions

Enterprise feature.

---

# 2️⃣ Self-Hosted apibld

Offer:

* Docker image
* Private install
* On-prem support

High price tier.

---

# 3️⃣ Plugin System

Allow:

* Custom exporters
* Custom middleware packs
* Custom auth adapters
* Community extensions

Now you’re platform, not product.

---

# 4️⃣ White-Label Export

Professional/Enterprise tier:

* Remove branding
* Custom architecture templates
* Custom coding style presets

---

# 🔐 Long-Term Sync Engine Evolution

Eventually:

* AST-aware updates
* Partial file preservation
* Extension zones
* Feature branch syncing
* Multiple open PRs
* Branch-level IR binding

But only after stability.

---

# 💰 £1M ARR Strategy

Example mature breakdown:

* 700 Pro @ £79 = £55k/month
* 200 Team @ £249/seat (avg 3 seats) = £149k/month
* 30 Professional @ £499 = £15k/month
* 5 Enterprise @ £2k/month = £10k/month

Total: £229k/month (~£2.7M ARR)

Even half that = £1M+ ARR.

This is realistic with real engineering value.

---

# 🚨 Risks As You Scale

1. IR complexity explosion
2. Export template sprawl
3. GitHub edge cases
4. Enterprise security expectations
5. Performance of diff engine
6. Maintaining determinism

Mitigation:

* Strict IR versioning
* Backward compatibility policy
* Automated test suite for exporters
* Contract tests per framework
* Deterministic generation guarantee

---

# 🧠 Strategic Evolution

Stage 1: Backend generator
Stage 2: Backend control plane
Stage 3: Backend intelligence system
Stage 4: Backend platform

Each stage increases:

* Switching cost
* Pricing power
* Enterprise credibility
* Moat depth

---

# 🔥 The Real Moat

Your moat will ultimately be:

1. IR sophistication
2. Deterministic multi-framework export
3. GitHub sync engine
4. Schema drift intelligence
5. Enterprise-grade workflow

Not drag-and-drop UI.