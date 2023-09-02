export const config = {
  runtime: "edge",
};

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  if (req.method === "POST") {
    try {
      const check = await prisma.note.findUnique({
        where: {
          uuid: body.uuid,
        },
      });
      if (check === null) {
        return res.status(400).json({ msg: "failed", code: 400 });
      } else {
        return res.status(200).json({ msg: JSON.stringify(check), code: 200 });
      }
    } catch (e) {
      return res.status(400).json({ msg: "failed", code: 400 });
    }
  }
  else {
    return res.status(200).json({ msg: "Only POST method allowed", code: 405 });
  }
}
