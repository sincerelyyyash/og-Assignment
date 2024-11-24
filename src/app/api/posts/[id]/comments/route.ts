import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestContext {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RequestContext) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      Children: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });
  return NextResponse.json(post?.Children || []);
}

export async function POST(req: Request, { params }: RequestContext) {
  const { id } = await params;
  const { content } = await req.json();
  const parentPost = await prisma.post.findUnique({ where: { id } });
  const comment = await prisma.comment.create({
    data: {
      content,
      postId: id,
    },
  });
  return NextResponse.json(comment, { status: 201 });
}
