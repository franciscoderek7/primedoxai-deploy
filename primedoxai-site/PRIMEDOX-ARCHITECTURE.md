# PrimeDox AI — The Motherboard
## Complete Architecture Reference
### Francisco Holdings Inc. | Derek Francisco, CEO

---

## SECTION 1: MOBILE APP — React Native Scaffold

### App Identity
- **App Name:** PrimeDox AI — The Motherboard
- **Subtitle:** Control Your Empire From Your Pocket
- **Bundle ID:** com.franciscoholdings.primedox
- **Platforms:** iOS 16+ / Android 11+
- **Framework:** React Native 0.73 + Expo SDK 50

### File Structure
```
primedox-mobile/
├── app.json                    # Expo config
├── package.json
├── src/
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # Stack + Tab nav
│   │   ├── TabNavigator.tsx    # Bottom tabs
│   │   └── AuthNavigator.tsx   # Login/register flow
│   ├── screens/
│   │   ├── SplashScreen.tsx    # Animated logo + "Initializing Swarm..."
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx        # Email + biometric
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── BiometricScreen.tsx    # Face ID / fingerprint
│   │   ├── DashboardScreen.tsx        # Swarm overview
│   │   ├── AgentsScreen.tsx           # 14 hero grid
│   │   ├── CompaniesScreen.tsx        # 41-company grid with filter
│   │   ├── DefenseScreen.tsx          # BENO-X + LexMind
│   │   ├── PricingScreen.tsx          # 5 tiers + Stripe
│   │   └── ProfileScreen.tsx          # Account + subscription
│   ├── components/
│   │   ├── AgentCard.tsx       # Hero card with pulse dot
│   │   ├── CompanyCard.tsx     # Empire company card
│   │   ├── LiveCounter.tsx     # Animated number
│   │   ├── ThreatToast.tsx     # Agent activity toast
│   │   ├── BENOXFlow.tsx       # 3-step BENO-X component
│   │   └── PartnershipCTA.tsx  # Fortune 500 pitch card
│   ├── hooks/
│   │   ├── useSwarmStatus.ts   # Agent status polling
│   │   ├── useBiometric.ts     # LocalAuthentication
│   │   └── useStripe.ts        # Payment hooks
│   ├── services/
│   │   ├── api.ts              # API client
│   │   ├── stripe.ts           # Stripe React Native SDK
│   │   └── notifications.ts    # Expo push notifications
│   ├── store/
│   │   ├── authSlice.ts        # Redux user/session
│   │   ├── agentSlice.ts       # Swarm state
│   │   └── companySlice.ts     # Empire state
│   └── theme/
│       ├── colors.ts           # Gold, cyan, dark palette
│       ├── typography.ts
│       └── spacing.ts
├── assets/
│   ├── icon.png                # PrimeDox diamond icon
│   ├── splash.png              # "Initializing Swarm..."
│   └── agents/                 # 14 hero avatars
└── __tests__/
```

### Key Screen Specs

#### SplashScreen.tsx
```tsx
// Sequence: Logo drop-in → particle burst → text fade
// "Initializing Swarm..." → "Connecting to Motherboard..." → "All Systems Active ✓"
// Duration: 2.8 seconds
// Background: #0A0A0A with particle canvas (react-native-skia)
```

#### DashboardScreen.tsx
```tsx
// Top: live counters row (companies / agents / markets)
// Middle: 14 agent cards in 2-col ScrollView
// Bottom: recent activity feed (WebSocket events)
// Pull-to-refresh: re-polls agent status
// Push notifications: agent alerts, threat events
```

#### DefenseScreen.tsx
```tsx
// BENO-X 3-step accordion (Animated.View height transitions)
// Emergency Card: red border, large text, tap-to-copy script
// LexMind mini-chat: pre-seeded Q&A for Charter rights
// Disclaimer banner: "EDUCATION ONLY — NOT LEGAL ADVICE"
```

