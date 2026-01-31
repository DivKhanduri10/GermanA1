"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryCard } from "@/components/vocabulary/category-card";
import { BookOpen, RotateCcw, Brain, Gamepad2 } from "lucide-react";
import Link from "next/link";

interface CategoryStat {
  category: string;
  total: number;
  started: number;
  mastered: number;
}

interface VocabStats {
  totalWords: number;
  mastered: number;
  learning: number;
  needsReview: number;
  dueForReview: number;
  notStarted: number;
  categoryStats: CategoryStat[];
}

export default function VocabularyPage() {
  const [stats, setStats] = useState<VocabStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vocabulary/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
        <p className="text-muted-foreground mt-1">
          Learn 650 essential German words for the Goethe A1 exam
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.mastered ?? 0} / {stats?.totalWords ?? 650}
            </div>
            <p className="text-xs text-muted-foreground">mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.learning ?? 0}</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due for Review</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.dueForReview ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">words to review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.notStarted ?? 0}</div>
            <p className="text-xs text-muted-foreground">words remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/vocabulary/flashcards">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Flashcards
          </Button>
        </Link>
        <Link href="/vocabulary/flashcards?mode=review">
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Review Due Words
            {stats?.dueForReview ? (
              <Badge variant="secondary" className="ml-2">
                {stats.dueForReview}
              </Badge>
            ) : null}
          </Button>
        </Link>
        <Link href="/vocabulary/quiz">
          <Button variant="outline">
            <Brain className="mr-2 h-4 w-4" />
            Quiz
          </Button>
        </Link>
        <Link href="/vocabulary/games">
          <Button variant="outline">
            <Gamepad2 className="mr-2 h-4 w-4" />
            Matching Game
          </Button>
        </Link>
      </div>

      {/* Category Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats?.categoryStats.map((cat) => (
            <CategoryCard
              key={cat.category}
              category={cat.category}
              total={cat.total}
              started={cat.started}
              mastered={cat.mastered}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
