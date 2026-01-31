"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabWord {
  id: number;
  word: string;
  translation: string;
}

interface MatchItem {
  id: string;
  wordId: number;
  text: string;
  type: "german" | "english";
  matched: boolean;
}

type GameState = "setup" | "playing" | "complete";

export default function MatchingGamePage() {
  const [state, setState] = useState<GameState>("setup");
  const [pairs, setPairs] = useState(5);
  const [items, setItems] = useState<MatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [incorrectPair, setIncorrectPair] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(false);

  // Timer
  useEffect(() => {
    if (state === "playing") {
      const interval = setInterval(() => setTimer((t) => t + 1), 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const startGame = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/vocabulary/random?count=${pairs}`);
    const data = await res.json();
    const words: VocabWord[] = (data.words || []).slice(0, pairs);

    if (words.length < 2) {
      setLoading(false);
      return;
    }

    // Create items: german on left, english on right
    const germanItems: MatchItem[] = words.map((w, i) => ({
      id: `de-${i}`,
      wordId: w.id,
      text: w.word,
      type: "german",
      matched: false,
    }));

    const englishItems: MatchItem[] = words.map((w, i) => ({
      id: `en-${i}`,
      wordId: w.id,
      text: w.translation,
      type: "english",
      matched: false,
    }));

    // Shuffle each column independently
    const shuffledGerman = [...germanItems].sort(() => Math.random() - 0.5);
    const shuffledEnglish = [...englishItems].sort(() => Math.random() - 0.5);

    setItems([...shuffledGerman, ...shuffledEnglish]);
    setMatchedPairs(0);
    setAttempts(0);
    setTimer(0);
    setSelectedId(null);
    setIncorrectPair(null);
    setState("playing");
    setLoading(false);
  }, [pairs]);

  const handleItemClick = (item: MatchItem) => {
    if (item.matched || incorrectPair) return;

    if (!selectedId) {
      setSelectedId(item.id);
      return;
    }

    // Find the previously selected item
    const prevItem = items.find((i) => i.id === selectedId);
    if (!prevItem || prevItem.id === item.id) {
      setSelectedId(null);
      return;
    }

    // Must select one german and one english
    if (prevItem.type === item.type) {
      setSelectedId(item.id);
      return;
    }

    setAttempts((a) => a + 1);

    // Check match
    if (prevItem.wordId === item.wordId) {
      // Correct match
      setItems((prev) =>
        prev.map((i) =>
          i.wordId === item.wordId ? { ...i, matched: true } : i
        )
      );
      setMatchedPairs((m) => {
        const newCount = m + 1;
        if (newCount === Math.floor(items.length / 2)) {
          setState("complete");
        }
        return newCount;
      });
      setSelectedId(null);
    } else {
      // Incorrect match - flash red briefly
      setIncorrectPair([prevItem.id, item.id]);
      setTimeout(() => {
        setIncorrectPair(null);
        setSelectedId(null);
      }, 600);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const germanItems = items.filter((i) => i.type === "german");
  const englishItems = items.filter((i) => i.type === "english");
  const totalPairs = Math.floor(items.length / 2);
  const accuracy =
    attempts > 0 ? Math.round((matchedPairs / attempts) * 100) : 0;

  // Setup
  if (state === "setup") {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Matching Game</h1>
          <p className="text-muted-foreground mt-1">
            Match German words with their English translations
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Number of pairs
              </label>
              <Select
                value={String(pairs)}
                onValueChange={(v) => setPairs(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 pairs (Easy)</SelectItem>
                  <SelectItem value="10">10 pairs (Medium)</SelectItem>
                  <SelectItem value="15">15 pairs (Hard)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={startGame} disabled={loading} className="w-full">
              {loading ? "Loading..." : "Start Game"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Complete
  if (state === "complete") {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Game Complete!</h1>
        </div>

        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{formatTime(timer)}</p>
                <p className="text-xs text-muted-foreground">Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{attempts}</p>
                <p className="text-xs text-muted-foreground">Attempts</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{accuracy}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={startGame} className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button
            variant="outline"
            onClick={() => setState("setup")}
            className="flex-1"
          >
            Change Settings
          </Button>
        </div>
      </div>
    );
  }

  // Playing
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Matching Game</h1>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {matchedPairs}/{totalPairs} matched
          </Badge>
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {formatTime(timer)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* German column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-muted-foreground">
            German
          </p>
          {germanItems.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                "w-full h-auto py-3 text-sm transition-all",
                item.matched && "bg-green-50 dark:bg-green-950 border-green-500 opacity-60",
                selectedId === item.id && "ring-2 ring-primary",
                incorrectPair?.includes(item.id) && "bg-red-50 dark:bg-red-950 border-red-500"
              )}
              onClick={() => handleItemClick(item)}
              disabled={item.matched}
            >
              {item.text}
            </Button>
          ))}
        </div>

        {/* English column */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-muted-foreground">
            English
          </p>
          {englishItems.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className={cn(
                "w-full h-auto py-3 text-sm transition-all",
                item.matched && "bg-green-50 dark:bg-green-950 border-green-500 opacity-60",
                selectedId === item.id && "ring-2 ring-primary",
                incorrectPair?.includes(item.id) && "bg-red-50 dark:bg-red-950 border-red-500"
              )}
              onClick={() => handleItemClick(item)}
              disabled={item.matched}
            >
              {item.text}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Click one German word and one English translation to match them
      </p>
    </div>
  );
}
