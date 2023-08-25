import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const body = JSON.parse(req.body);

  const deleteUser = await prisma.note.delete({
    where: {
      uuid: body.uuid
    },
  });
  res.status(200).json({ msg: 'removed the note' });
}