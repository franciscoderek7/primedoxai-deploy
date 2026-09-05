# DEF Property Maintenance — Deployment & Production Prerequisites

## Information Required from Dylan Before Launch

### Contact Information (do not publish without authorization)
- [ ] Phone number (mobile and/or office)
- [ ] Email address (primary business email)
- [ ] Website URL / domain (for DEF_PUBLIC_URL)
- [ ] Physical service address or mailing address (if any)
- [ ] Social media accounts (if any — LinkedIn, etc.)

### Business Information
- [ ] Business registration number (if applicable)
- [ ] HST/GST number (if applicable)
- [ ] Insurance information (type, provider — if to be displayed)
- [ ] Locksmith credentials or affiliated qualified personnel names
- [ ] Any professional certifications or associations

### Service & Pricing
- [ ] Confirmed service pricing or ranges (if to display)
- [ ] Service area boundaries (exact vs. case-by-case)
- [ ] Seasonal service schedule (when spring/fall operations begin)

---

## Technical Integrations Pending

### Database
- [ ] `DATABASE_URL` — PostgreSQL connection string (Supabase recommended)
- Run migrations: `npx drizzle-kit push` after DATABASE_URL is set
- Tables: `def_leads`, `def_properties`, `def_projects`

### Email Notifications
- [ ] `RESEND_API_KEY` — Resend API key for lead notifications
- [ ] `DEF_NOTIFY_EMAIL` — Email address to receive consultation notifications
- [ ] Verify sender domain in Resend dashboard
- [ ] Update `from:` address in `/app/api/consultation/route.ts` to verified domain

### AI
- [ ] `ANTHROPIC_API_KEY` — Required for DEF AI chat (/def-ai)
- Already configured in route.ts — just set the env var

### Platform Configuration
- [ ] `DEF_PUBLIC_URL` — Production URL (used in sitemap, QR codes, vCard)
- [ ] QR code generation — generate actual QR code pointing to `DEF_PUBLIC_URL/consultation`
- [ ] Replace placeholder QR grid in `/app/card/page.tsx` with real QR image

### FHI AI Council (Future)
- [ ] `FHI_COUNCIL_ENDPOINT` — FHI council API endpoint
- [ ] `FHI_COUNCIL_API_KEY` — Council authentication key
- All council calls are non-fatal stubs until these are configured

---

## Production Deployment Checklist

1. Set all required environment variables in hosting platform
2. Run database migrations (`npx drizzle-kit push`)
3. Verify Resend sender domain
4. Test consultation form end-to-end
5. Test DEF AI chat (requires ANTHROPIC_API_KEY)
6. Generate and embed real QR code for business card and /card page
7. Confirm all Dylan contact information is correct before publishing
8. Remove placeholder text from any pages that need it
9. Review all legal disclaimers with Dylan
10. Set up domain and DNS (requires Derek/Dylan authorization — do not do autonomously)

---

## Security Architecture

- API routes are server-side only — no credentials exposed to browser
- DEF AI API key is never sent to the client
- Dashboard (`/dashboard`) is disallowed in robots.txt
- vCard download is client-side generated from static strings — no server roundtrip
- No payment processing integrated — all financial decisions require human authorization
- OMNIAGUARD-compatible security boundaries — Vigilax governs security/risk/auth layer (pending FHI_COUNCIL_ENDPOINT)

---

## Scalability Roadmap (Architecture Ready, Not Built)

**Year 1:** Single operator (Dylan), manual CRM through dashboard, consultation form → email → phone
**Regional expansion:** Additional service areas, contractor network, dashboard for team assignments
**SaaS potential:** AI Property 360™ platform licensing to other property managers

No automation of pricing, contracts, or billing without Dylan's explicit authorization at each stage.
