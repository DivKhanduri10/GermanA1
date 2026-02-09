"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Flashcard, FlashcardSkeleton } from "@/components/vocabulary/flashcard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

interface VocabWord {
  id: number;
  word: string;
  article: string | null;
  plural: string | null;
  translation: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  category: string;
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="space-y-6 max-w-2xl mx-auto"><FlashcardSkeleton /></div>}>
      <FlashcardsContent />
    </Suspense>
  );
}

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const mode = searchParams.get("mode") || "learn";

  const [words, setWords] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [cardMode, setCardMode] = useState<"de-en" | "en-de">("de-en");
  const [showExample, setShowExample] = useState(false);
  const [ratings, setRatings] = useState<Record<number, string>>({});

  const fetchWords = useCallback(async () => {
    setLoading(true);
    let url: string;
    if (mode === "review") {
      url = "/api/vocabulary/due?limit=50";
    } else if (category === "all") {
      url = "/api/vocabulary?limit=50";
    } else {
      url = `/api/vocabulary?category=${encodeURIComponent(category)}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setWords(data.words || []);
    setCurrentIndex(0);
    setRatings({});
    setLoading(false);
  }, [category, mode]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  useEffect(() => {
    fetch("/api/vocabulary/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.categoryStats) {
          setCategories(data.categoryStats.map((c: { category: string }) => c.category));
        }
      });
  }, []);

  const currentWord = words[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, words.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const rateWord = async (quality: string) => {
    if (!currentWord) return;

    const qualityMap: Record<string, number> = {
      again: 0,
      hard: 2,
      good: 4,
      easy: 5,
    };

    setRatings((prev) => ({ ...prev, [currentWord.id]: quality }));

    await fetch("/api/vocabulary/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wordId: currentWord.id,
        quality: qualityMap[quality],
      }),
    });

    goNext();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "n") goNext();
      if (e.key === "ArrowLeft" || e.key === "p") goPrev();
      if (e.key === "1") rateWord("again");
      if (e.key === "2") rateWord("hard");
      if (e.key === "3") rateWord("good");
      if (e.key === "4") rateWord("easy");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, currentWord]);

  const progressPercent =
    words.length > 0
      ? Math.round(((currentIndex + 1) / words.length) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            {mode === "review"
              ? "Review words due for practice"
              : "Learn vocabulary with flashcards"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
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

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCardMode(cardMode === "de-en" ? "en-de" : "de-en")}
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          {cardMode === "de-en" ? "DE → EN" : "EN → DE"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowExample(!showExample)}
        >
          {showExample ? (
            <EyeOff className="mr-2 h-3 w-3" />
          ) : (
            <Eye className="mr-2 h-3 w-3" />
          )}
          Examples
        </Button>
      </div>

      {/* Progress */}
      {words.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Card {currentIndex + 1} of {words.length}
            </span>
            <span>{Object.keys(ratings).length} rated</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      )}

      {/* Flashcard */}
      {loading ? (
        <FlashcardSkeleton />
      ) : words.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {mode === "review"
              ? "No words due for review. Keep learning!"
              : "No words found. Try a different category."}
          </p>
        </div>
      ) : currentWord ? (
        <>
          <Flashcard
            key={currentWord.id}
            word={currentWord}
            mode={cardMode}
            showExample={showExample}
          />

          {/* Navigation */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goNext}
              disabled={currentIndex === words.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* SRS Rating Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              How well did you know this word?
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => rateWord("again")}
              >
                Again (1)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rateWord("hard")}
                className="border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                Hard (2)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rateWord("good")}
                className="border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"
              >
                Good (3)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rateWord("easy")}
                className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                Easy (4)
              </Button>
            </div>
          </div>

          {/* Current word category */}
          <div className="flex justify-center">
            <Badge variant="secondary">{currentWord.category}</Badge>
          </div>
        </>
      ) : null}

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-muted-foreground text-center">
        Keyboard: Space/Enter = flip, ← → = navigate, 1-4 = rate
      </div>
    </div>
  );
}
