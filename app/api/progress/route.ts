import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET() {
  const sessionId = await getSessionId();

  // Get all user progress records
  const progress = await prisma.userProgress.findMany({
    where: { sessionId },
  });

  // Get all study sessions
  const studySessions = await prisma.studySession.findMany({
    where: { sessionId },
    orderBy: { startedAt: "desc" },
  });

  // Get writing submissions
  const writingSubmissions = await prisma.writingSubmission.findMany({
    where: { sessionId },
  });

  // Aggregate by module
  const vocabProgress = progress.filter((p) => p.progressType === "vocabulary");
  const grammarProgress = progress.filter((p) => p.progressType === "grammar");
  const speakingProgress = progress.filter((p) => p.progressType === "speaking");

  // Count totals from DB
  const [totalVocab, totalGrammarTopics, totalWritingPrompts, totalSpeakingPrompts] =
    await Promise.all([
      prisma.vocabulary.count(),
      prisma.grammarTopic.count(),
      prisma.writingPrompt.count(),
      prisma.speakingPrompt.count(),
    ]);

  // Calculate vocabulary stats
  const vocabLearned = vocabProgress.filter((p) => p.status === "learned" || p.status === "mastered").length;
  const vocabMastered = vocabProgress.filter((p) => p.status === "mastered").length;
  const vocabCorrect = vocabProgress.reduce((sum, p) => sum + p.correctCount, 0);
  const vocabIncorrect = vocabProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const vocabTotal = vocabCorrect + vocabIncorrect;

  // Calculate grammar stats
  const grammarCompleted = grammarProgress.filter(
    (p) => p.status === "learned" || p.status === "mastered"
  ).length;
  const grammarCorrect = grammarProgress.reduce((sum, p) => sum + p.correctCount, 0);
  const grammarIncorrect = grammarProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const grammarTotal = grammarCorrect + grammarIncorrect;

  // Study sessions by module
  const sessionsByModule: Record<string, { count: number; totalScore: number; totalDuration: number }> = {};
  for (const session of studySessions) {
    if (!sessionsByModule[session.module]) {
      sessionsByModule[session.module] = { count: 0, totalScore: 0, totalDuration: 0 };
    }
    sessionsByModule[session.module].count++;
    sessionsByModule[session.module].totalScore += session.score || 0;
    sessionsByModule[session.module].totalDuration += session.durationSeconds || 0;
  }

  // Study activity by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = studySessions.filter(
    (s) => new Date(s.startedAt) >= thirtyDaysAgo
  );

  const activityByDay: Record<string, { sessions: number; score: number }> = {};
  for (const session of recentSessions) {
    const day = new Date(session.startedAt).toISOString().split("T")[0];
    if (!activityByDay[day]) {
      activityByDay[day] = { sessions: 0, score: 0 };
    }
    activityByDay[day].sessions++;
    activityByDay[day].score += session.score || 0;
  }

  // Calculate study streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    if (activityByDay[dateStr]) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Module scores for radar/bar chart
  const moduleScores = Object.entries(sessionsByModule).map(([module, data]) => ({
    module,
    averageScore: data.count > 0 ? Math.round((data.totalScore / data.count) * 100) : 0,
    sessionsCompleted: data.count,
    totalDuration: data.totalDuration,
  }));

  // Recent activity for chart
  const activityChart = Object.entries(activityByDay)
    .map(([date, data]) => ({
      date,
      sessions: data.sessions,
      avgScore: data.sessions > 0 ? Math.round((data.score / data.sessions) * 100) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Weak areas analysis
  const weakAreas: { area: string; accuracy: number; suggestion: string }[] = [];
  if (vocabTotal > 5 && vocabCorrect / vocabTotal < 0.6) {
    weakAreas.push({
      area: "Vocabulary",
      accuracy: Math.round((vocabCorrect / vocabTotal) * 100),
      suggestion: "Review flashcards daily using spaced repetition",
    });
  }
  if (grammarTotal > 5 && grammarCorrect / grammarTotal < 0.6) {
    weakAreas.push({
      area: "Grammar",
      accuracy: Math.round((grammarCorrect / grammarTotal) * 100),
      suggestion: "Focus on grammar exercises for topics with low scores",
    });
  }

  return NextResponse.json({
    overview: {
      totalStudySessions: studySessions.length,
      studyStreak: streak,
      totalStudyTimeMinutes: Math.round(
        studySessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
      ),
    },
    vocabulary: {
      total: totalVocab,
      learned: vocabLearned,
      mastered: vocabMastered,
      accuracy: vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 0,
      dueForReview: vocabProgress.filter(
        (p) => p.nextReview && new Date(p.nextReview) <= new Date()
      ).length,
    },
    grammar: {
      totalTopics: totalGrammarTopics,
      completedTopics: grammarCompleted,
      accuracy: grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 0,
    },
    reading: {
      sessionsCompleted: sessionsByModule["reading"]?.count || 0,
      averageScore: sessionsByModule["reading"]
        ? Math.round(
            (sessionsByModule["reading"].totalScore / sessionsByModule["reading"].count) * 100
          )
        : 0,
    },
    listening: {
      sessionsCompleted: sessionsByModule["listening"]?.count || 0,
      averageScore: sessionsByModule["listening"]
        ? Math.round(
            (sessionsByModule["listening"].totalScore / sessionsByModule["listening"].count) * 100
          )
        : 0,
    },
    writing: {
      totalSubmissions: writingSubmissions.length,
      averageScore: writingSubmissions.length > 0
        ? Math.round(
            (writingSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) /
              writingSubmissions.length) * 100
          )
        : 0,
      totalPrompts: totalWritingPrompts,
    },
    speaking: {
      promptsPracticed: speakingProgress.length,
      totalPrompts: totalSpeakingPrompts,
      averageConfidence: speakingProgress.length > 0
        ? Math.round(
            (speakingProgress.reduce((sum, p) => sum + p.correctCount, 0) /
              Math.max(
                speakingProgress.reduce((sum, p) => sum + p.correctCount + p.incorrectCount, 0),
                1
              )) * 100
          )
        : 0,
    },
    moduleScores,
    activityChart,
    weakAreas,
  });
}
