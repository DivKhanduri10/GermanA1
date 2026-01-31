"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  questionType: string;
  options: string[];
}

interface ExerciseSet {
  setId: number;
  partNumber: number;
  textContent: string;
  questions: Question[];
}

export default function ReadingPage() {
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState("all");
  const [activeSet, setActiveSet] = useState<ExerciseSet | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, { correct: boolean; correctAnswer: string; explanation?: string }> | null>(null);
  const [score, setScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    const url = selectedPart === "all" ? "/api/reading" : `/api/reading?part=${selectedPart}`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSets(data.sets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPart]);

  const startSet = (set: ExerciseSet) => {
    setActiveSet(set);
    setAnswers({});
    setResults(null);
    setScore(null);
  };

  const submitAnswers = async () => {
    if (!activeSet) return;
    const answerArray = activeSet.questions.map((q) => ({
      exerciseId: q.id,
      answer: answers[q.id] || "",
    }));

    const res = await fetch("/api/reading/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerArray }),
    });
    const data = await res.json();

    const resultMap: Record<number, { correct: boolean; correctAnswer: string; explanation?: string }> = {};
    for (const r of data.results) {
      resultMap[r.exerciseId] = r;
    }
    setResults(resultMap);
    setScore({ score: data.score, total: data.total, percentage: data.percentage });
  };

  const partLabels: Record<number, string> = {
    1: "Part 1: True/False",
    2: "Part 2: Matching",
    3: "Part 3: Multiple Choice",
  };

  // Overview mode
  if (!activeSet) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reading</h1>
          <p className="text-muted-foreground mt-1">
            Practice reading comprehension with emails, ads, and short texts
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Select value={selectedPart} onValueChange={setSelectedPart}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parts</SelectItem>
              <SelectItem value="1">Part 1: True/False</SelectItem>
              <SelectItem value="2">Part 2: Matching</SelectItem>
              <SelectItem value="3">Part 3: Multiple Choice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-5 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded mt-1" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : sets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No reading exercises yet</p>
              <p className="text-sm text-muted-foreground">
                Seed the database to get started with reading comprehension practice.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sets.map((set) => (
              <Card key={set.setId} className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200" onClick={() => startSet(set)}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2">
                    {partLabels[set.partNumber] || `Part ${set.partNumber}`}
                  </Badge>
                  <CardTitle className="text-base">Exercise Set {set.setId}</CardTitle>
                  <CardDescription>
                    {set.questions.length} question{set.questions.length !== 1 ? "s" : ""}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {set.textContent.substring(0, 100)}...
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active exercise mode
  const allAnswered = activeSet.questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setActiveSet(null)}>
          ← Back to exercises
        </Button>
        <Badge variant="outline">
          {partLabels[activeSet.partNumber]}
        </Badge>
      </div>

      {/* Reading Text */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-2">Read the following text:</p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed border-l-4 border-primary/20 pl-4">
            {activeSet.textContent}
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      {score && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{score.score}/{score.total}</div>
            <p className="text-muted-foreground">{score.percentage}% correct</p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {activeSet.questions.map((q, i) => {
          const result = results?.[q.id];
          return (
            <Card key={q.id}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>

                <RadioGroup
                  value={answers[q.id] || ""}
                  onValueChange={(val) =>
                    !results && setAnswers((prev) => ({ ...prev, [q.id]: val }))
                  }
                  disabled={!!results}
                >
                  {(q.options as string[]).map((opt) => (
                    <div
                      key={opt}
                      className={cn(
                        "flex items-center space-x-2 rounded-md p-2",
                        result && opt === result.correctAnswer && "bg-green-50 dark:bg-green-950",
                        result && answers[q.id] === opt && !result.correct && "bg-red-50 dark:bg-red-950"
                      )}
                    >
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer text-sm">
                        {opt}
                      </label>
                      {result && opt === result.correctAnswer && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {result && answers[q.id] === opt && !result.correct && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  ))}
                </RadioGroup>

                {result?.explanation && (
                  <p className="text-xs text-muted-foreground italic">{result.explanation}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!results ? (
        <Button onClick={submitAnswers} disabled={!allAnswered} className="w-full">
          Submit Answers
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setActiveSet(null)} className="w-full" variant="outline">
          Back to Exercises
        </Button>
      )}
    </div>
  );
}
