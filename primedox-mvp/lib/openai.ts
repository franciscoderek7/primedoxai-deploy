type CompletionResult = {
  output: string;
  tokensUsed: number;
};

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number
): Promise<CompletionResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI request failed: ${errBody}`);
  }

  const data = await res.json();
  return {
    output: data.choices?.[0]?.message?.content ?? "",
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}
