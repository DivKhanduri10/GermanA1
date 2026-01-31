"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleCards } from "@/components/dashboard/module-cards";
import { BookOpen, GraduationCap, Target, Clock, Flame } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const vocabLearned = stats?.vocabulary.learned ?? 0;
  const vocabTotal = stats?.vocabulary.total ?? 0;
  const grammarCompleted = stats?.grammar.completedTopics ?? 0;
  const grammarTotal = stats?.grammar.totalTopics ?? 0;
  const studyMinutes = stats?.overview.totalStudyTimeMinutes ?? 0;
  const streak = stats?.overview.studyStreak ?? 0;

  // Simple readiness estimate
  const vocabPct = vocabTotal > 0 ? (vocabLearned / vocabTotal) * 100 : 0;
  const grammarPct = grammarTotal > 0 ? (grammarCompleted / grammarTotal) * 100 : 0;
  const readiness = Math.round((vocabPct + grammarPct) / 2);

  const studyHours = studyMinutes >= 60 ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m` : `${studyMinutes}m`;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Goethe A1 Exam Prep
        </h1>
        <p className="text-muted-foreground mt-1">
          Prepare for the Goethe-Zertifikat A1 (Start Deutsch 1) exam with
          structured learning and practice.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vocabLearned} / {vocabTotal || "–"}
            </div>
            <p className="text-xs text-muted-foreground">vocabulary words</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grammar Topics</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grammarCompleted} / {grammarTotal || "–"}
            </div>
            <p className="text-xs text-muted-foreground">topics completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exam Readiness</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readiness}%</div>
            <p className="text-xs text-muted-foreground">overall progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyHours}</div>
            <p className="text-xs text-muted-foreground">total study time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} day{streak !== 1 ? "s" : ""}</div>
            <p className="text-xs text-muted-foreground">study streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Learning Modules</h2>
        <ModuleCards />
      </div>
    </div>
  );
}
