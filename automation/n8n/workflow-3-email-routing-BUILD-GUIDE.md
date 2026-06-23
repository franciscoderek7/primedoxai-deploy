# Workflow 3 — Email Routing (Safe Auto-Response) — Build Guide

Not shipped as an importable JSON file. This workflow needs a separate Gmail OAuth
credential per inbox you're monitoring (omniaguard1@gmail.com, docweedlaw@gmail.com,
techpetcage@gmail.com, franciscoderek7@gmail.com), and you have to connect each one
through n8n's UI regardless of whether the workflow arrives pre-built — so a build
guide gets you there just as fast as an import, with less risk of node-schema
mismatches breaking the import.

## What it does

For each monitored inbox, an incoming email is classified by keyword, then either
auto-replied (FAQ/pricing only) or silently flagged for you — never both, never
guessed into a reply if it's ambiguous.

## Per-inbox chain (repeat for omniaguard1, docweedlaw, techpetcage)

1. **Gmail Trigger** node — credential: sign in as that inbox. Polls for new mail.
2. **Code** node (`classifyEmail`) — keyword match against the subject+body, no AI
   API key needed for v1:
   ```js
   const text = ($json.subject + ' ' + $json.snippet).toLowerCase();
   const legalWords = ['lawsuit', 'legal action', 'cease and desist', 'lawyer', 'sue', 'dispute', 'complaint'];
   const partnerWords = ['partnership', 'partner with', 'collaborate', 'sponsorship', 'investment'];
   const salesWords = ['price', 'pricing', 'cost', 'buy', 'purchase', 'subscribe'];
   const faqWords = ['how does', 'how do i', 'what is', 'question'];

   let category = 'other';
   if (legalWords.some(w => text.includes(w))) category = 'legal';
   else if (partnerWords.some(w => text.includes(w))) category = 'partnership';
   else if (salesWords.some(w => text.includes(w))) category = 'sales';
   else if (faqWords.some(w => text.includes(w))) category = 'faq';

   return [{ json: { ...$json, category } }];
   ```
3. **IF** node — condition: `category` is `faq` OR `sales` (safe to auto-respond).
   - **TRUE branch** → **Gmail** node → reply from the same inbox with the matching
     template for that company (pull from `automation/chatbot-knowledge/<company>.md`
     pricing/FAQ section — paste the relevant lines into the node's message field).
   - **FALSE branch** (legal / partnership / complaint / other — anything ambiguous
     defaults here, by design) → **Gmail** node → label the email `Needs Review` (no
     reply sent) — optionally also forward a copy to franciscoderek7@gmail.com if you
     want a single inbox to check instead of four.
4. **Supabase** node (both branches) → insert into `email_logs`: to_email, from_email,
   subject, body snippet, status = `sent` (if auto-replied) or `flagged` (if not).

## franciscoderek7@gmail.com (general inbox)

Same Gmail Trigger → Code (classify, optional — you already read everything here) →
Supabase log only. No auto-reply branch at all — this inbox never gets bot replies,
per the explicit rule that general/legal/partnership mail always needs your judgment.

## Why no AI classifier in v1

Keyword matching is zero-cost (no OpenAI/Anthropic API key needed) and fails *safe* —
anything it doesn't recognize falls into "other" and gets flagged for you instead of
risking an auto-reply to something sensitive. Upgrade to an LLM-based classifier later
if the keyword list starts missing too many real FAQ/sales emails (you'll see it in
the `email_logs` table — lots of `flagged` rows that were actually simple questions
is the signal to upgrade).
