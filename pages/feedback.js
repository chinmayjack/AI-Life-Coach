import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { scenario, analysis, rating } = req.body;
    const feedback = await prisma.feedback.create({
      data: { scenario, analysis, rating },
    });
    res.json(feedback);
  } else if (req.method === 'GET') {
    const feedbacks = await prisma.feedback.findMany();
    res.json(feedbacks);
  }
}
