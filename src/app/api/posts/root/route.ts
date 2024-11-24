
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("page_size") || "10", 10);

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          parentId: null,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { timestamp: "desc" },
      }),
      prisma.post.count({
        where: { parentId: null },
      }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching posts." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

