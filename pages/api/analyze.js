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

  const { scenario, persona, userId } = await req.json();

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: { persona, userId: userId || null },
  });

  // Save user message
  await prisma.message.create({
    data: { role: "user", content: scenario, conversationId: conversation.id },
  });

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
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || "";
        controller.enqueue(new TextEncoder().encode(content));
        fullResponse += content;
      }
      controller.close();

      // Save AI response after stream ends
      await prisma.message.create({
        data: {
          role: "assistant",
          content: fullResponse,
          conversationId: conversation.id,
        },
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
