import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {

  const recievedData = JSON.parse(req.body);
  const createdNote = await prisma.note.create({
    data: recievedData
  });


  res.status(200).json({ uuid: recievedData.uuid });
}