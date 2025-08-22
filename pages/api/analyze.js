// pages/api/analyze.js
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { scenario, persona, userId } = req.body;

    // 1️⃣ Create conversation
    const conversation = await prisma.conversation.create({
      data: { persona, userId: userId || null },
    });

    // 2️⃣ Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: scenario,
        conversationId: conversation.id,
      },
    });

    // 3️⃣ Set headers for streaming
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      Connection: "keep-alive",
    });

    let fullResponse = "";

    // 4️⃣ Stream AI response
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: `You are acting as a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
    });

    for await (const event of completion) {
      const content = event.choices?.[0]?.delta?.content || "";
      if (content) {
        res.write(content);
        fullResponse += content;
      }
    }

    // 5️⃣ Save assistant reply (after stream ends)
    await prisma.message.create({
      data: {
        role: "assistant",
        content: fullResponse,
        conversationId: conversation.id,
      },
    });

    res.end();
  } catch (err) {
    console.error("API ERROR:", err);
    // Don’t send JSON mid-stream — just plain text
    if (!res.headersSent) {
      res.status(500).send("Internal server error");
    }
  } finally {
    // ⚠️ Don't disconnect too early — let Prisma pool persist
    // await prisma.$disconnect();  // REMOVE this in API routes
  }
}
