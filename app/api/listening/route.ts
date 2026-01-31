import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const partNumber = request.nextUrl.searchParams.get("part");

  const where = partNumber ? { partNumber: parseInt(partNumber) } : {};

  const exercises = await prisma.listeningExercise.findMany({
    where,
    orderBy: [{ setId: "asc" }, { id: "asc" }],
  });

  // Group by setId
  const sets = new Map<number, typeof exercises>();
  for (const ex of exercises) {
    if (!sets.has(ex.setId)) sets.set(ex.setId, []);
    sets.get(ex.setId)!.push(ex);
  }

  return NextResponse.json({
    exercises,
    sets: Array.from(sets.entries()).map(([setId, items]) => ({
      setId,
      partNumber: items[0].partNumber,
      transcript: items[0].transcript,
      questions: items.map((q) => ({
        id: q.id,
        question: q.question,
        questionType: q.questionType,
        options: q.options,
      })),
    })),
  });
}
