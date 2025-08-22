// pages/api/analyze.js
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { scenario, persona, userId } = req.body; // userId optional

    // 1️⃣ Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        persona,
        userId: userId || null,
      },
    });

    // 2️⃣ Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: scenario,
        conversationId: conversation.id,
      },
    });

    // 3️⃣ Get AI response (non-streaming)
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // fallback later if needed
      messages: [
        { role: "system", content: `You are acting as a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // 4️⃣ Save AI response
    await prisma.message.create({
      data: {
        role: "assistant",
        content: aiResponse,
        conversationId: conversation.id,
      },
    });

    // ✅ Return AI response directly
    res.status(200).json({ response: aiResponse });
  } catch (err) {
    console.error("🔥 API ERROR FULL:", err);
    const message =
      err instanceof Error
        ? `${err.name}: ${err.message}\n${err.stack}`
        : JSON.stringify(err, null, 2);

    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Internal server error", details: message });
    }
  } finally {
    await prisma.$disconnect();
  }
}