#### PricingScreen.tsx
```tsx
// Stripe React Native SDK (@stripe/stripe-react-native)
// 5 tier cards in horizontal ScrollView
// "Subscribe" → StripeProvider → PaymentSheet
// Success: confetti animation + tier badge unlocked
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "@stripe/stripe-react-native": "0.35.0",
    "expo-local-authentication": "~13.8.0",
    "expo-notifications": "~0.27.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-reanimated": "~3.6.0",
    "@reduxjs/toolkit": "^2.1.0",
    "react-redux": "^9.1.0",
    "expo-secure-store": "~12.8.0",
    "@shopify/react-native-skia": "^1.0.0"
  }
}
```

### App Store Listing
**Name:** PrimeDox AI — The Motherboard
**Subtitle:** Control Your Empire From Your Pocket
**Category:** Business / Productivity
**Age Rating:** 4+

**Description:**
```
PrimeDox AI is the world's first AI motherboard for multi-company empires.

Built by Derek Francisco, CEO of Francisco Holdings Inc., PrimeDox connects
and controls 41 companies, 14 specialized AI agents, and $58B+ in addressable
markets — from your pocket.

WHAT PRIMEDOX DOES:
• Control 14 specialized AI Heroes (AeroMind, MediMind, LexMind, and 11 more)
• Monitor your entire 41-company empire in real-time
• Access BENO-X constitutional defense education (education only)
• Manage subscriptions and scale your AI deployments

AI HEROES ONLINE:
✈️ AeroMind — Aviation Safety
🏥 MediMind — Healthcare Intelligence  
💰 FinMind — Fintech & Payments
⚡ VoltMind — Energy & Renewables
📦 FlowMind — Logistics
🛡️ ShieldMind — Defense
🚀 OrbitMind — Space Operations
🚗 DriveMind — Autonomous Vehicles
⚛️ QubitMind — Quantum Computing
🧬 GenMind — Biotechnology
⚖️ LexMind — Legal & Constitutional
🌿 CannaMind — Cannabis Education
🧹 SwarmMind — Field Services
👻 GhostMind — Privacy

SECURITY:
Protected by OmniaGuard SDK. Zero prompt injection guarantee. End-to-end encrypted.
PIPEDA compliant. Canadian data residency.

NOTE: CCLDR/LexMind content is for educational purposes only.
Not legal representation. Retain qualified counsel for legal matters.

© 2026 Francisco Holdings Inc. | Lindsay, Ontario
```

**Keywords:** AI empire, business intelligence, agent swarm, Canadian AI, constitutional defense

**Screenshots (5 required):**
1. Dashboard with live counters and agent grid
2. 14 AI Heroes swarm panel
3. 41-company empire grid
4. BENO-X defense education flow
5. Pricing tiers with Stripe checkout

---

## SECTION 2: AI HERO SYSTEM — 14 SPECIALIZED AGENTS

Each hero is a specialized AI module inside PrimeDox, powered by Agent Swarm Technologies and protected by OmniaGuard SDK.

