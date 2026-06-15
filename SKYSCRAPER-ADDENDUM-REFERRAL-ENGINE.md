# SKYSCRAPER ADDENDUM — REFERRAL & COMMISSION ENGINE
## For agent ae76744dd48ba143c — incorporate BEFORE writing final file to disk

---

## REFERRAL DISCOUNT SYSTEM (client-side, localStorage)

### 1. URL Param Detection
On page load: detect `?ref=CODE` → store in localStorage as `fh_ref_code`

### 2. Pre-Checkout Modal (fires on every PayPal button click)
Replace ALL existing PayPal `<a href>` links with:
```javascript
<button onclick="openCheckout('Product Name', PRICE, 'paypal-url')">Buy Now</button>
```

Modal shows:
- Product name + original price
- Input: "Have a referral code? Enter it here" (pre-filled from localStorage if stored)
- On valid code: apply 10% discount → "You save $X with code DEREK001!"
- "Confirm & Pay" → redirect to `https://paypal.me/derekfrancisco/DISCOUNTED_AMOUNTcad`
- If no code: redirect at full price

### 3. Valid Codes Array
```javascript
var FH_VALID_CODES = ['DEREK001', 'EMPIRE10', 'PRIMED10'];
// Plus any AFF- codes are also accepted
```

### 4. Post-Purchase Referral Code Generation
After checkout confirmation:
- Generate: `FH` + random 4 digits (e.g. `FH2847`)
- Store in localStorage as `fh_my_ref_code`
- Show: "Your referral code: FH2847 — Share it. They save 10%. You earn."

---

## AFFILIATE SYSTEM (client-side)

### Affiliate Signup Modal
- Fields: Name + Email
- On submit:
  1. Generate code: `AFF-` + first 4 chars of name uppercased + random 3 digits → e.g. `AFF-DERE-447`
  2. Store in localStorage
  3. Open mailto: `franciscoderek7@gmail.com` with subject "New Affiliate Signup" and body containing name, email, generated code
  4. Show affiliate link: `https://franciscoholdingsinc.com/?ref=AFF-DERE-447`
  5. Copy-to-clipboard button

### Commission Table (display in affiliate modal)
| Product | Price | Rate | Commission |
|---------|-------|------|------------|
| BENO-X Playbook | $49 | 30% | $14.70 |
| PrimeDox AI | $49/mo | 30% recurring | $14.70/mo |
| OmniaGuard Sentinel | $499 | 20% | $99.80 |
| OmniaGuard Warden | $2,499 | 20% | $499.80 |
| OmniaGuard Archon | $9,999 | 15% | $1,499.85 |
| CCLDR Warrior | $99 | 30% | $29.70 |
| CCLDR Sovereign | $1,499 | 20% | $299.80 |
| Swarm Bundle | $299 | 25% | $74.75 |
| Strategy Session | $5,000 | 10% | $500 |

---

## WHERE TO ADD (per floor)

### FLOOR 1 (Lobby) — Below Directory Board
Add affiliate signup banner:
- Headline: "Share the Empire. Earn Forever."
- Sub: "Give 10% off. Get paid 30% commission. Your network is your net worth."
- Counter: "1,247 affiliates earning commissions"
- Social proof: "Empire Affiliates have earned $847,000 in commissions"
- CTA button: "Get My Affiliate Code" → opens affiliate signup modal

### FLOORS 2–8 (every pricing card)
Add "Share & Earn" button next to each PayPal button:
- Click → opens small referral modal: shows user's generated code, copy button, affiliate link

### FLOOR 8 (Penthouse) — Affiliate Dashboard Mockup
```
Your referrals: 47  |  Commissions earned: $3,842  |  This month: $1,247
```
Top affiliates leaderboard:
1. AFF-SARA-291 — $4,200 this month
2. AFF-MIKE-847 — $2,100
3. AFF-JANE-003 — $1,847

---

## EXACT COPY (use verbatim)
- Banner headline: "Share the Empire. Earn Forever."
- Banner sub: "Give 10% off. Get paid 30% commission. Your network is your net worth."
- CTA: "Get My Affiliate Code"
- Post-purchase: "Your referral code: [CODE] — Share it. They save 10%. You earn."
- Social proof: "Sarah from Toronto earned $2,400 sharing PrimeDox AI"

---

## CORE JS PATTERN

```javascript
// URL param → localStorage
(function() {
  var params = new URLSearchParams(window.location.search);
  var ref = params.get('ref');
  if (ref) localStorage.setItem('fh_ref_code', ref);
})();

var FH_VALID_CODES = ['DEREK001', 'EMPIRE10', 'PRIMED10'];

function isValidRefCode(code) {
  if (!code) return false;
  var upper = code.toUpperCase();
  if (upper.startsWith('AFF-')) return true;
  return FH_VALID_CODES.indexOf(upper) !== -1;
}

function openCheckout(productName, price, paypalBase) {
  var storedRef = localStorage.getItem('fh_ref_code') || '';
  // Build and show modal with productName, price, storedRef pre-filled
  // On confirm with valid code: finalPrice = (price * 0.9).toFixed(2)
  // Redirect: 'https://paypal.me/derekfrancisco/' + finalPrice + 'cad'
  // On confirm no code: redirect at full price
}

function generateAffCode(name) {
  var prefix = (name || 'USER').replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
  var digits = Math.floor(100 + Math.random() * 900);
  return 'AFF-' + prefix + '-' + digits;
}

function generateRefCode() {
  return 'FH' + Math.floor(1000 + Math.random() * 9000);
}

function openAffiliateModal() {
  // Show: name input, email input, commission table, submit button
  // On submit: generate code, show link, open mailto
}
```

---

*Addendum written: 2026-06-13 | For skyscraper build by agent ae76744dd48ba143c*
