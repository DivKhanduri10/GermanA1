"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Brain,
  Headphones,
  FileText,
  PenLine,
  Mic,
  Flame,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface ProgressData {
  overview: {
    totalStudySessions: number;
    studyStreak: number;
    totalStudyTimeMinutes: number;
  };
  vocabulary: {
    total: number;
    learned: number;
    mastered: number;
    accuracy: number;
    dueForReview: number;
  };
  grammar: {
    totalTopics: number;
    completedTopics: number;
    accuracy: number;
  };
  reading: {
    sessionsCompleted: number;
    averageScore: number;
  };
  listening: {
    sessionsCompleted: number;
    averageScore: number;
  };
  writing: {
    totalSubmissions: number;
    averageScore: number;
    totalPrompts: number;
  };
  speaking: {
    promptsPracticed: number;
    totalPrompts: number;
    averageConfidence: number;
  };
  moduleScores: {
    module: string;
    averageScore: number;
    sessionsCompleted: number;
    totalDuration: number;
  }[];
  activityChart: {
    date: string;
    sessions: number;
    avgScore: number;
  }[];
  weakAreas: {
    area: string;
    accuracy: number;
    suggestion: string;
  }[];
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      const res = await fetch("/api/progress");
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to fetch progress");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Failed to load progress data.</p>
        <Button onClick={fetchProgress} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const moduleNames: Record<string, string> = {
    vocabulary: "Vocabulary",
    grammar: "Grammar",
    reading: "Reading",
    listening: "Listening",
    writing: "Writing",
    speaking: "Speaking",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey toward the Goethe A1 exam
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-orange-100 dark:bg-orange-950">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">
                  {data.overview.studyStreak} day
                  {data.overview.studyStreak !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-950">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">
                  {data.overview.totalStudySessions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-950">
                <Clock className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Time</p>
                <p className="text-2xl font-bold">
                  {data.overview.totalStudyTimeMinutes} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-950">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Words Learned</p>
                <p className="text-2xl font-bold">
                  {data.vocabulary.learned}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {data.vocabulary.total}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Vocabulary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>
                {data.vocabulary.learned} / {data.vocabulary.total} words
              </span>
              <span className="text-muted-foreground">
                {data.vocabulary.total > 0
                  ? Math.round(
                      (data.vocabulary.learned / data.vocabulary.total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                data.vocabulary.total > 0
                  ? (data.vocabulary.learned / data.vocabulary.total) * 100
                  : 0
              }
              className="h-2"
            />
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">
                {data.vocabulary.mastered} mastered
              </Badge>
              <Badge variant="outline">
                {data.vocabulary.accuracy}% accuracy
              </Badge>
              {data.vocabulary.dueForReview > 0 && (
                <Badge variant="destructive">
                  {data.vocabulary.dueForReview} due for review
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grammar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              Grammar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>
                {data.grammar.completedTopics} / {data.grammar.totalTopics}{" "}
                topics
              </span>
              <span className="text-muted-foreground">
                {data.grammar.totalTopics > 0
                  ? Math.round(
                      (data.grammar.completedTopics /
                        data.grammar.totalTopics) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                data.grammar.totalTopics > 0
                  ? (data.grammar.completedTopics / data.grammar.totalTopics) *
                    100
                  : 0
              }
              className="h-2"
            />
            <div className="flex gap-2">
              <Badge variant="outline">{data.grammar.accuracy}% accuracy</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Reading */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Reading
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span>{data.reading.sessionsCompleted} exercises completed</span>
            </div>
            <Progress value={data.reading.averageScore} className="h-2" />
            <Badge variant="outline">
              {data.reading.averageScore}% average score
            </Badge>
          </CardContent>
        </Card>

        {/* Listening */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Headphones className="h-4 w-4 text-cyan-500" />
              Listening
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span>
                {data.listening.sessionsCompleted} exercises completed
              </span>
            </div>
            <Progress value={data.listening.averageScore} className="h-2" />
            <Badge variant="outline">
              {data.listening.averageScore}% average score
            </Badge>
          </CardContent>
        </Card>

        {/* Writing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PenLine className="h-4 w-4 text-orange-500" />
              Writing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>
                {data.writing.totalSubmissions} submission
                {data.writing.totalSubmissions !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground">
                of {data.writing.totalPrompts} prompts
              </span>
            </div>
            <Progress value={data.writing.averageScore} className="h-2" />
            <Badge variant="outline">
              {data.writing.averageScore}% average score
            </Badge>
          </CardContent>
        </Card>

        {/* Speaking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-4 w-4 text-red-500" />
              Speaking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{data.speaking.promptsPracticed} prompts practiced</span>
              <span className="text-muted-foreground">
                of {data.speaking.totalPrompts}
              </span>
            </div>
            <Progress
              value={
                data.speaking.totalPrompts > 0
                  ? (data.speaking.promptsPracticed /
                      data.speaking.totalPrompts) *
                    100
                  : 0
              }
              className="h-2"
            />
            <Badge variant="outline">
              {data.speaking.averageConfidence}% confidence
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Study Activity (Last 30 Days)
            </CardTitle>
            <CardDescription>Daily sessions and average scores</CardDescription>
          </CardHeader>
          <CardContent>
            {data.activityChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.activityChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) =>
                      new Date(String(d)).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(d) =>
                      new Date(String(d)).toLocaleDateString("en", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#3b82f6"
                    name="Sessions"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#22c55e"
                    name="Avg Score %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-muted-foreground">
                  No study activity yet. Start learning to see your progress!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Module Performance
            </CardTitle>
            <CardDescription>Average score per module</CardDescription>
          </CardHeader>
          <CardContent>
            {data.moduleScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.moduleScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="module"
                    tickFormatter={(m) => moduleNames[String(m)] || String(m)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(m) => moduleNames[String(m)] || String(m)}
                    formatter={(value) => [`${value}%`, "Avg Score"]}
                  />
                  <Bar
                    dataKey="averageScore"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Average Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <p className="text-sm text-muted-foreground">
                  Complete exercises to see module performance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak Areas */}
      {data.weakAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>
              Focus on these areas to improve your exam readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.weakAreas.map((area, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{area.area}</span>
                      <Badge variant="destructive">{area.accuracy}%</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {area.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam Readiness Estimate</CardTitle>
          <CardDescription>
            Based on your overall progress across all modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const vocabPct =
              data.vocabulary.total > 0
                ? (data.vocabulary.learned / data.vocabulary.total) * 100
                : 0;
            const grammarPct =
              data.grammar.totalTopics > 0
                ? (data.grammar.completedTopics / data.grammar.totalTopics) *
                  100
                : 0;
            const readingPct = data.reading.averageScore;
            const listeningPct = data.listening.averageScore;
            const writingPct = data.writing.averageScore;
            const speakingPct =
              data.speaking.totalPrompts > 0
                ? (data.speaking.promptsPracticed /
                    data.speaking.totalPrompts) *
                  100
                : 0;

            const overall = Math.round(
              vocabPct * 0.2 +
                grammarPct * 0.2 +
                readingPct * 0.2 +
                listeningPct * 0.15 +
                writingPct * 0.15 +
                speakingPct * 0.1
            );

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{overall}%</span>
                  <Badge
                    variant={
                      overall >= 70
                        ? "default"
                        : overall >= 40
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-sm"
                  >
                    {overall >= 70
                      ? "Ready to try!"
                      : overall >= 40
                      ? "Getting there"
                      : "Keep studying"}
                  </Badge>
                </div>
                <Progress value={overall} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  This estimate is based on vocabulary coverage (20%), grammar
                  completion (20%), reading score (20%), listening score (15%),
                  writing score (15%), and speaking practice (10%).
                </p>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