| # | Hero Name | Industry | Color | Emoji | Specialty |
|---|-----------|----------|-------|-------|-----------|
| 1 | **AeroMind** | Aviation | #0066CC | ✈️ | Collision prevention, flight optimization, ICAO compliance, air traffic coordination |
| 2 | **MediMind** | Healthcare | #00C896 | 🏥 | Clinical decision support, patient risk scoring, EHR optimization, drug interaction monitoring |
| 3 | **FinMind** | Fintech | #D4AF37 | 💰 | Real-time fraud detection, AML/KYC automation, payment routing, FINTRAC compliance |
| 4 | **VoltMind** | Energy | #22C55E | ⚡ | Grid demand forecasting, solar/wind optimization, carbon credit tracking, EV fleet charging |
| 5 | **FlowMind** | Logistics | #F97316 | 📦 | Route optimization, demand forecasting, warehouse automation, port/customs clearance |
| 6 | **ShieldMind** | Defense | #1F4E79 | 🛡️ | Threat intelligence fusion, critical infrastructure protection, OSINT/SIGINT analytics |
| 7 | **OrbitMind** | Space | #7C3AED | 🚀 | Satellite telemetry, orbital collision avoidance, debris tracking, launch optimization |
| 8 | **DriveMind** | Automotive | #EF4444 | 🚗 | Autonomous perception AI, path planning, V2X communications, fleet coordination |
| 9 | **QubitMind** | Quantum | #A855F7 | ⚛️ | Quantum circuit optimization, post-quantum cryptography, quantum ML training |
| 10 | **GenMind** | Biotech | #10B981 | 🧬 | Drug discovery acceleration, protein folding, clinical trial design, regulatory submission |
| 11 | **LexMind** | Legal | #FFD700 | ⚖️ | BENO-X constitutional analysis (education), Charter rights (education), procedural guidance |
| 12 | **CannaMind** | Cannabis | #00FF88 | 🌿 | ACMPR/Cannabis Act compliance education, medical advocacy education, VAC claims support |
| 13 | **SwarmMind** | Field Services | #00D4FF | 🧹 | Scheduling intelligence, route optimization, biometric crew tracking, auto-invoicing |
| 14 | **GhostMind** | Privacy | #8B5CF6 | 👻 | Data broker removal, reputation management, PIPEDA/Bill C-27 compliance, identity protection |

### Hero Architecture
```
PrimeDox Motherboard
├── LexMind (always on — core legal education)
├── CannaMind (CCLDR integration — education only)
├── SwarmMind (CleanSwarm integration)
└── [Industry Heroes] — licensed by tier
    ├── FREE: LexMind basic only
    ├── PRO: + SwarmMind + CannaMind + GhostMind
    ├── ELITE: + All 14 heroes
    ├── SOVEREIGN: + Custom hero training
    └── IMPERIUM: + White-label + hero deployment
```

### Hero Avatar Concepts
Each hero uses a geometric icon style:
- Diamond base shape (PrimeDox signature)
- Industry-specific inner symbol
- Glow matching their accent color
- Pulsing animation when active
- Static when idle

Design file: `/primedoxai-site/assets/heroes/` (SVG for each)

---

## SECTION 3: STRIPE PAYMENT INTEGRATION

### Setup (run once before launch)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create all 5 PrimeDox products
export SK="sk_test_YOUR_KEY_HERE"

# FREE tier — no charge, just registration
# PRO DEFENSE — $49/mo CAD
curl https://api.stripe.com/v1/products \
  -u $SK: \
  -d name="PrimeDox Pro Defense" \
  -d description="Unlimited documents, AI chat, 5 company connections"

# (Then create price for each product)
```

### Complete HTML Checkout Form (embed anywhere)

```html
<!-- Stripe Checkout Integration — PrimeDox -->
<!-- Replace PUBLISHABLE_KEY and PRICE_ID before going live -->
<script src="https://js.stripe.com/v3/"></script>
<script>
var stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

function checkoutPlan(priceId, planName) {
  // Show loading state
  document.querySelectorAll('.checkout-btn').forEach(function(b) {
    b.disabled = true;
    b.textContent = 'Connecting to Stripe...';
  });

  fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId: priceId, planName: planName })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    return stripe.redirectToCheckout({ sessionId: data.sessionId });
  })
  .catch(function(err) {
    console.error(err);
    alert('Checkout unavailable. Call 705-307-8080 or email derek@franciscoholdings.com');
    document.querySelectorAll('.checkout-btn').forEach(function(b) {
      b.disabled = false;
      b.textContent = 'Get Started';
    });
  });
}
</script>

