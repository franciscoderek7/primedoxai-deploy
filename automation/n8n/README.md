# Workflow 1 — PrimeDox $49 Trial — v1 (no API keys needed)

Built per the Phase 1 zero-cost rule: free tools only, no PayPal API keys or Supabase
keys required to go live today. You don't have PayPal Client ID/Secret yet, so this
version skips the PayPal webhook and uses a manual form instead — you fill it in
yourself the moment you see a payment land in PayPal. Upgrade path to full automation
is at the bottom once you have PayPal API keys and your Supabase project is ready.

## How it works

1. A payment shows up in your PayPal account (paypal.me/techpetcage or similar).
2. You open a bookmarked form on your phone (takes 20 seconds), type in the payer's
   name/email/tier/amount.
3. n8n automatically:
   - Sends the payer a welcome email (via your Gmail).
   - Logs the subscriber to a Google Sheet (your CRM/record for now).

No webhook, no API keys, no waiting on PayPal approval for API access.

## Setup (10 minutes)

1. In n8n: **Overview → + → Import from File**, upload
   `automation/n8n/workflow-1-primedox-trial.json`.
   - If your n8n version rejects the import (node schemas do shift between versions),
     don't worry — rebuild it manually in 4 nodes, see "Manual rebuild" below. The
     logic is the same either way.
2. Open the **"Send Welcome Email"** node → Credentials → **Sign in with Google**
   (Gmail). This is just a Google login popup — no key to copy/paste.
3. Open the **"Log to Google Sheet (CRM)"** node → Credentials → sign in with the
   same Google account.
   - Create a Google Sheet first (any name, e.g. "PrimeDox Subscribers") with a tab
     named `Subscribers` and a header row: `Timestamp | Name | Email | Tier | Amount | PayPal Txn ID`.
   - In the node, pick that sheet from the dropdown (replaces the placeholder ID in
     the JSON).
4. Click the **"Payment Logged (Form)"** node → copy the **Test URL** (or **Production
   URL** once you hit Activate) → bookmark it on your phone home screen.
5. Toggle the workflow **Active**.
6. Test: load the form, fill in a fake $1 test entry, submit. Confirm you got the
   welcome email and the Google Sheet row appeared. Then test for real with your next
   actual payment.

## Manual rebuild (if import fails)

4 nodes, connected in order:

1. **Form Trigger** — fields: Payer Name, Payer Email (email type), Tier (dropdown),
   Amount Paid CAD (number), PayPal Transaction ID (optional text).
2. **Set/Edit Fields** — just passes the form fields through (optional — you can skip
   this and reference `$json['Payer Email']` etc. directly in the next two nodes).
3. **Gmail** node → Send Email → To: `{{ $json['Payer Email'] }}` → write your welcome
   message.
4. **Google Sheets** node → Append Row → map the form fields to your sheet columns.

## Upgrade path — once you have real API keys

When you're ready to automate the trigger itself (no more manual form-filling):

- **Get a PayPal webhook**: PayPal Developer Dashboard → My Apps & Credentials →
  create an app (free) → grab Client ID + Secret → Webhooks → Add Webhook → point it
  at your n8n workflow's webhook URL → subscribe to `PAYMENT.CAPTURE.COMPLETED`.
  Replace the Form Trigger node with a **Webhook** node, add an **HTTP Request** node
  to verify the payment amount/status via PayPal's API before continuing.
- **Get Supabase keys**: once your Supabase project (you're creating it now) finishes
  provisioning, go to Project Settings → API → copy the **Project URL** and the
  **service_role key**. Run `supabase/migrations/002_subscribers.sql` in the SQL
  Editor to create the `subscribers` table. Then add a **Supabase** node (or HTTP
  Request node hitting the REST API) after "Normalize Fields" to insert each new
  subscriber row, in addition to (or instead of) the Google Sheet.

Don't add either of these until the manual v1 above is tested and working — confirm
revenue is flowing before spending time wiring up the harder integrations.
