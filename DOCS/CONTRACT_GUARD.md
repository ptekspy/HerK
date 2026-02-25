# 🚀 Company #1

## **ContractGuard** (working name)

### One-Line Pitch

> ContractGuard prevents breaking API changes from ever reaching production.

---

# 🧠 The Problem (Clear, Expensive, Real)

Scaling software teams break their own APIs constantly.

Not because they’re incompetent.

Because:

* Multiple squads touch the same service
* Refactors change field types
* Required fields get added silently
* Mobile apps lag behind backend releases
* Versioning discipline erodes under pressure

The result:

* Emergency rollbacks
* Client outages
* Friday night incidents
* Broken partner integrations
* Lost trust

Every engineering org above 20 devs has experienced this.

Most rely on:

* Code review
* Tribal knowledge
* “We’ll catch it in QA”

They don’t.

---

# 💥 The Cost

Breaking API contracts cause:

* Production incidents
* SLA violations
* Enterprise churn
* Internal blame loops
* Engineering velocity loss

And the worst part?

The change looked harmless in the PR.

---

# 🛠 The Solution

ContractGuard integrates into your GitHub workflow and:

1. Detects API contract changes in pull requests
2. Classifies breaking vs non-breaking changes
3. Blocks or flags dangerous changes before merge
4. Produces an impact report
5. Enforces contract stability policies per team

No new workflow.
No new platform to learn.
Just protection at the gate.

---

# 🔍 What It Actually Does (MVP Scope)

Supports:

* OpenAPI
* GraphQL schemas
* JSON schema
* tRPC (later)

On PR:

* Extract previous deployed contract
* Diff against new contract
* Detect:

  * Removed fields
  * Type changes
  * Enum restrictions
  * Required field additions
  * Endpoint removal
* Comment on PR
* Optionally fail CI

---

# 🎯 ICP (Ideal Customer Profile)

Scaling SaaS companies:

* 20–150 engineers
* Multiple frontend clients
* Public or partner APIs
* DevOps maturity but no contract enforcement tooling

Target roles:

* VP Engineering
* Head of Platform
* Staff Backend Engineer

---

# 💰 Pricing Model

Simple. High-value.

Starter – £199/month
Up to 3 services

Growth – £599/month
Up to 15 services
Org-wide policies
Slack alerts

Enterprise – £2k–£5k/month
Unlimited services
Audit logs
Policy exceptions workflow
SLA

If it prevents one production incident per year, it pays for itself.

---

# 📈 Market Opportunity

APIs power modern SaaS.

Every SaaS company above seed stage:

* Has APIs.
* Has broken APIs.
* Has felt the pain.

The market includes:

* SaaS
* Fintech
* Healthtech
* B2B platforms
* API-first startups

Even a tiny penetration of scaling startups yields meaningful revenue.

This is not a mass-market play.
This is a high-value niche infrastructure tool.

---

# 🏗 Why Now

Engineering teams are:

* Moving faster
* Refactoring aggressively
* Increasing service count
* Shipping independently

Velocity has increased.
Safety tooling hasn’t caught up.

This is the missing guardrail between:
“Ship fast”
and
“Don’t break everything.”

---

# 🧩 Why It Wins

* It sits in CI (high leverage)
* It enforces discipline automatically
* It doesn’t change workflow
* It’s easy to trial
* It’s measurable
* It’s painful to remove once installed

This is sticky infrastructure.

---

# 🏁 12-Month Goal

* 50 paying teams
* £30k–£60k MRR
* Positioned as “the API stability standard”
* Expand into:

  * DB schema drift
  * Event contract drift
  * Consumer impact analysis

But this company can stand alone.

It doesn’t need Tool 2 or Tool 3 to survive.

---

# 🎤 VC Framing

This is:

> “Datadog for API contract integrity.”

Not glamorous.
Not trendy.
Not AI hype.

Boring.
Essential.
Recurring.

That’s what builds serious companies.