<!-- PRICE IDs (from Stripe Dashboard after setup) -->
<!-- Pro: price_xxx_pro_defense -->
<!-- Elite: price_xxx_elite_defense -->
<!-- Sovereign: price_xxx_sovereign -->
<!-- Imperium: price_xxx_imperium -->
```

### Stripe Products to Create
| Tier | Price ID Variable | CAD Price | Interval |
|------|------------------|-----------|----------|
| Pro Defense | PLACEHOLDER_URL_14 | $49 | Monthly |
| Elite Defense | PLACEHOLDER_URL_15 | $199 | Monthly |
| Sovereign | PLACEHOLDER_URL_SOVEREIGN | $999 | Monthly |
| Imperium | PLACEHOLDER_URL_IMPERIUM | $9,999 | Monthly |

### API Endpoint (Node.js / Express)
```javascript
// server.js — Stripe checkout session creator
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, planName } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://primedoxai.ca/success?session={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://primedoxai.ca/pricing',
    metadata: { planName, source: 'primedox_web' },
    billing_address_collection: 'required',
    customer_email: req.body.email || undefined,
  });

  res.json({ sessionId: session.id });
});

// Webhook for subscription events
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // Grant access, send welcome email
      break;
    case 'customer.subscription.deleted':
      // Revoke access
      break;
    case 'invoice.payment_failed':
      // Send dunning email
      break;
  }
  res.json({ received: true });
});

app.listen(3000);
```

### Interac e-Transfer (Manual Flow)
```
Send to: derek@franciscoholdings.com
Auto-deposit: enabled (no password needed)
Memo format: "PrimeDox [TIER] — [your email]"
Example: "PrimeDox Pro Defense — yourname@email.com"
Access granted within 2 hours of receipt confirmation.
```

### PayPal Integration
```html
<!-- PayPal Button (embed on pricing page) -->
<div id="paypal-button-container-primedox-pro"></div>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=CAD&intent=subscription&vault=true"></script>
<script>
paypal.Buttons({
  style: { shape: 'rect', color: 'black', layout: 'vertical', label: 'subscribe' },
  createSubscription: function(data, actions) {
    return actions.subscription.create({ 'plan_id': 'P-YOUR_PAYPAL_PLAN_ID' });
  },
  onApprove: function(data, actions) {
    alert('PrimeDox Pro activated. Subscription ID: ' + data.subscriptionID);
    window.location.href = '/success?sub=' + data.subscriptionID;
  }
}).render('#paypal-button-container-primedox-pro');
</script>
```

---

## SECTION 4: DEPLOYMENT CHECKLIST

### Phase 1 — Pre-Launch (Day 1)

#### Stripe Setup
- [ ] Create Stripe account (or sub-account under Tech Pet Cage)
- [ ] Create 4 products: Pro Defense / Elite Defense / Sovereign / Imperium
- [ ] Create monthly recurring prices in CAD for each
- [ ] Generate 4 Stripe payment links (PLACEHOLDER_URL_14, 15, SOVEREIGN, IMPERIUM)
- [ ] Replace all `PLACEHOLDER_URL_` in `primedox-v3.html` with real Stripe URLs
- [ ] Test purchase with card `4242 4242 4242 4242`, exp `12/29`, CVC `123`
- [ ] Verify Stripe dashboard shows test purchase

#### GitHub Pages Deploy
```bash
# From your local machine:
export GH_TOKEN="ghp_YOUR_TOKEN"
export GH_USER="franciscoderek7"

# Create primedoxai-site repo (if not exists)
curl -H "Authorization: token $GH_TOKEN" \
  -d '{"name":"primedoxai-site","private":false}' \
  https://api.github.com/user/repos

# Copy primedox-v3.html → index.html and push
cp primedoxai-site/primedox-v3.html primedoxai-site/index.html
cd primedoxai-site
git init
git add index.html
git commit -m "PrimeDox AI v3 — The Motherboard"
git push https://x-access-token:${GH_TOKEN}@github.com/${GH_USER}/primedoxai-site.git main

# Enable GitHub Pages via API
curl -X POST -H "Authorization: token $GH_TOKEN" \
  -d '{"source":{"branch":"main","path":"/"}}' \
  https://api.github.com/repos/${GH_USER}/primedoxai-site/pages
```

- [ ] Site live at: `https://franciscoderek7.github.io/primedoxai-site`
- [ ] HTTPS enforced (automatic on GitHub Pages)
- [ ] Custom domain: Point `primedoxai.ca` CNAME to `franciscoderek7.github.io`

