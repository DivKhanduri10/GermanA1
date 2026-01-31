import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const topic = await prisma.grammarTopic.findUnique({
    where: { topicSlug: slug },
    include: {
      _count: { select: { exercises: true } },
    },
  });

  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  return NextResponse.json({ topic });
}
