"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, ArrowRight, Headphones, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  questionType: string;
  options: string[];
}

interface ListeningSet {
  setId: number;
  partNumber: number;
  transcript: string;
  questions: Question[];
}

export default function ListeningPage() {
  const [sets, setSets] = useState<ListeningSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPart] = useState("all");
  const [activeSet, setActiveSet] = useState<ListeningSet | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, { correct: boolean; correctAnswer: string }> | null>(null);
  const [score, setScore] = useState<{ score: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    const url = selectedPart === "all" ? "/api/listening" : `/api/listening?part=${selectedPart}`;
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setSets(data.sets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedPart]);

  const startSet = (set: ListeningSet) => {
    setActiveSet(set);
    setShowTranscript(false);
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

    const res = await fetch("/api/listening/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: answerArray }),
    });
    const data = await res.json();

    const resultMap: Record<number, { correct: boolean; correctAnswer: string }> = {};
    for (const r of data.results) {
      resultMap[r.exerciseId] = r;
    }
    setResults(resultMap);
    setScore({ score: data.score, total: data.total, percentage: data.percentage });
    setShowTranscript(true);
  };

  const partLabels: Record<number, string> = {
    1: "Part 1: Dialogues",
    2: "Part 2: Announcements",
    3: "Part 3: Monologues",
  };

  // Overview
  if (!activeSet) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Listening</h1>
          <p className="text-muted-foreground mt-1">
            Practice listening comprehension with dialogues, announcements, and monologues
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Audio coming soon. For now, read the transcripts and answer the questions to practice comprehension.
          </AlertDescription>
        </Alert>

        <Select value={selectedPart} onValueChange={setSelectedPart}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Parts</SelectItem>
            <SelectItem value="1">Part 1: Dialogues</SelectItem>
            <SelectItem value="2">Part 2: Announcements</SelectItem>
            <SelectItem value="3">Part 3: Monologues</SelectItem>
          </SelectContent>
        </Select>

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
                <Headphones className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No listening exercises yet</p>
              <p className="text-sm text-muted-foreground">
                Seed the database to get started with listening comprehension practice.
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
                  <CardTitle className="text-base">Listening Set {set.setId}</CardTitle>
                  <CardDescription>{set.questions.length} question{set.questions.length !== 1 ? "s" : ""}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Active exercise
  const allAnswered = activeSet.questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setActiveSet(null)}>
          ← Back to exercises
        </Button>
        <Badge variant="outline">{partLabels[activeSet.partNumber]}</Badge>
      </div>

      {/* Transcript Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Transcript</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? "Hide" : "Show"} Transcript
            </Button>
          </div>
          {showTranscript && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed border-l-4 border-purple-200 dark:border-purple-800 pl-4 bg-muted/30 p-3 rounded">
              {activeSet.transcript}
            </div>
          )}
          {!showTranscript && (
            <p className="text-sm text-muted-foreground italic">
              Try answering the questions first, then reveal the transcript to check.
            </p>
          )}
        </CardContent>
      </Card>

      {score && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{score.score}/{score.total}</div>
            <p className="text-muted-foreground">{score.percentage}% correct</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {activeSet.questions.map((q, i) => {
          const result = results?.[q.id];
          return (
            <Card key={q.id}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-medium">{i + 1}. {q.question}</p>
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
                      <label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer text-sm">{opt}</label>
                      {result && opt === result.correctAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {result && answers[q.id] === opt && !result.correct && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!results ? (
        <Button onClick={submitAnswers} disabled={!allAnswered} className="w-full">
          Submit Answers <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={() => setActiveSet(null)} className="w-full" variant="outline">
          Back to Exercises
        </Button>
      )}
    </div>
  );
}
