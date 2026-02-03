import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const sessionId = await getSessionId();

    // Get all speaking prompts
    const prompts = await prisma.speakingPrompt.findMany({
      orderBy: [{ partNumber: "asc" }, { id: "asc" }],
    });

    // Get user's speaking progress
    const progress = await prisma.userProgress.findMany({
      where: {
        sessionId,
        progressType: "speaking",
      },
    });

    // Get speaking study sessions
    const sessions = await prisma.studySession.findMany({
      where: {
        sessionId,
        module: "speaking",
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    // Build progress map
    const progressMap = new Map(
      progress.map((p) => [p.itemId, p])
    );

    // Calculate stats per part
    const partStats = [1, 2, 3].map((partNumber) => {
      const partPrompts = prompts.filter((p) => p.partNumber === partNumber);
      const practiced = partPrompts.filter((p) => progressMap.has(p.id));
      const ratings = practiced
        .map((p) => {
          const prog = progressMap.get(p.id);
          return prog ? prog.correctCount : 0;
        })
        .filter((r) => r > 0);

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return {
        partNumber,
        totalPrompts: partPrompts.length,
        practicedPrompts: practiced.length,
        avgRating: Math.round(avgRating * 10) / 10,
        progressPercent:
          partPrompts.length > 0
            ? Math.round((practiced.length / partPrompts.length) * 100)
            : 0,
      };
    });

    // Calculate overall stats
    const totalPrompts = prompts.length;
    const practicedPrompts = progress.length;
    const totalPracticeTime = sessions.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0
    );
    const avgScore =
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length
        : 0;

    // Recent sessions formatted
    const recentSessions = sessions.map((s) => ({
      id: s.id,
      date: s.startedAt.toISOString(),
      duration: s.durationSeconds || 0,
      score: s.score || 0,
      itemsPracticed: s.itemsPracticed,
    }));

    return NextResponse.json({
      overview: {
        totalPrompts,
        practicedPrompts,
        progressPercent:
          totalPrompts > 0
            ? Math.round((practicedPrompts / totalPrompts) * 100)
            : 0,
        totalPracticeTime,
        avgScore: Math.round(avgScore * 100) / 100,
        totalSessions: sessions.length,
      },
      partStats,
      recentSessions,
    });
  } catch (error) {
    console.error("Failed to fetch speaking stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
