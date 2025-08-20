// pages/api/analyze.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to try one model and fall back if needed
async function completeWithFallback(messages) {
  const tryModels = ["gpt-4o-mini", "gpt-3.5-turbo"];
  let lastError;

  for (const model of tryModels) {
    try {
      console.log(`Trying model: ${model}`);
      const resp = await client.chat.completions.create({
        model,
        messages,
        max_tokens: 500, // safe token limit
      });

      console.log("OpenAI response:", resp);

      const content = resp?.choices?.[0]?.message?.content;
      if (content) return content;

      throw new Error("No content returned from AI");
    } catch (err) {
      console.error(`Error with model ${model}:`, err);
      lastError = err;
      if (err?.status !== 429 && err?.status !== 404) break;
    }
  }

  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.OPENAI_API_KEY)
    return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: "Scenario is required" });

    const coachingPrompt = `
You are a structured life coach.
Always respond using this 4-step method:

1) Clarify: Briefly restate the user's situation in your own words (1–2 sentences).
2) Explore: Offer 2–3 perspectives or options the user could consider (bulleted).
3) Guide: Recommend one practical next step the user can take today (numbered).
4) Reflect: End with a short, open-ended question to prompt self-reflection.

Keep it concise, kind, and actionable.
`;

    const messages = [
      { role: "system", content: coachingPrompt },
      { role: "user", content: `User scenario: ${scenario}` },
    ];

    const analysis = await completeWithFallback(messages);

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("OpenAI API error:", error);
    const msg =
      error?.status === 401
        ? "Invalid OpenAI API key"
        : error?.status === 429
        ? "OpenAI quota exceeded. Check plan/billing."
        : "Something went wrong while connecting to OpenAI";
    res.status(500).json({ error: msg });
  }
}
