import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { content, parentId } = await req.json();

  if (!content || content.trim().length === 0) {
    return NextResponse.json({
      error: "Content is required"
    }, {
      status: 400
    });
  }

  const post = await prisma.post.create({
    data: {
      content,
      parentId
    },
  });

  return NextResponse.json(post);
}
