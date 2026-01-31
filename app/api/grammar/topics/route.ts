import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getSessionId();

  const topics = await prisma.grammarTopic.findMany({
    orderBy: { difficultyOrder: "asc" },
    include: {
      _count: { select: { exercises: true } },
    },
  });

  // Get progress for each topic
  const progress = await prisma.userProgress.findMany({
    where: { sessionId, progressType: "grammar" },
    select: { itemId: true, status: true, correctCount: true, incorrectCount: true },
  });

  const progressMap = new Map(progress.map((p) => [p.itemId, p]));

  const topicsWithProgress = topics.map((topic) => {
    const p = progressMap.get(topic.id);
    return {
      ...topic,
      exerciseCount: topic._count.exercises,
      progress: p
        ? {
            status: p.status,
            correctCount: p.correctCount,
            incorrectCount: p.incorrectCount,
          }
        : null,
    };
  });

  return NextResponse.json({ topics: topicsWithProgress });
}
