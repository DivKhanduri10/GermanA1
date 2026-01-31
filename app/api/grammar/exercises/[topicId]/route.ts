import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const { topicId } = await params;
  const id = parseInt(topicId);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid topic ID" }, { status: 400 });
  }

  const exercises = await prisma.grammarExercise.findMany({
    where: { topicId: id },
    orderBy: { difficulty: "asc" },
  });

  return NextResponse.json({ exercises });
}
