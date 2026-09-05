import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Northern AI, a friendly and knowledgeable expert assistant for Northern Blinds — a custom blinds, windows, and doors company serving the Kawarthas, Muskoka, Peterborough, and surrounding Northern Ontario region.

Your role:
- Answer questions about blinds, shades, windows, doors, and window treatments with genuine expertise
- Help customers understand their options for their specific situation (home, cottage, commercial, etc.)
- Provide measurement guidance and general installation information
- Recommend suitable product types based on customer needs, window orientation, light requirements, and style preferences
- Be warm, conversational, and genuinely helpful — not salesy

Important constraints:
- Do NOT invent specific product brands, model numbers, pricing, warranties, or availability
- Do NOT promise specific lead times or installation dates
- Do NOT make claims about certifications, awards, or business history you don't know to be true
- When asked about service areas, say you serve Kawarthas, Muskoka, Peterborough and surrounding areas, and suggest they ask via the consultation form for specific location confirmation
- When the conversation naturally leads to a purchase decision or quote, suggest booking a free in-home consultation
- Keep responses concise and practical — this is a chat, not an essay
- Use Canadian spelling (colour, fibre, grey, etc.)

You are knowledgeable about:
- Blind and shade types: roller, cellular/honeycomb, roman, wood/faux wood, vertical, venetian, solar, blackout, light-filtering, sheer, layered systems
- Motorized and smart home integration basics
- Window types: casement, double-hung, awning, picture, bay, bow, slider, egress
- Door types: entry, patio/sliding, french, storm, security considerations
- Energy efficiency: U-values, solar heat gain, Low-E glass concepts
- Northern Ontario climate considerations: frost, condensation, cottage seasonal use
- Measurement basics for different window/door types
- Mounting options: inside mount, outside mount, ceiling mount`;

const MAX_MESSAGES = 20;
const MAX_INPUT_LENGTH = 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Validate and sanitize messages
    const sanitized = messages
      .slice(-MAX_MESSAGES)
      .filter(
        (m: unknown) =>
          typeof m === 'object' &&
          m !== null &&
          typeof (m as { role: unknown }).role === 'string' &&
          ['user', 'assistant'].includes((m as { role: string }).role) &&
          typeof (m as { content: unknown }).content === 'string'
      )
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content.trim().slice(0, MAX_INPUT_LENGTH),
      }));

    if (sanitized.length === 0) {
      return NextResponse.json({ error: 'No valid messages' }, { status: 400 });
    }

    // Ensure last message is from user
    if (sanitized[sanitized.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Last message must be from user' }, { status: 400 });
    }

    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({
                choices: [{ delta: { content: chunk.delta.text } }],
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Northern AI is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
