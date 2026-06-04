# BUILDNEXT.md — Auto Swarm Inc. Autonomous Build Instructions
# Authority: PrimeDox (Derek Francisco)
# Executor: Claude — build continuously until PrimeDox says stop

---

## Mission

Auto Swarm Inc. is the autonomous vehicle intelligence division of Francisco Holdings Inc.
Market: $556B AV industry. 14 AI agents protecting every layer of the AV stack.
Target customer: Tier 1 AV manufacturers, fleet operators, insurance companies, regulators.

Build this site until it is the most compelling AV AI security product page on the internet.

---

## Current State

- index.html: 706 lines — base site live at franciscoderek7.github.io/auto-swarm-site/
- Payment: mailto fallback to partnerships@franciscoholdings.com
- No Stripe links yet (pending Derek providing buy.stripe.com URLs)
- No custom domain yet

---

## Build Queue — Execute In Order

### PHASE 1 — Content & Conversion (Do Now)

1. **Add AV threat demo section**
   - Animated ticker showing real AV attack vectors: sensor spoofing, LiDAR poisoning, GPS jamming, OTA injection, CAN bus infiltration
   - Each attack: name + frequency + damage + "BLOCKED BY AUTO SWARM" status

2. **Upgrade pricing section**
   - Tier 1 Fleet: $2,499/mo — up to 50 vehicles, 14 agents
   - Tier 2 Enterprise: $9,999/mo — up to 500 vehicles, priority response
   - Tier 3 OEM Partner: $49,999/mo — white-label, SDK access, co-brand
   - Tier 4 Regulatory: Contact — government fleet, Transport Canada compliance
   - All buttons → mailto:partnerships@franciscoholdings.com (Stripe links to be added)

3. **Add compliance table**
   - Transport Canada AV regulations
   - SAE Level 2–5 certification support
   - ISO 26262 (functional safety)
   - UNECE WP.29 (cybersecurity for vehicles)
   - NIST CSF for transportation

4. **Add customer segments section**
   - Tesla/Waymo-tier OEMs (white-label)
   - Robo-taxi fleets (Uber ATG, Cruise)
   - Logistics AV (TuSimple, Aurora)
   - Insurance carriers (AV underwriting AI)
   - Regulators (Transport Canada, NHTSA)

5. **Add 14-agent breakdown**
   - Agent 1: Sensor Integrity Monitor
   - Agent 2: LiDAR Spoof Detector
   - Agent 3: GPS Authenticity Verifier
   - Agent 4: OTA Update Validator
   - Agent 5: CAN Bus Anomaly Detector
   - Agent 6: V2X Communication Guard
   - Agent 7: Perception Stack Validator
   - Agent 8: Decision Layer Auditor
   - Agent 9: Fleet Coordination Monitor
   - Agent 10: Regulatory Compliance Agent
   - Agent 11: Insurance Risk Modeler
   - Agent 12: Incident Response Coordinator
   - Agent 13: Firmware Integrity Scanner
   - Agent 14: Zero-Day Threat Intelligence

### PHASE 2 — Trust & Authority

6. **Add market size section**
   - $556B AV market by 2035
   - 33% of all AV incidents involve cybersecurity failures (source: Upstream Auto 2024)
   - Average cost of AV recall from security flaw: $900M+
   - Auto Swarm: the only 14-agent protection suite for AV stacks

7. **Add case study placeholders**
   - "Fleet operator reduced insurance premium 23% after Auto Swarm deployment"
   - "OEM passed Transport Canada AV certification on first attempt"
   - "Tier 1 supplier: zero CAN bus incidents in 18 months"

8. **Add ROI calculator**
   - Input: fleet size + current incident rate
   - Output: projected cost savings vs Auto Swarm subscription cost

### PHASE 3 — Deploy

9. **Register domain**: autoswarm.ai or autoswarm.ca (~$80 CAD)
10. **Add CNAME** + GitHub Pages custom domain config
11. **Wire Stripe links** when Derek provides buy.stripe.com URLs
12. **Add SoulStack observer node** (copy SOULSTACK.md from primedoxai-deploy root)

---

## Brand Rules (Enforce Always)

- Company name: **Auto Swarm Inc.** — never "AutoSwarm", "Autoswarm", "auto swarm"
- Parent: Francisco Holdings Inc. — invisible unless on About page
- Contact: partnerships@franciscoholdings.com — never personal email
- Derek Francisco: INVISIBLE on this site
- Cannabis: ZERO bleed — never
- OmniaGuard: Do not reference directly — "AI agent protection infrastructure" only

---

## Deploy Command

After every change:
```bash
cp /home/user/primedoxai-deploy/auto-swarm-site/index.html /tmp/deploy-auto-swarm-site/index.html
cd /tmp/deploy-auto-swarm-site
git add index.html
git commit -m "build(auto-swarm): [describe change]"
git push origin main
```

Live at: https://franciscoderek7.github.io/auto-swarm-site/

---

## Authority

All builds execute under PrimeDox authority.
SoulStack monitors. Claude builds. PrimeDox approves direction.
No autonomous structural changes — content and feature additions only.

*Auto Swarm Inc. | Francisco Holdings Empire | SoulStack Node Active*
