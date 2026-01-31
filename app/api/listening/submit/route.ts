import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { answers } = body as {
    answers: { exerciseId: number; answer: string }[];
  };

  if (!answers || !Array.isArray(answers)) {
    return NextResponse.json({ error: "answers array required" }, { status: 400 });
  }

  const exerciseIds = answers.map((a) => a.exerciseId);
  const exercises = await prisma.listeningExercise.findMany({
    where: { id: { in: exerciseIds } },
  });

  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  let correct = 0;

  const results = answers.map((a) => {
    const exercise = exerciseMap.get(a.exerciseId);
    if (!exercise) return { exerciseId: a.exerciseId, correct: false, correctAnswer: "" };

    const isCorrect =
      a.answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
    if (isCorrect) correct++;

    return {
      exerciseId: a.exerciseId,
      correct: isCorrect,
      correctAnswer: exercise.correctAnswer,
    };
  });

  await prisma.studySession.create({
    data: {
      sessionId,
      module: "listening",
      itemsPracticed: answers.length,
      score: answers.length > 0 ? correct / answers.length : 0,
      endedAt: new Date(),
    },
  });

  return NextResponse.json({
    results,
    score: correct,
    total: answers.length,
    percentage: answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0,
  });
}
