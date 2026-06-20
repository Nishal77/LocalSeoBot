import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateText(prompt: string, maxTokens = 500): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}
