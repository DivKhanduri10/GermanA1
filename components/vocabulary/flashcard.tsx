"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VocabWord {
  id: number;
  word: string;
  article: string | null;
  plural: string | null;
  translation: string;
  exampleSentence: string | null;
  category: string;
}

interface FlashcardProps {
  word: VocabWord;
  mode: "de-en" | "en-de";
  showExample: boolean;
}

export function Flashcard({ word, mode, showExample }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const front = mode === "de-en" ? word.word : word.translation;
  const back = mode === "de-en" ? word.translation : word.word;
  const backExtra =
    mode === "en-de" && word.article ? `(${word.article})` : "";
  const pluralText = word.plural ? `Plural: ${word.plural}` : null;

  return (
    <div
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setFlipped(!flipped);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={flipped ? "Show front" : "Show back"}
    >
      <div
        className={cn(
          "relative w-full h-64 transition-transform duration-500 transform-style-3d",
          flipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-sm text-muted-foreground mb-2">
            {mode === "de-en" ? "German" : "English"}
          </p>
          <p className="text-3xl font-bold text-center">{front}</p>
          {mode === "de-en" && word.article && (
            <p className="text-sm text-muted-foreground mt-2">
              ({word.article})
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Click or press Space to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border bg-card p-6 shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm text-muted-foreground mb-2">
            {mode === "de-en" ? "English" : "German"}
          </p>
          <p className="text-3xl font-bold text-center">
            {back} {backExtra}
          </p>
          {pluralText && (
            <p className="text-sm text-muted-foreground mt-2">{pluralText}</p>
          )}
          {showExample && word.exampleSentence && (
            <p className="text-sm text-muted-foreground mt-4 italic text-center">
              &quot;{word.exampleSentence}&quot;
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Click or press Space to flip back
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-export for convenience
export function FlashcardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-64 rounded-xl border bg-card animate-pulse" />
    </div>
  );
}
