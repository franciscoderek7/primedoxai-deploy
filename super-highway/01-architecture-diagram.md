# Super Highway — Architecture Diagram
**Phase 1 Deliverable 1 of 7 — June 6, 2026**

---

## 1. Top-Level System Overview

```mermaid
graph TD
    USER["👤 User Browser / Mobile"] --> CDN["Cloudflare CDN + WAF"]
    CDN --> SH["Super Highway Hub\n(hub.franciscoholdings.com)\nNext.js 14 · Vercel Edge"]

    SH --> AUTH["Auth Orchestrator\n(hub Supabase project)\nSSO · JWT · Loop-aware tokens"]
    SH --> CART["Universal Cart Engine\n(hub Supabase project)\nMulti-merchant · Loop-isolated"]
    SH --> PAY["Payment Orchestrator\n(Stripe Connect · Crypto · Invoice)"]
    SH --> DELIVER["Delivery Engine\n(Digital instant · Physical fulfillment · Booking)"]

    AUTH -->|"Loop A token"| LA["LOOP A CLUSTER\n(Supabase Project A)"]
    AUTH -->|"Loop B token"| LB["LOOP B CLUSTER\n(Supabase Project B)"]

    LA --> A1["CCLDR.net\nccldr.net"]
    LA --> A2["PrimeDox AI\nprimedoxai.com"]
    LA --> A3["Weedlaw Education\nweedlaw-education"]
    LA --> A4["Francisco Holdings\nfranciscoholdings.com"]
    LA --> A5["CCC.net\nccc.net"]

    LB --> B1["OmniaGuard\nomniaguard.com"]
    LB --> B2["Kiaros\nkiaros.ai"]
    LB --> B3["SoulStack\nsoulstack.ai"]
    LB --> B4["CleanSwarm\ncleanswarm.ca"]
    LB --> B5["TechPetCage\ntechpetcage.com"]
    LB --> B6["[…+37 swarm properties]"]

    LA -->|"Plausible + GA4"| ANALYTICS_A["Analytics A\n(identity-linked)"]
    LB -->|"Plausible only"| ANALYTICS_B["Analytics B\n(anonymous-only)"]

    style USER fill:#f0f4ff,stroke:#4a6cf7
    style CDN fill:#f5a623,stroke:#c78000,color:#000
    style SH fill:#1a1a2e,stroke:#4a6cf7,color:#fff
    style AUTH fill:#16213e,stroke:#4a6cf7,color:#fff
    style CART fill:#16213e,stroke:#4a6cf7,color:#fff
    style PAY fill:#16213e,stroke:#4a6cf7,color:#fff
    style DELIVER fill:#16213e,stroke:#4a6cf7,color:#fff
    style LA fill:#1b4332,stroke:#40916c,color:#fff
    style LB fill:#1c1c3e,stroke:#6a5acd,color:#fff
    style ANALYTICS_A fill:#2d6a4f,stroke:#40916c,color:#fff
    style ANALYTICS_B fill:#2d2d6e,stroke:#6a5acd,color:#fff
```

---

## 2. Identity Loop Isolation — Data Flow Detail

```mermaid
graph LR
    subgraph HUB ["HUB — opaque layer (zero PII stored here)"]
        HS["hub_session_id\n(UUID only — no name, no email)"]
        HS -->|"if loop A enrolled"| TKA["loop_a_token\n(signed JWT, 15 min TTL)"]
        HS -->|"if loop B enrolled"| TKB["loop_b_token\n(signed JWT, 15 min TTL)"]
    end

    subgraph LOOP_A ["LOOP A — Supabase Project A (Derek-identity)"]
        UA["users_a\n(email, name, purchases)"]
        OA["orders_a"]
        SA["subscriptions_a"]
        TKA --> UA
    end

    subgraph LOOP_B ["LOOP B — Supabase Project B (anonymous)"]
        UB["users_b\n(email only — no name required)"]
        OB["orders_b"]
        SB["subscriptions_b"]
        TKB --> UB
    end

    UA -.->|"NEVER linked"| UB
    OA -.->|"NEVER linked"| OB

    note["⚠ The hub NEVER stores which loop_x_user_id\nmaps to which hub_session. That mapping\nexists only in the signed JWT, not in any DB."]
```

---

## 3. Module Integration Architecture

