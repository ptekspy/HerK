# 🧱 APIBLD V1 — FULL MVP PRODUCT PLAN

---

# 1️⃣ Product Positioning (Crystal Clear)

## One Line

> Design your backend visually. Export real production-grade Express + Prisma code.

## Who It’s For

* Frontend engineers building SaaS
* Indie founders who don’t want to hand-write boilerplate
* Agencies scaffolding APIs repeatedly
* Teams prototyping backend architecture

This is NOT:

* No-code for non-engineers
* Backend hosting
* API gateway
* BaaS competitor

This is:

> A backend compiler with a visual DSL.

---

# 2️⃣ Core Product Outcome

A user should be able to:

1. Create models visually
2. Create CRUD routes visually
3. Enable JWT auth
4. Configure role-based permissions
5. Click Export
6. Download ZIP
7. Run:

```bash
pnpm install
pnpm prisma migrate dev
pnpm dev
```

And have a clean, production-ready API with:

* Express
* TypeScript
* Prisma
* Zod validation
* JWT auth
* RBAC
* Swagger docs
* Integration tests
* Dockerfile
* README

If this works smoothly, MVP succeeds.

---

# 3️⃣ Feature Scope — EXACT

---

# 🧩 3.1 Model Builder

## Supported Field Types

* string
* number
* boolean
* date
* enum
* relation (1:1, 1:n, n:1)

## Field Options

* required
* unique
* default
* indexed

## Automatic Behavior

* Auto-add `id` field (UUID)
* Auto-add `createdAt`
* Auto-add `updatedAt`

## UX Rules

* Drag to reorder fields
* Inline validation
* Prevent duplicate names
* Prevent relation to non-existent model

## What’s NOT Included

* Polymorphism
* Composite keys
* JSON fields (v1 optional but likely skip)
* Soft delete (can add later)

---

# 🛣 3.2 Route Builder (Graph UI, Linear Logic)

Even though it’s visually node-based, under the hood it is:

```
authRequired? → requirePermission* → validate → crud
```

## Supported CRUD Actions

* Create
* UpdateById
* DeleteById
* FindById
* FindMany

## No branching

## No conditional logic

## No custom code

## No async external calls

---

# 🔐 3.3 Auth Builder (Pro Tier)

## Auth Type

* JWT only

## Generated System Models

* User
* Role
* Permission
* UserRole
* RolePermission

## Generated Routes

* POST /auth/register
* POST /auth/login
* GET /auth/me

## Middleware

* authRequired()
* requirePermission()

## What’s NOT Included

* OAuth
* Refresh tokens
* Multi-tenant auth
* Social login

---

# 🛡 3.4 RBAC

User can:

* Create permissions
* Create roles
* Assign permissions to roles
* Lock routes to permissions

Permission example:

```
users:create
users:read
users:update
users:delete
```

Exporter wires permission guard middleware.

---

# 🧪 3.5 Test Generator (Pro)

Generate:

* Auth success test
* Auth failure test
* CRUD create test
* CRUD find test
* CRUD update test
* CRUD delete test

Using:

* Vitest

Not full coverage.
Just real integration scaffolding.

---

# 📄 3.6 OpenAPI (All Tiers)

Generate:

* Full OpenAPI spec
* Swagger UI route
* Models derived from Zod
* Path definitions derived from IR

Important: OpenAPI must be generated from same source as validation.

No duplication.

---

# 📦 3.7 Export System

## Export Format

ZIP only.

No GitHub integration.

## Included Files

```
src/
  modules/
  middleware/
  prisma/
  docs/
tests/
prisma/schema.prisma
package.json
tsconfig.json
.env.example
Dockerfile
README.md
```

## Deterministic Output

* Sorted models
* Sorted routes
* Stable formatting
* No random IDs

Future-proof for PR export later.

---

# 💰 4️⃣ Pricing Model (MVP)

---

## 🟢 Basic

* 1 project
* 3 models
* 10 routes total
* 12 fields per model
* No auth
* No RBAC
* No tests
* OpenAPI included
* 5 exports/month
* Express only

---

## 🔵 Pro

* Unlimited models
* Unlimited routes
* Auth
* RBAC
* Tests
* Unlimited exports
* Priority support

---

# 5️⃣ Technical Architecture

---

# 🧠 5.1 Internal Representation (IR)

UI → IR JSON → Export Engine

IR is canonical.

Exporter does not know about UI.
UI does not know about exporter templates.

This separation is critical.

---

# 🏗 5.2 Backend Stack (apibld itself)

Recommended:

* Next.js (App Router)
* Postgres
* Prisma
* Zod
* Stripe
* Auth (Clerk or custom simple JWT)

You want apibld itself to be boring and stable.

---

# 🗂 5.3 Data Storage Strategy

Each project stores:

* ProjectIR JSON blob
* Tier
* Export count
* CreatedAt
* UpdatedAt

No complex versioning in MVP.

---

# 🎨 6️⃣ UX Requirements

You said ugly is unacceptable.

So:

## Requirements

* Clean design
* Fast drag interactions
* No jitter
* Proper spacing
* Dark mode optional
* No clutter

## Pages

* Dashboard
* Project editor

  * Models tab
  * Routes tab
  * Auth tab (Pro)
  * Permissions tab (Pro)
* Export screen
* Billing screen

---

# 🚧 7️⃣ Development Roadmap

---

## Phase 1 — Core Compiler (Weeks 1–4)

* Finalise IR
* Build exporter (hardcode sample IR first)
* Generate Express app successfully
* Add Prisma schema generation
* Add test generation
* Add OpenAPI generation

No UI yet beyond JSON editor.

---

## Phase 2 — Model Builder UI (Weeks 5–6)

* Create models
* Edit fields
* Validate relations
* Persist IR

---

## Phase 3 — Route Builder UI (Weeks 7–8)

* Node pipeline UI
* Drag reorder
* Validate structure
* Attach CRUD actions

---

## Phase 4 — Auth & RBAC (Weeks 9–10)

* Auth UI
* Role UI
* Permission UI
* Guard node in routes

---

## Phase 5 — Export + Billing (Weeks 11–12)

* Stripe integration
* Tier enforcement
* Export validation
* ZIP generator
* Polished README generation

---

# ⚠️ Risks

---

## 1️⃣ Graph UI Complexity

Mitigation:

* Keep linear pipeline only.

## 2️⃣ Export Quality

Mitigation:

* Hand-design Express template carefully.
* Code must feel human-written.

## 3️⃣ Scope Creep

Mitigation:

* Strict MVP lock.
* No feature creep.

---

# 🧠 8️⃣ What Success Looks Like

If within 3 months of launch:

* 50 Pro users
* 200 Basic users
* Low churn
* People exporting repeatedly

Then you’ve validated the core idea.

# 🔥 Final Strategic Reminder

This product lives or dies on:

1. Export quality
2. UX polish
3. Simplicity

If exported code feels amateur,
engineers will never pay.

If UI feels clunky,
engineers will never use it.

If scope explodes,
you’ll never ship.
