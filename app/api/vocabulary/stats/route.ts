import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getSessionId();

  const [totalWords, progress, categories] = await Promise.all([
    prisma.vocabulary.count(),
    prisma.userProgress.findMany({
      where: { sessionId, progressType: "vocabulary" },
      select: { itemId: true, status: true, nextReview: true },
    }),
    prisma.vocabulary.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  const mastered = progress.filter((p) => p.status === "mastered").length;
  const learning = progress.filter((p) => p.status === "learning").length;
  const needsReview = progress.filter(
    (p) => p.status === "needs_review"
  ).length;
  const dueForReview = progress.filter(
    (p) => p.nextReview && new Date(p.nextReview) <= new Date()
  ).length;
  const notStarted = totalWords - progress.length;

  // Get per-category progress
  const progressItemIds = new Set(progress.map((p) => p.itemId));
  const masteredItemIds = new Set(
    progress.filter((p) => p.status === "mastered").map((p) => p.itemId)
  );

  const categoryStats = await Promise.all(
    categories.map(async (cat) => {
      const categoryWords = await prisma.vocabulary.findMany({
        where: { category: cat.category },
        select: { id: true },
      });
      const total = categoryWords.length;
      const started = categoryWords.filter((w) =>
        progressItemIds.has(w.id)
      ).length;
      const catMastered = categoryWords.filter((w) =>
        masteredItemIds.has(w.id)
      ).length;

      return {
        category: cat.category,
        total,
        started,
        mastered: catMastered,
      };
    })
  );

  return NextResponse.json({
    totalWords,
    mastered,
    learning,
    needsReview,
    dueForReview,
    notStarted,
    categoryStats,
  });
}
