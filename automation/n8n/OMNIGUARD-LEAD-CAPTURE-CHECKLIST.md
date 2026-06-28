# OmniGuard Lead Capture — Deployment Checklist

Four deliverables for this deploy phase, all authored in this commit:

1. `automation/supabase-omniguard-leads-update.sql` — adds the `message` column
   to the existing `leads` table.
2. `automation/n8n/workflow-7-omniguard-lead-capture.json` — Webhook -> Supabase
   -> Gmail -> Telegram.
3. `omni-guard-site/lead-form.html` — branded contact form (blue `#4A90E2` /
   pink `#E91E63`, no personal info, no nav changes to the existing site).
4. This checklist.

## Steps, in order

- [ ] **Run the SQL.** Supabase dashboard -> SQL Editor -> New query -> paste
  `automation/supabase-omniguard-leads-update.sql` -> Run. Skip this only if
  the `message` column already exists.
- [ ] **Import the workflow.** n8n -> Workflows -> Import from File ->
  `workflow-7-omniguard-lead-capture.json`.
- [ ] **Attach credentials.** Connect the same Supabase credential used by
  Workflow 1/2 to the "Insert Lead (Supabase)" node, and a Gmail credential to
  "Send Confirmation Email."
- [ ] **Telegram bot setup** (not done here — needs Derek's own bot + chat ID):
  1. In Telegram, message **@BotFather**, run `/newbot`, follow the prompts to
     get a bot token.
  2. In n8n, create a Telegram credential using that bot token.
  3. Message **@userinfobot** in Telegram to get your numeric chat ID.
  4. Open the "Notify Derek (Telegram)" node and replace
     `REPLACE-WITH-DEREK-TELEGRAM-CHAT-ID` with that chat ID.
  5. Send your new bot a `/start` message first — Telegram bots can't message
     a chat ID until the user has initiated contact with the bot at least once.
- [ ] **Activate the workflow**, then copy the "OmniGuard Lead Webhook" node's
  Production URL (Webhook node -> double-click -> Production URL, only visible
  once the workflow is active).
- [ ] **Wire the form.** Open `omni-guard-site/lead-form.html`, find
  `const WEBHOOK_URL = 'REPLACE-WITH-N8N-WEBHOOK-PRODUCTION-URL';` near the
  bottom, and paste the Production URL in.
- [ ] **Test end-to-end**: submit the form once with a real email you control —
  confirm a row lands in Supabase `leads` (source = `omniguard-site`), the
  confirmation email arrives, and the Telegram alert arrives.
- [ ] **Deploy the page.** `lead-form.html` lives in `omni-guard-site/` — it
  ships wherever that repo/folder is already deployed. It is not currently
  linked from `omni-guard-site/index.html`'s nav; link to it (or leave it
  direct-link-only) is your call, not made here.

## Known gaps, called out rather than silently assumed

- The Telegram chat ID and bot credential are **not** filled in — per
  CLAUDE.md, Claude does not fabricate contact identifiers. Both require you
  to do the one-time Telegram setup above.
- The webhook Production URL can't be known until the workflow is imported and
  activated inside your n8n instance — that's a value n8n generates, not
  something determinable from this repo.
- `lead-form.html` is not linked from the site's main navigation — wiring it in
  (or keeping it as an unlinked direct-link page) wasn't specified, so it's
  left as a standalone page rather than guessing at nav placement.
