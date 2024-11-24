
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

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




export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;  // ID of the post or comment being replied to
  let content;

  try {
    // Parse the JSON body
    const body = await req.json();

    // Check if content exists and is not empty
    content = body?.content;

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    // Check if the parent post or comment exists
    const parentPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!parentPost) {
      return NextResponse.json({ error: "Parent post or comment not found" }, { status: 404 });
    }

    // Create a comment (reply) and link it to the parent post or comment
    const comment = await prisma.comment.create({
      data: {
        content,       // The content of the reply/comment
        postId: id,    // Link the comment to the parent post or comment using postId
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

