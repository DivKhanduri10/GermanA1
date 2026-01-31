import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getSessionId();

  const [totalTopics, progress] = await Promise.all([
    prisma.grammarTopic.count(),
    prisma.userProgress.findMany({
      where: { sessionId, progressType: "grammar" },
      select: { itemId: true, status: true, correctCount: true, incorrectCount: true },
    }),
  ]);

  const mastered = progress.filter((p) => p.status === "mastered").length;
  const learning = progress.filter((p) => p.status === "learning").length;
  const needsReview = progress.filter((p) => p.status === "needs_review").length;

  const totalCorrect = progress.reduce((sum, p) => sum + p.correctCount, 0);
  const totalIncorrect = progress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const totalAttempts = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return NextResponse.json({
    totalTopics,
    completed: mastered,
    learning,
    needsReview,
    notStarted: totalTopics - progress.length,
    overallAccuracy,
  });
}
