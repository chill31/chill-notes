import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {

  if(req.method === "POST") {
      
  const recievedData = JSON.parse(req.body);
  const createdNote = await prisma.note.create({
    data: recievedData
  });


  return res.status(200).json({ uuid: createdNote.uuid });
  }
  else{
    return res.status(200).json({ msg: "Only POST method allowed", code: 405 });
  }

}