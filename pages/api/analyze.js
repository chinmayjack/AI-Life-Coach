// pages/api/analyze.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { scenario, persona } = req.body;

    if (!scenario || !persona) {
      return res.status(400).json({ error: "Missing scenario or persona" });
    }

    // 🔹 Dynamically build system prompt with persona
    const systemPrompt = `You are an AI Life Context Coach. 
Persona: ${persona}.
Adapt your tone, style, and advice based on this persona.
Always provide thoughtful, supportive, and actionable guidance.`;

    // Set headers for streaming response
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: scenario },
      ],
      stream: true,
    });

    // 🔹 Stream chunks back to frontend
    for await (const chunk of completion) {
      const token = chunk.choices[0]?.delta?.content || "";
      if (token) {
        res.write(token);
      }
    }

    res.end();
  } catch (err) {
    console.error("Error in /api/analyze:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
