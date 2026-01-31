"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Exercise {
  id: number;
  exerciseType: string;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
  difficulty: number;
}

export default function GrammarExercisesPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto"><p>Loading exercises...</p></div>}>
      <ExerciseSession />
    </Suspense>
  );
}

function ExerciseSession() {
  const searchParams = useSearchParams();
  const topicId = searchParams.get("topicId");
  const topicSlug = searchParams.get("topicSlug");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!topicId) return;
    fetch(`/api/grammar/exercises/${topicId}`)
      .then((res) => res.json())
      .then((data) => {
        setExercises(data.exercises || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicId]);

  const currentExercise = exercises[currentIndex];

  const checkAnswer = useCallback(
    (answer: string) => {
      if (isAnswered || !currentExercise) return;

      const correct =
        answer.trim().toLowerCase() ===
        currentExercise.correctAnswer.trim().toLowerCase();

      setIsAnswered(true);
      setIsCorrect(correct);
      setSelectedAnswer(answer);
      if (correct) setScore((s) => s + 1);
    },
    [isAnswered, currentExercise]
  );

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTextAnswer("");
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Save progress
      if (topicId) {
        fetch("/api/grammar/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topicId: parseInt(topicId),
            score,
            totalQuestions: exercises.length,
          }),
        });
      }
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setTextAnswer("");
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setFinished(false);
  };

  const progressPercent =
    exercises.length > 0
      ? Math.round(((currentIndex + 1) / exercises.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-muted-foreground">Loading exercises...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">No Exercises</h1>
        <p className="text-muted-foreground">
          No exercises available for this topic yet.
        </p>
        <Link href="/grammar">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grammar
          </Button>
        </Link>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const percentage = Math.round((score / exercises.length) * 100);
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Exercises Complete!</h1>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-5xl font-bold">
              {score}/{exercises.length}
            </div>
            <p className="text-lg text-muted-foreground">{percentage}% correct</p>
            <Badge
              variant={
                percentage >= 80
                  ? "default"
                  : percentage >= 50
                  ? "secondary"
                  : "destructive"
              }
            >
              {percentage >= 80
                ? "Excellent!"
                : percentage >= 50
                ? "Good effort"
                : "Keep practicing"}
            </Badge>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={restart} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href={topicSlug ? `/grammar/${topicSlug}` : "/grammar"} className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topic
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Exercise screen
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href={topicSlug ? `/grammar/${topicSlug}` : "/grammar"}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <Badge variant="secondary">
          Score: {score}/{currentIndex}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Exercise {currentIndex + 1} of {exercises.length}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {currentExercise && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Question */}
            <div>
              <Badge variant="outline" className="mb-3">
                {currentExercise.exerciseType === "multiple_choice"
                  ? "Multiple Choice"
                  : currentExercise.exerciseType === "fill_blank"
                  ? "Fill in the Blank"
                  : "Sentence Order"}
              </Badge>
              <p className="text-xl font-medium">{currentExercise.question}</p>
            </div>

            {/* Multiple Choice */}
            {currentExercise.exerciseType === "multiple_choice" &&
              currentExercise.options && (
                <div className="grid gap-2">
                  {(currentExercise.options as string[]).map((option, i) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption =
                      option === currentExercise.correctAnswer;
                    const showResult = isAnswered;

                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={cn(
                          "justify-start text-left h-auto py-3 px-4",
                          showResult &&
                            isCorrectOption &&
                            "border-green-500 bg-green-50 dark:bg-green-950",
                          showResult &&
                            isSelected &&
                            !isCorrectOption &&
                            "border-red-500 bg-red-50 dark:bg-red-950"
                        )}
                        onClick={() => checkAnswer(option)}
                        disabled={isAnswered}
                      >
                        <span className="mr-3 text-muted-foreground">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option}
                        {showResult && isCorrectOption && (
                          <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="ml-auto h-4 w-4 text-red-600" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}

            {/* Fill in the Blank */}
            {currentExercise.exerciseType === "fill_blank" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={isAnswered}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && textAnswer.trim()) {
                        checkAnswer(textAnswer);
                      }
                    }}
                    className={cn(
                      isAnswered && isCorrect && "border-green-500",
                      isAnswered && !isCorrect && "border-red-500"
                    )}
                  />
                  {!isAnswered && (
                    <Button
                      onClick={() => checkAnswer(textAnswer)}
                      disabled={!textAnswer.trim()}
                    >
                      Check
                    </Button>
                  )}
                </div>
                {isAnswered && !isCorrect && (
                  <p className="text-sm text-green-600">
                    Correct answer: {currentExercise.correctAnswer}
                  </p>
                )}
              </div>
            )}

            {/* Sentence Order */}
            {currentExercise.exerciseType === "sentence_order" &&
              currentExercise.options && (
                <SentenceOrder
                  words={currentExercise.options as string[]}
                  correctAnswer={currentExercise.correctAnswer}
                  isAnswered={isAnswered}
                  onSubmit={checkAnswer}
                />
              )}

            {/* Feedback */}
            {isAnswered && (
              <div
                className={cn(
                  "p-3 rounded-md text-sm",
                  isCorrect
                    ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200"
                )}
              >
                <p className="font-medium">
                  {isCorrect ? "Correct!" : "Incorrect"}
                </p>
                {currentExercise.explanation && (
                  <p className="mt-1">{currentExercise.explanation}</p>
                )}
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <Button onClick={nextExercise} className="w-full">
                {currentIndex < exercises.length - 1
                  ? "Next Exercise"
                  : "See Results"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sentence ordering component
function SentenceOrder({
  words,
  correctAnswer,
  isAnswered,
  onSubmit,
}: {
  words: string[];
  correctAnswer: string;
  isAnswered: boolean;
  onSubmit: (answer: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([...words].sort(() => Math.random() - 0.5));

  const addWord = (word: string, index: number) => {
    setSelected([...selected, word]);
    setAvailable(available.filter((_, i) => i !== index));
  };

  const removeWord = (index: number) => {
    if (isAnswered) return;
    const word = selected[index];
    setAvailable([...available, word]);
    setSelected(selected.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Selected words (sentence being built) */}
      <div className="min-h-12 p-3 rounded-md border bg-muted/50 flex flex-wrap gap-2">
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Click words below to build the sentence
          </span>
        ) : (
          selected.map((word, i) => (
            <Button
              key={`${word}-${i}`}
              variant="secondary"
              size="sm"
              onClick={() => removeWord(i)}
              disabled={isAnswered}
            >
              {word}
            </Button>
          ))
        )}
      </div>

      {/* Available words */}
      <div className="flex flex-wrap gap-2">
        {available.map((word, i) => (
          <Button
            key={`${word}-${i}`}
            variant="outline"
            size="sm"
            onClick={() => addWord(word, i)}
            disabled={isAnswered}
          >
            {word}
          </Button>
        ))}
      </div>

      {!isAnswered && selected.length > 0 && (
        <Button
          onClick={() => onSubmit(selected.join(" "))}
          className="w-full"
        >
          Check Answer
        </Button>
      )}

      {isAnswered && (
        <p className="text-sm text-green-600">
          Correct order: {correctAnswer}
        </p>
      )}
    </div>
  );
}
