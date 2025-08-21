// pages/api/analyze.js
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { scenario, persona, userId } = req.body;

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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are acting as a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
    });

    const aiText = completion.choices[0].message.content;

    // 4️⃣ Save AI response
    await prisma.message.create({
      data: {
        role: "assistant",
        content: aiText,
        conversationId: conversation.id,
      },
    });

    // 5️⃣ Return AI response as JSON
    res.status(200).json({ text: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
