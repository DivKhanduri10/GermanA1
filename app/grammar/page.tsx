"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";

interface GrammarTopicWithProgress {
  id: number;
  topicName: string;
  topicSlug: string;
  description: string | null;
  difficultyOrder: number;
  exerciseCount: number;
  progress: {
    status: string;
    correctCount: number;
    incorrectCount: number;
  } | null;
}

export default function GrammarPage() {
  const [topics, setTopics] = useState<GrammarTopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grammar/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data.topics || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completed = topics.filter((t) => t.progress?.status === "mastered").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grammar</h1>
          <p className="text-muted-foreground mt-1">
            Master 14 core A1 grammar topics with interactive exercises
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-2 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grammar</h1>
        <p className="text-muted-foreground mt-1">
          Master 14 core A1 grammar topics with interactive exercises
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {completed} of {topics.length} topics completed
            </span>
            <span className="text-sm text-muted-foreground">
              {topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0}%
            </span>
          </div>
          <Progress
            value={topics.length > 0 ? (completed / topics.length) * 100 : 0}
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Topics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) => {
          const isMastered = topic.progress?.status === "mastered";
          const isStarted = topic.progress !== null;
          const accuracy =
            topic.progress &&
            topic.progress.correctCount + topic.progress.incorrectCount > 0
              ? Math.round(
                  (topic.progress.correctCount /
                    (topic.progress.correctCount + topic.progress.incorrectCount)) *
                    100
                )
              : null;

          return (
            <Card key={topic.id} className="flex flex-col hover:shadow-md hover:border-primary/30 transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <CardTitle className="text-base">{topic.topicName}</CardTitle>
                  </div>
                  {isMastered && (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                </div>
                {topic.description && (
                  <CardDescription className="mt-1">
                    {topic.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>{topic.exerciseCount} exercises</span>
                  {accuracy !== null && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {accuracy}% accuracy
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/grammar/${topic.topicSlug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      {isStarted ? "Review" : "Learn"}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
