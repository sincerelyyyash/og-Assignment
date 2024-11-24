
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      Children: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not Found" }, { status: 404 });
  }

  return NextResponse.json(post.Children || []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { content } = await req.json();

  if (!content || content.trim() === "") {
    return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
  }

  try {
    const reply = await prisma.post.create({
      data: {
        content,
        parentId: id,
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }
}

