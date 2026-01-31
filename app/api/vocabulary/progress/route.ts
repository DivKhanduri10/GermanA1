import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import { calculateNextReview, type SRSQuality, defaultSRSState } from "@/lib/srs";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { wordId, quality, correct } = body as {
    wordId: number;
    quality?: SRSQuality;
    correct?: boolean;
  };

  if (!wordId) {
    return NextResponse.json({ error: "wordId is required" }, { status: 400 });
  }

  // Find existing progress or create default
  const existing = await prisma.userProgress.findUnique({
    where: {
      sessionId_progressType_itemId: {
        sessionId,
        progressType: "vocabulary",
        itemId: wordId,
      },
    },
  });

  const currentState = existing
    ? {
        easeFactor: existing.easeFactor,
        interval: existing.interval,
        repetitions: existing.repetitions,
      }
    : defaultSRSState;

  // Calculate SRS if quality provided, otherwise just update counts
  const srsQuality = quality ?? (correct ? 4 : 0);
  const result = calculateNextReview(srsQuality as SRSQuality, currentState);

  const isCorrect = correct ?? (srsQuality >= 3);
  const correctCount = (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0);
  const incorrectCount =
    (existing?.incorrectCount ?? 0) + (isCorrect ? 0 : 1);

  // Determine status
  let status = "learning";
  if (result.repetitions >= 3 && result.easeFactor >= 2.0) {
    status = "mastered";
  } else if (result.repetitions > 0) {
    status = "learning";
  }
  if (srsQuality < 3) {
    status = "needs_review";
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      sessionId_progressType_itemId: {
        sessionId,
        progressType: "vocabulary",
        itemId: wordId,
      },
    },
    update: {
      correctCount,
      incorrectCount,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReviewDate,
      lastReviewed: new Date(),
      status,
    },
    create: {
      sessionId,
      progressType: "vocabulary",
      itemId: wordId,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      easeFactor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      nextReview: result.nextReviewDate,
      lastReviewed: new Date(),
      status,
    },
  });

  return NextResponse.json({ progress });
}
