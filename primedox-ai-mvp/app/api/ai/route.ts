import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const supabase = supabaseServer();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt: string | undefined = body?.prompt;
  const mode: string | undefined = body?.mode;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  if (!mode || typeof mode !== "string") {
    return NextResponse.json({ error: "mode is required" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // Atomic usage gate — locks the user's row, increments only if under their limit.
  const { data: gate, error: gateError } = await admin.rpc("consume_request", {
    user_uuid: authData.user.id,
  });

  if (gateError) {
    return NextResponse.json({ error: gateError.message }, { status: 500 });
  }

  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: "Usage limit reached for your plan.",
        usage: { current: gate.current, limit: gate.limit },
        upgrade_to: gate.upgrade_to,
      },
      { status: 403 }
    );
  }

  const { data: modeRule } = await admin
    .from("mode_rules")
    .select("max_tokens, system_prompt")
    .eq("mode", mode)
    .single();

  const systemPrompt = modeRule?.system_prompt ?? "You are PrimeDox AI, a helpful assistant.";
  const maxTokens = modeRule?.max_tokens ?? 800;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errBody = await openaiRes.text();
    return NextResponse.json({ error: `OpenAI request failed: ${errBody}` }, { status: 502 });
  }

  const openaiData = await openaiRes.json();
  const outputText: string = openaiData.choices?.[0]?.message?.content ?? "";
  const tokensUsed: number = openaiData.usage?.total_tokens ?? 0;

  await admin.from("ai_outputs").insert({
    user_id: authData.user.id,
    input_prompt: prompt,
    output_text: outputText,
    task_type: mode,
    mode,
    tokens_used: tokensUsed,
  });

  return NextResponse.json({
    output: outputText,
    tokens_used: tokensUsed,
    usage: { current: gate.current, limit: gate.limit },
  });
}
