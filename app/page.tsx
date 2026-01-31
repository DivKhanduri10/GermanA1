"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ModuleCards } from "@/components/dashboard/module-cards";
import {
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  overview: {
    totalStudySessions: number;
    studyStreak: number;
    totalStudyTimeMinutes: number;
  };
  vocabulary: {
    total: number;
    learned: number;
  };
  grammar: {
    totalTopics: number;
    completedTopics: number;
  };
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const vocabLearned = stats?.vocabulary.learned ?? 0;
  const vocabTotal = stats?.vocabulary.total ?? 0;
  const grammarCompleted = stats?.grammar.completedTopics ?? 0;
  const grammarTotal = stats?.grammar.totalTopics ?? 0;
  const studyMinutes = stats?.overview.totalStudyTimeMinutes ?? 0;
  const streak = stats?.overview.studyStreak ?? 0;

  const vocabPct = vocabTotal > 0 ? (vocabLearned / vocabTotal) * 100 : 0;
  const grammarPct =
    grammarTotal > 0 ? (grammarCompleted / grammarTotal) * 100 : 0;
  const readiness = Math.round((vocabPct + grammarPct) / 2);

  const studyHours =
    studyMinutes >= 60
      ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`
      : `${studyMinutes}m`;

  const isNewUser =
    !loading && vocabLearned === 0 && grammarCompleted === 0 && streak === 0;

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNewUser ? "Welcome to Goethe A1 Prep" : "Willkommen zurück!"}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {isNewUser
                ? "Start your journey to pass the Goethe-Zertifikat A1 (Start Deutsch 1) exam. Choose a module below to begin learning."
                : `Continue your journey toward the Goethe-Zertifikat A1 exam. Your overall readiness is at ${readiness}%.`}
            </p>
          </div>
          {!isNewUser && (
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {readiness}%
                </div>
                <div className="text-xs text-muted-foreground">Exam Ready</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 flex items-center gap-1">
                  <Flame className="h-6 w-6" />
                  {streak}
                </div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          )}
        </div>

        {isNewUser && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/vocabulary/flashcards">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Start with Vocabulary
              </Button>
            </Link>
            <Link href="/grammar">
              <Button variant="outline">
                <GraduationCap className="mr-2 h-4 w-4" />
                Learn Grammar
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="h-7 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-1.5 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-blue-200 dark:border-blue-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Words Learned
              </CardTitle>
              <div className="rounded-full p-1.5 bg-blue-100 dark:bg-blue-950">
                <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {vocabLearned}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {vocabTotal || "–"}
                </span>
              </div>
              <Progress value={vocabPct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Grammar Topics
              </CardTitle>
              <div className="rounded-full p-1.5 bg-green-100 dark:bg-green-950">
                <GraduationCap className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grammarCompleted}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {grammarTotal || "–"}
                </span>
              </div>
              <Progress value={grammarPct} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Exam Readiness
              </CardTitle>
              <div className="rounded-full p-1.5 bg-purple-100 dark:bg-purple-950">
                <Target className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readiness}%</div>
              <Progress value={readiness} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-cyan-200 dark:border-cyan-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <div className="rounded-full p-1.5 bg-cyan-100 dark:bg-cyan-950">
                <Clock className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyHours}</div>
              <p className="text-xs text-muted-foreground mt-1">
                total study time
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <div className="rounded-full p-1.5 bg-orange-100 dark:bg-orange-950">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {streak} day{streak !== 1 ? "s" : ""}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {streak > 0 ? "Keep it up!" : "Start studying today!"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Learning Modules</h2>
          <Link href="/progress">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              View Progress
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        <ModuleCards />
      </div>
    </div>
  );
}