```mermaid
graph TD
    HUB["Super Highway Hub"] --> REG["Module Registry\n(hub DB: modules table)"]
    REG --> MOD["Property Module\n(any of the 45 sites)"]

    MOD --> MC["module_config.json\n— module_id\n— loop: A | B\n— products[]\n— webhooks[]\n— delivery_type\n— stripe_account_id"]

    MOD --> API["Module API Adapter\n(edge function)\nExposes standard endpoints:\nGET /products\nPOST /order\nGET /status/{order_id}"]

    HUB -->|"auth check"| AUTHZ["Hub AuthZ Middleware\n— verifies JWT loop matches module loop\n— rejects cross-loop calls hard"]

    AUTHZ --> API
    API --> SUPABASE["Module's own tables\n(within its loop's Supabase project)"]
```

---

## 4. Payment Orchestration Flow

```mermaid
graph TD
    CART["Universal Cart\n(hub)"] --> CHECKOUT["Checkout Engine"]

    CHECKOUT --> SPLIT["Order Splitter\n— groups items by Stripe account\n— calculates platform fee (5-15%)\n— separates Loop A / Loop B line items"]

    SPLIT --> STRIPE["Stripe Connect\n(primary)\nSeparate connected accounts per loop"]
    SPLIT --> CRYPTO["Crypto Processor\n(Loop B preferred)\nBTC · ETH · XMR\nvia BTCPay or NOWPayments"]
    SPLIT --> INVOICE["Invoice / Wire\n(B2B enterprise)\nmanual + automated net-30"]

    STRIPE --> WEBHOOK["Stripe Webhook\n→ Edge Function\n→ fulfillment trigger"]
    CRYPTO --> CONFIRM["Crypto Confirm\n(6 confirmations min)\n→ fulfillment trigger"]
    INVOICE --> MANUAL["Manual reconcile\n→ fulfillment trigger"]

    WEBHOOK --> DELIVER["Delivery Engine"]
    CONFIRM --> DELIVER
    MANUAL --> DELIVER

    DELIVER -->|"digital"| INSTANT["Instant delivery\n— Supabase access grant\n— API key\n— course enrollment"]
    DELIVER -->|"physical"| FULFILL["ShipStation / 4PL\n— label print\n— tracking email\n— inventory deduct"]
    DELIVER -->|"service"| BOOK["Calendly API\n— slot reserved\n— reminder sequence"]
```

---

## 5. Full 45-Module Map (Current + Planned)

```mermaid
mindmap
  root((Super Highway Hub))
    Loop A — Derek Identity
      CCLDR.net
        Legal templates
        Courses
        Partner portal
      PrimeDox AI
        Emergency Defense
        Pro / Elite SaaS
      Weedlaw Education
        4 course tiers
        Sovereign coaching
      Francisco Holdings
        Investor portal
        Board advisory
      CCC.net
        Compliance SaaS
        Grow Kit products
    Loop B — Anonymous
      OmniaGuard
        Guardian / Archon / Sovereign SaaS
        Free audit funnel
      Kiaros
        AI consulting retainers
      SoulStack
        Infrastructure subscriptions
      CleanSwarm
        SaaS subscriptions
        B2B LOI pipeline
      TechPetCage
        Smart pet tech products
      Swarm Verticals ×8
        Space · Auto · Quantum
        Biotech · Health · Fintech
        Energy · Logistics
      [+27 planned modules]
```

---

## 6. Technology Stack Decision Tree

```mermaid
graph LR
    FE["Frontend\nNext.js 14\nTailwind CSS\nVercel Edge"]
    AUTH2["Auth\nSupabase Auth × 3 projects\n(hub / loop-A / loop-B)"]
    DB["Database\nPostgreSQL via Supabase\nRow-Level Security throughout"]
    PAY2["Payments\nStripe Connect\nBTCPay Server / NOWPayments\nManual invoice"]
    AI["AI Layer\nClaude (support + recommendations)\nOpenAI fallback for embeddings"]
    ANALYTICS2["Analytics\nGA4 + Plausible (Loop A)\nPlausible only (Loop B)"]
    HOSTING["Hosting\nVercel (Next.js)\nCloudflare (CDN + WAF + DNS)"]
    SHIPPING["Fulfillment\nShipStation (physical)\nPrint-on-demand (Printify/Printful)\nCustom webhook (digital)"]

    FE --> AUTH2 --> DB --> PAY2 --> AI
    AI --> ANALYTICS2 --> HOSTING --> SHIPPING
```