#### Custom Domain (Namecheap / GoDaddy)
```
Type: CNAME
Host: www
Value: franciscoderek7.github.io
TTL: 3600

Type: A (for apex domain)
Host: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```
- [ ] Add `CNAME` file to repo with content: `primedoxai.ca`
- [ ] Enable "Enforce HTTPS" in GitHub Pages settings

### Phase 2 — Mobile App (Week 1-2)

#### Development Setup
```bash
npx create-expo-app@latest primedox-mobile --template blank-typescript
cd primedox-mobile
npx expo install @stripe/stripe-react-native expo-local-authentication expo-notifications
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install @reduxjs/toolkit react-redux
```

#### TestFlight (iOS Beta)
- [ ] Enroll in Apple Developer Program ($99 USD/year)
- [ ] Create App ID: `com.franciscoholdings.primedox`
- [ ] Generate provisioning profile
- [ ] `npx eas build --platform ios --profile preview`
- [ ] Upload to App Store Connect
- [ ] Invite 10 beta testers via TestFlight

#### Google Play Beta
- [ ] Create Google Play Console account ($25 USD one-time)
- [ ] `npx eas build --platform android --profile preview`
- [ ] Upload AAB to Play Console → Internal Testing track
- [ ] Add 5-10 internal testers

#### App Store Submission (Week 2-4)
- [ ] Screenshots (6.7" iPhone + iPad): 5 required screenshots
- [ ] App icon: 1024×1024 PNG, no alpha
- [ ] Privacy policy URL: `primedoxai.ca/privacy`
- [ ] Review notes: "Test account: test@primedox.ca / Password123!"
- [ ] Select categories: Business (primary) / Productivity (secondary)

### Phase 3 — Marketing (Week 2+)

#### Email Campaign
- [ ] Upload all Weedlaw Weekly subscribers
- [ ] Send: "PrimeDox AI is live — control all 41 companies from your phone"
- [ ] Trigger 5-email onboarding sequence on signup

#### Social Media Launch
- [ ] Twitter/X thread: "I built an AI motherboard for 41 companies from my phone. Here's how."
- [ ] LinkedIn article: "PrimeDox AI: Why I built the operating system for a 41-company empire"
- [ ] YouTube shorts: 3 × 60-second demos of different AI heroes
- [ ] Reddit: r/entrepreneur, r/canada, r/legaladvice (education only, CCLDR)

#### Referral Activation
- [ ] Add PrimeDox to referral program page (20% recurring)
- [ ] Create `?ref=yourname` tracking for all 5 tiers
- [ ] Announce to existing CCLDR + CleanSwarm customers first

### Phase 4 — Revenue Targets

| Week | Target | Path |
|------|--------|------|
| 1 | 5 Pro subscriptions | $245/mo — email list warm traffic |
| 2 | 3 Elite + 10 Pro | $1,087/mo — referral program activation |
| 4 | 2 Sovereign + 10 Elite + 25 Pro | $4,123/mo — social media + App Store |
| 8 | 1 Imperium + mix | $14,000+/mo — Fortune 500 outreach |

---

## QUICK REFERENCE

```
PRIMEDOX CONTACT:
Derek Francisco | CEO
derek@franciscoholdings.com
705-307-8080
Telegram: @OmniguardSec_bot
Kent Street West, Lindsay ON K9V 2Z8

STRIPE KEYS (replace before launch):
Publishable: pk_test_...
Secret: sk_test_... (NEVER commit to GitHub)

PRICE IDs (after Stripe setup):
Pro:       PLACEHOLDER_URL_14
Elite:     PLACEHOLDER_URL_15
Sovereign: PLACEHOLDER_URL_SOVEREIGN
Imperium:  PLACEHOLDER_URL_IMPERIUM

LEGAL DISCLAIMER (all CCLDR/LexMind content):
NOT LEGAL REPRESENTATION — EDUCATION ONLY
```

---
*© 2026 PrimeDox AI. A Francisco Holdings Inc. Company.*
*🌿 Carbon Neutral 2028 | OmniaGuard Protected | BENO-X Framework*
