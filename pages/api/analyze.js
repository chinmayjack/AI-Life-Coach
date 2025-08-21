import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { scenario, persona } = req.body;

    // 1. Create conversation row
    const conversation = await prisma.conversation.create({
      data: { persona },
    });

    // 2. Save user message
    await prisma.message.create({
      data: {
        role: "user",
        content: scenario,
        conversationId: conversation.id,
      },
    });

    // 3. Stream AI response
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are acting as a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
      stream: true,
    });

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    });
    res.flushHeaders();

    let fullResponse = "";

    for await (const event of completion) {
      const content = event.choices?.[0]?.delta?.content || "";
      res.write(content);
      fullResponse += content;
    }

    // 4. Save AI response
    await prisma.message.create({
      data: {
        role: "assistant",
        content: fullResponse,
        conversationId: conversation.id,
      },
    });

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
