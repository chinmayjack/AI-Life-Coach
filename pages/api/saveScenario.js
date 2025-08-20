import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { input, result, feedback } = req.body;
    const scenario = await prisma.scenario.create({
      data: { input, result, feedback },
    });
    res.status(200).json(scenario);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
