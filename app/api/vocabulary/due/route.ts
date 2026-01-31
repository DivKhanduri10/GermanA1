import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  const dueProgress = await prisma.userProgress.findMany({
    where: {
      sessionId,
      progressType: "vocabulary",
      nextReview: { lte: new Date() },
    },
    take: limit,
    orderBy: { nextReview: "asc" },
  });

  if (dueProgress.length === 0) {
    return NextResponse.json({ words: [], count: 0 });
  }

  const wordIds = dueProgress.map((p) => p.itemId);
  const words = await prisma.vocabulary.findMany({
    where: { id: { in: wordIds } },
  });

  // Attach SRS data to each word
  const wordsWithSRS = words.map((word) => {
    const progress = dueProgress.find((p) => p.itemId === word.id);
    return {
      ...word,
      srs: progress
        ? {
            easeFactor: progress.easeFactor,
            interval: progress.interval,
            repetitions: progress.repetitions,
            status: progress.status,
          }
        : null,
    };
  });

  return NextResponse.json({ words: wordsWithSRS, count: wordsWithSRS.length });
}
