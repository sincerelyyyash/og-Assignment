import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RequestContext {
  params: {
    id: string;
  };
}

export async function GET(
  req: Request,
  { params }: RequestContext
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

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

export async function POST(
  req: Request,
  { params }: RequestContext
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const body = await req.json();
    const content = body?.content;

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
