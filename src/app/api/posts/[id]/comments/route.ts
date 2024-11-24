
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
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
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  let content;
  try {
    const body = await req.json();
    content = body?.content;
    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }
    const parentPost = await prisma.post.findUnique({
      where: { id },
    });
    if (!parentPost) {
      return NextResponse.json({ error: "Parent post or comment not found" }, { status: 404 });
    }
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: id,
      },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

