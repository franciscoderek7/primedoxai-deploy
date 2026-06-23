# Empire Automation — n8n + Supabase

Supabase project: **Tech Pet Cage** (East US / North Virginia, free tier, Healthy/Production)
Project URL: `https://qbdkjfyzhjrhmmgmtbac.supabase.co`

The Supabase **secret/service_role key** Derek provided is NOT stored in this repo —
it only goes into n8n's encrypted credential store (Supabase node → Credentials → New
→ paste the Project URL above + the secret key). Never commit that key to git.

**Before anything else**: run `supabase/migrations/002_subscribers.sql` and
`supabase/migrations/003_full_schema.sql` in the Supabase SQL Editor (dashboard →
SQL Editor → New query → paste → Run), in that order. Claude can't run these directly
— the service_role key works through the data API (PostgREST), which doesn't expose
schema-creation (DDL) statements, only reads/writes to tables that already exist. The
SQL Editor is the only way to create the tables themselves.

## Workflow 1 — PrimeDox $49 Trial (payment → access) — v1, no PayPal API keys

File: `workflow-1-primedox-trial.json`. Manual form (you fill it in after seeing a
payment land) → Gmail welcome email → Google Sheet CRM log. Full setup steps were
already covered when this was first built — see the file's own structure; the
4-node manual-rebuild instructions are below if import fails.

**Upgrade now that Supabase is live**: add a Supabase node after "Normalize Fields"
→ insert into the `subscribers` table (Project URL + secret key as set up above), in
addition to (or instead of) the Google Sheet.

Manual rebuild if JSON import fails: **Form Trigger** (Payer Name, Payer Email,
Tier dropdown, Amount Paid CAD, PayPal Transaction ID) → **Gmail** send welcome email
→ **Google Sheets** append row → (optional) **Supabase** insert into `subscribers`.

## Workflow 2 — Lead Capture → Nurture Sequence

File: `workflow-2-lead-capture-nurture.json`. Webhook receives `{email, source,
company_interest}` → inserts into `leads` table (Supabase) → confirmation email →
wait → educational email → wait → offer email → wait → re-check lead status → if
still not converted, sends a final email to the lead AND flags Derek by email.

**Known gap — not yet wired up**: no site currently POSTs to this webhook. None of
the 100+ company sites' contact forms have been pointed at it. That's a separate,
larger task (editing each site's form `action`/JS submit handler) — not done here
since it wasn't explicitly scoped, and touching every site's forms unprompted would
be a large, risky, unrequested change. Tell Claude which sites' lead forms to wire up
first and that becomes its own scoped task.

**Wait durations are cumulative, not absolute**: the three Wait nodes are set to
1 day, then +2 days, then +4 days — landing on day 1, day 3, and day 7 from signup
as in the original spec. If you change one Wait node's duration, the later ones shift
too unless you adjust them to compensate.

Setup: import the JSON, connect the Supabase credential (same one as Workflow 1) and
a Gmail credential to all 5 Gmail nodes, copy the webhook's Production URL once
active.

## Workflow 3 — Email Routing (Safe Auto-Response)

File: `workflow-3-email-routing-BUILD-GUIDE.md` — not shipped as JSON. This one needs
a separate Gmail OAuth sign-in per monitored inbox (omniaguard1@, docweedlaw@,
techpetcage@, franciscoderek7@gmail.com), which you have to click through in n8n's UI
regardless of import — so the guide gets you there as fast as a JSON file would, with
less risk of it failing to import. Uses a zero-cost keyword classifier (no OpenAI/
Anthropic key needed) that defaults to "flag for Derek" on anything it doesn't
recognize — it never guesses on legal/partnership/complaint mail.

## Status of the deployment checklist Derek sent

- [x] Supabase tables defined (`002_subscribers.sql`, `003_full_schema.sql`) —
  **needs Derek to run them in the SQL Editor**, Claude cannot execute DDL remotely.
- [x] Workflow 1 JSON (payment → database → email) — needs Gmail/Sheets OAuth + the
  new Supabase node added per the upgrade note above.
- [x] Workflow 2 JSON (lead capture → nurture) — needs Gmail/Supabase credentials;
  needs site forms wired to its webhook (separate task, not yet scoped/done).
- [x] Workflow 3 build guide (email routing) — needs 4x Gmail OAuth sign-ins, no
  importable JSON by design (see above).
- [ ] Chatbot knowledge content — see `automation/chatbot-knowledge/` (separate
  delivery, company FAQ/pricing/contact reference docs — not a live chatbot, no
  chatbot platform is connected anywhere).
- [ ] "Test every PayPal button on all sites" — not literally testable without a
  browser; a link-format audit (handle/typo check) was run instead — see commit notes
  for the flagged-link report.
- [ ] Mobile responsiveness — fixed for the new paywall pricing grid on
  `cases.html`; a full audit of all 100+ legacy site folders was not attempted (out
  of scope for this pass — flag specific sites if you want them checked).
- [x] Commit and push.

Don't wire up real PayPal/Gmail/AI API keys until the free-tier manual versions above
are tested end-to-end — same zero-cost-first rule as before.
