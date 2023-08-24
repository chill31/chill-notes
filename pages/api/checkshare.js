import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const body = JSON.parse(req.body);

  try {
    const check = await prisma.note.findUnique({
      where: {
        uuid: body.uuid
      }
    });
    if (check === null) {
      res.status(400).json({ msg: 'failed', code: 400 });
    } else {
      res.status(200).json({ msg: JSON.stringify(check), code: 200 });
    }
  } catch (e) {
    res.status(400).json({ msg: 'failed', code: 400 })
  }

}