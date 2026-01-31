"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabWord {
  id: number;
  word: string;
  article: string | null;
  translation: string;
  category: string;
}

interface QuizQuestion {
  word: VocabWord;
  options: string[];
  correctIndex: number;
}

type QuizState = "setup" | "active" | "results";

export default function VocabularyQuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [quizLength, setQuizLength] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/vocabulary/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.categoryStats) {
          setCategories(
            data.categoryStats.map((c: { category: string }) => c.category)
          );
        }
      });
  }, []);

  const generateQuiz = useCallback(async () => {
    setLoading(true);
    const url =
      category === "all"
        ? `/api/vocabulary/random?count=${quizLength * 4}`
        : `/api/vocabulary?category=${encodeURIComponent(category)}`;

    const res = await fetch(url);
    const data = await res.json();
    const allWords: VocabWord[] = data.words || [];

    if (allWords.length < 4) {
      setLoading(false);
      return;
    }

    // Pick quiz words and generate questions
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const quizWords = shuffled.slice(0, Math.min(quizLength, shuffled.length));

    const quizQuestions: QuizQuestion[] = quizWords.map((word) => {
      // Get 3 distractors (different translations)
      const distractors = allWords
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.translation);

      const options = [...distractors, word.translation].sort(
        () => Math.random() - 0.5
      );
      const correctIndex = options.indexOf(word.translation);

      return { word, options, correctIndex };
    });

    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setState("active");
    setLoading(false);
  }, [category, quizLength]);

  const handleAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Already answered
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === questions[currentIndex].correctIndex;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, answerIndex]);

    // Update progress
    await fetch("/api/vocabulary/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wordId: questions[currentIndex].word.id,
        correct: isCorrect,
      }),
    });

    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
      } else {
        setState("results");
      }
    }, 1200);
  };

  const currentQuestion = questions[currentIndex];
  const progressPercent =
    questions.length > 0
      ? Math.round(((currentIndex + 1) / questions.length) * 100)
      : 0;

  // Setup screen
  if (state === "setup") {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulary Quiz</h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge with multiple choice questions
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of questions
              </label>
              <Select
                value={String(quizLength)}
                onValueChange={(v) => setQuizLength(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="50">50 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateQuiz} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (state === "results") {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Complete!</h1>
        </div>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-5xl font-bold">
              {score}/{questions.length}
            </div>
            <p className="text-lg text-muted-foreground">{percentage}% correct</p>
            <Badge
              variant={percentage >= 80 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
            >
              {percentage >= 80
                ? "Excellent!"
                : percentage >= 50
                ? "Good effort"
                : "Keep practicing"}
            </Badge>
          </CardContent>
        </Card>

        {/* Review wrong answers */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Review</h2>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div
                key={q.word.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md text-sm",
                  isCorrect ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"
                )}
              >
                {isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span className="font-medium">{q.word.word}</span>
                <span className="text-muted-foreground">→</span>
                <span>{q.word.translation}</span>
                {!isCorrect && userAnswer !== null && (
                  <span className="text-red-600 ml-auto">
                    You: {q.options[userAnswer]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button onClick={generateQuiz} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => setState("setup")}
            className="flex-1"
          >
            New Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Active quiz
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Question {currentIndex + 1}/{questions.length}
        </h1>
        <Badge variant="secondary">
          Score: {score}/{currentIndex}
        </Badge>
      </div>

      <Progress value={progressPercent} className="h-2" />

      {currentQuestion && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                What does this mean in English?
              </p>
              <p className="text-3xl font-bold">{currentQuestion.word.word}</p>
              {currentQuestion.word.article && (
                <p className="text-sm text-muted-foreground mt-1">
                  ({currentQuestion.word.article})
                </p>
              )}
            </div>

            <div className="grid gap-2">
              {currentQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === currentQuestion.correctIndex;
                const showResult = selectedAnswer !== null;

                return (
                  <Button
                    key={i}
                    variant="outline"
                    className={cn(
                      "justify-start text-left h-auto py-3 px-4",
                      showResult && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950"
                    )}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                  >
                    <span className="mr-3 text-muted-foreground">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {option}
                    {showResult && isCorrect && (
                      <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="ml-auto h-4 w-4 text-red-600" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
