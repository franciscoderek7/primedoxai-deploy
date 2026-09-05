import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic();
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 20;
const MAX_INPUT_LENGTH = 1200;

const SYSTEM_PROMPT = `You are DEF AI — the customer-facing property concierge for DEF Property Maintenance, a cottage country property care and security-focused specialist company founded by Dylan Eric Francisco and serving the Kawarthas, Muskoka, and surrounding areas of Ontario, Canada.

Your role:
- Help potential customers understand DEF's services and whether DEF is the right fit for their property needs
- Answer questions about property maintenance, cottage care, property inspections, locksmith services, security-focused property services, and AI Property 360™ smart monitoring
- Guide customers toward booking a consultation with Dylan

DEF's services:
1. Property Maintenance — year-round upkeep, seasonal prep, repairs, contractor coordination
2. Cottage Care — spring opening, fall closing, regular check-ins, storm response, key management
3. Property Inspections — welfare checks, condition reports, security walkthroughs, insurance visits
4. Locksmith Services — lock installation, re-keying, smart locks, emergency lockout (qualified personnel)
5. Security-Focused Services — vulnerability assessments, camera placement consultation, access control recommendations (NOT licensed alarm monitoring, NOT emergency response, NOT security guard services)
6. AI Property 360™ — connected monitoring platform: cameras, temperature, water detection, smart access, power monitoring, environmental sensors, alerts, property intelligence reports

Important constraints — always follow these:
- Never fabricate contact information (phone, email, address, website) — direct customers to the consultation form
- Never claim DEF provides emergency response, licensed alarm monitoring, or security guard services
- Never state specific pricing — direct to consultation
- Never invent credentials, certifications, or insurance claims
- If asked about emergency situations (fire, break-in in progress, medical), tell them to call 911 immediately
- Use Canadian spelling (neighbour, colour, centre, etc.)
- Be warm, professional, direct — cottage country tone, not corporate
- Keep responses concise — 2-4 short paragraphs max unless a detailed list is genuinely helpful
- Always offer to help schedule a consultation as the next step

When you don't know something specific about Dylan's availability, pricing, or property-specific details, say "That's a great question for Dylan directly — starting a consultation is the best way to get that answered for your specific property."

Opening for new conversations: "Tell us about your property and what you need help with."`;

type MessageRole = 'user' | 'assistant';
type ConversationMessage = { role: MessageRole; content: string };

export async function POST(request: NextRequest) {
  let body: { messages?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!Array.isArray(body.messages)) {
    return new Response(JSON.stringify({ error: 'messages must be an array' }), { status: 400 });
  }

  const messages: ConversationMessage[] = body.messages
    .filter((m): m is { role: string; content: string } =>
      typeof m === 'object' && m !== null &&
      'role' in m && 'content' in m &&
      (m as { role: string }).role === 'user' || (m as { role: string }).role === 'assistant'
    )
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role as MessageRole,
      content: String(m.content).slice(0, MAX_INPUT_LENGTH),
    }));

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid messages' }), { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== 'user') {
    return new Response(JSON.stringify({ error: 'Last message must be from user' }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      const send = (data: string) => {
        controller.enqueue(enc.encode(`data: ${data}\n\n`));
      };

      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: 600,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const chunk of response) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            send(JSON.stringify({ choices: [{ delta: { content: chunk.delta.text } }] }));
          }
        }

        send('[DONE]');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send(JSON.stringify({ error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
