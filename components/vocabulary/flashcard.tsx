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
      className="perspective-1000 w-full max-w-md mx-auto cursor-pointer select-none"
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
          "relative w-full h-72 transition-transform duration-500 transform-style-3d",
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
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-4 left-4">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {mode === "de-en" ? "Deutsch" : "English"}
            </span>
          </div>
          <p className="text-3xl font-bold text-center">{front}</p>
          {mode === "de-en" && word.article && (
            <p className="text-base text-primary/70 mt-2 font-medium">
              {word.article}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-6 absolute bottom-4">
            Tap to flip
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-gradient-to-b from-card to-primary/5 p-6 shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute top-4 left-4">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {mode === "de-en" ? "English" : "Deutsch"}
            </span>
          </div>
          <p className="text-3xl font-bold text-center">
            {back} {backExtra}
          </p>
          {pluralText && (
            <p className="text-sm text-muted-foreground mt-2">{pluralText}</p>
          )}
          {showExample && word.exampleSentence && (
            <p className="text-sm text-muted-foreground mt-4 italic text-center max-w-xs">
              &quot;{word.exampleSentence}&quot;
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-6 absolute bottom-4">
            Tap to flip back
          </p>
        </div>
      </div>
    </div>
  );
}

export function FlashcardSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-72 rounded-xl border-2 bg-card animate-pulse flex items-center justify-center">
        <div className="space-y-3 flex flex-col items-center">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
