import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { promptId, selfRating, durationSeconds } = body as {
    promptId: number;
    selfRating: number; // 1-5
    durationSeconds?: number;
  };

  if (!promptId || !selfRating) {
    return NextResponse.json(
      { error: "promptId and selfRating are required" },
      { status: 400 }
    );
  }

  // Update user progress
  await prisma.userProgress.upsert({
    where: {
      sessionId_progressType_itemId: {
        sessionId,
        progressType: "speaking",
        itemId: promptId,
      },
    },
    update: {
      correctCount: { increment: selfRating >= 3 ? 1 : 0 },
      incorrectCount: { increment: selfRating < 3 ? 1 : 0 },
      lastReviewed: new Date(),
    },
    create: {
      sessionId,
      progressType: "speaking",
      itemId: promptId,
      status: selfRating >= 3 ? "learned" : "learning",
      correctCount: selfRating >= 3 ? 1 : 0,
      incorrectCount: selfRating < 3 ? 1 : 0,
      lastReviewed: new Date(),
    },
  });

  // Save study session
  await prisma.studySession.create({
    data: {
      sessionId,
      module: "speaking",
      itemsPracticed: 1,
      score: selfRating / 5,
      durationSeconds: durationSeconds || null,
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
