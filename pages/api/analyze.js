// pages/api/analyze.js
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

export const config = { runtime: "nodejs" };

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { scenario, persona, userId } = req.body;

    if (!scenario || !persona) {
      return res.status(400).json({ error: "Missing scenario or persona" });
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: { persona, userId: userId || null },
    });

    // Save user message
    await prisma.message.create({
      data: { role: "user", content: scenario, conversationId: conversation.id },
    });

    // Call OpenAI (non-streaming)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
    });

    const aiResponse = completion.choices[0]?.message?.content || "No response";

    // Save AI response
    await prisma.message.create({
      data: { role: "assistant", content: aiResponse, conversationId: conversation.id },
    });

    res.status(200).json({ response: aiResponse });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  } finally {
    await prisma.$disconnect();
  }
}
