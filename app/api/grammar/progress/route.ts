import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { topicId, score, totalQuestions } = body as {
    topicId: number;
    score: number;
    totalQuestions: number;
  };

  if (!topicId) {
    return NextResponse.json({ error: "topicId is required" }, { status: 400 });
  }

  const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;
  let status = "learning";
  if (accuracy >= 0.8) status = "mastered";
  else if (accuracy >= 0.5) status = "learning";
  else status = "needs_review";

  const progress = await prisma.userProgress.upsert({
    where: {
      sessionId_progressType_itemId: {
        sessionId,
        progressType: "grammar",
        itemId: topicId,
      },
    },
    update: {
      correctCount: { increment: score },
      incorrectCount: { increment: totalQuestions - score },
      lastReviewed: new Date(),
      status,
    },
    create: {
      sessionId,
      progressType: "grammar",
      itemId: topicId,
      correctCount: score,
      incorrectCount: totalQuestions - score,
      lastReviewed: new Date(),
      status,
    },
  });

  // Also record the study session
  await prisma.studySession.create({
    data: {
      sessionId,
      module: "grammar",
      itemsPracticed: totalQuestions,
      score: accuracy,
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ progress });
}
