// pages/api/analyze.js
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const prisma = new PrismaClient();

export const config = {
  runtime: "edge", // required for streaming
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { scenario, persona, userId } = await req.json();

    // 1️⃣ Create conversation
    const conversation = await prisma.conversation.create({
      data: { persona, userId: userId || null },
    });

    // 2️⃣ Save user message
    await prisma.message.create({
      data: { role: "user", content: scenario, conversationId: conversation.id },
    });

    // 3️⃣ Create AI stream
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are acting as a ${persona} coach.` },
        { role: "user", content: scenario },
      ],
      stream: true,
    });

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
              fullResponse += content;
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        } finally {
          controller.close();

          // 4️⃣ Save AI response once streaming is done
          await prisma.message.create({
            data: {
              role: "assistant",
              content: fullResponse,
              conversationId: conversation.id,
            },
          });

          await prisma.$disconnect();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
