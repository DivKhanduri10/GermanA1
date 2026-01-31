"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Lightbulb,
  BookOpen,
  Volume2,
  MessageSquare,
} from "lucide-react";

interface SpeakingPrompt {
  id: number;
  partNumber: number;
  category: string | null;
  prompt: string;
  sampleResponse: string | null;
  keyPhrases: string[] | null;
}

type ViewState = "overview" | "practice" | "phrase-library";

const PART_DESCRIPTIONS = [
  {
    part: 1,
    title: "Self-Introduction",
    description: "Introduce yourself – name, age, country, languages, hobbies, work/studies",
    icon: Mic,
    tip: "Practice a 1-minute introduction covering all key points.",
  },
  {
    part: 2,
    title: "Ask & Answer Questions",
    description: "Spell a word, ask about everyday topics, and respond to questions",
    icon: MessageSquare,
    tip: "Learn W-Fragen (Wer, Was, Wo, Wann, Wie) and practice spelling your name.",
  },
  {
    part: 3,
    title: "Make Requests & Respond",
    description: "Ask someone to do something and respond to requests",
    icon: Volume2,
    tip: "Use 'Können Sie bitte...' and 'Könnten Sie...' for polite requests.",
  },
];

const PHRASE_LIBRARY = [
  {
    category: "Greetings & Introductions",
    phrases: [
      { de: "Guten Tag! Mein Name ist...", en: "Good day! My name is..." },
      { de: "Ich komme aus...", en: "I come from..." },
      { de: "Ich bin ... Jahre alt.", en: "I am ... years old." },
      { de: "Ich spreche Deutsch und...", en: "I speak German and..." },
      { de: "Ich wohne in...", en: "I live in..." },
      { de: "Ich bin ... von Beruf.", en: "I am ... by profession." },
    ],
  },
  {
    category: "Questions (W-Fragen)",
    phrases: [
      { de: "Wie heißen Sie?", en: "What is your name?" },
      { de: "Woher kommen Sie?", en: "Where do you come from?" },
      { de: "Wo wohnen Sie?", en: "Where do you live?" },
      { de: "Was machen Sie beruflich?", en: "What do you do for a living?" },
      { de: "Wie alt sind Sie?", en: "How old are you?" },
      { de: "Welche Sprachen sprechen Sie?", en: "Which languages do you speak?" },
    ],
  },
  {
    category: "Polite Requests",
    phrases: [
      { de: "Können Sie bitte...?", en: "Can you please...?" },
      { de: "Könnten Sie mir helfen?", en: "Could you help me?" },
      { de: "Darf ich...?", en: "May I...?" },
      { de: "Entschuldigung, wo ist...?", en: "Excuse me, where is...?" },
      { de: "Wie viel kostet das?", en: "How much does it cost?" },
      { de: "Ich hätte gern...", en: "I would like..." },
    ],
  },
  {
    category: "Everyday Topics",
    phrases: [
      { de: "Ich mag... / Ich mag ... nicht.", en: "I like... / I don't like..." },
      { de: "Mein Hobby ist...", en: "My hobby is..." },
      { de: "Am Wochenende...", en: "On the weekend..." },
      { de: "Ich gehe gern...", en: "I like to go..." },
      { de: "Das Wetter ist heute...", en: "The weather is today..." },
      { de: "Ich esse gern...", en: "I like to eat..." },
    ],
  },
  {
    category: "Numbers & Spelling",
    phrases: [
      { de: "Meine Telefonnummer ist...", en: "My phone number is..." },
      { de: "Das schreibt man: ...", en: "You spell that: ..." },
      { de: "Können Sie das buchstabieren?", en: "Can you spell that?" },
      { de: "Noch einmal, bitte.", en: "Once more, please." },
    ],
  },
];

export default function SpeakingPage() {
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>([]);
  const [viewState, setViewState] = useState<ViewState>("overview");
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selfRatings, setSelfRatings] = useState<Record<number, number>>({});

  const filteredPrompts = prompts.filter((p) => p.partNumber === selectedPart);
  const currentPrompt = filteredPrompts[currentPromptIndex];

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  async function fetchPrompts() {
    const res = await fetch("/api/speaking/prompts");
    const data = await res.json();
    setPrompts(data.prompts || []);
  }

  function startPractice(part: number) {
    setSelectedPart(part);
    setCurrentPromptIndex(0);
    setShowSample(false);
    setShowPhrases(false);
    setTimer(0);
    setIsTimerRunning(false);
    setViewState("practice");
  }

  const handleNext = useCallback(() => {
    if (currentPromptIndex < filteredPrompts.length - 1) {
      setCurrentPromptIndex((i) => i + 1);
      setShowSample(false);
      setShowPhrases(false);
      setTimer(0);
      setIsTimerRunning(false);
    }
  }, [currentPromptIndex, filteredPrompts.length]);

  function handlePrevious() {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex((i) => i - 1);
      setShowSample(false);
      setShowPhrases(false);
      setTimer(0);
      setIsTimerRunning(false);
    }
  }

  async function handleRate(promptId: number, rating: number) {
    setSelfRatings((prev) => ({ ...prev, [promptId]: rating }));

    try {
      await fetch("/api/speaking/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId,
          selfRating: rating,
          durationSeconds: timer,
        }),
      });
    } catch {
      console.error("Failed to save progress");
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Overview
  if (viewState === "overview") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speaking</h1>
            <p className="text-muted-foreground">
              Prepare for the speaking exam (Sprechen) – Goethe A1
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setViewState("phrase-library")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Phrase Library
          </Button>
        </div>

        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Volume2 className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Text-Based Speaking Practice
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Audio recording is not yet available. Practice by reading the
                  prompts aloud, then check sample responses and rate your
                  confidence. Full audio support coming soon!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {PART_DESCRIPTIONS.map(({ part, title, description, icon: Icon, tip }) => (
            <Card
              key={part}
              className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
              onClick={() => startPractice(part)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge>Part {part}</Badge>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Practice Part {part}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Quick Phrase Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Phrases</CardTitle>
            <CardDescription>
              Essential phrases for the speaking exam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {PHRASE_LIBRARY[0].phrases.slice(0, 4).map((phrase, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                  <span className="font-medium text-sm">{phrase.de}</span>
                  <span className="text-xs text-muted-foreground">
                    – {phrase.en}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setViewState("phrase-library")}
            >
              View Full Phrase Library
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Practice view
  if (viewState === "practice") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewState("overview")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Part {selectedPart}: {PART_DESCRIPTIONS[selectedPart - 1].title}
            </h1>
            <p className="text-muted-foreground">
              Prompt {currentPromptIndex + 1} of {filteredPrompts.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg">{formatTime(timer)}</span>
          </div>
        </div>

        {currentPrompt ? (
          <>
            {/* Prompt Card */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {currentPrompt.category || `Part ${currentPrompt.partNumber}`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{currentPrompt.id}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl leading-relaxed">{currentPrompt.prompt}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isTimerRunning ? "destructive" : "default"}
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-full"
                >
                  {isTimerRunning ? (
                    <>Stop Timer</>
                  ) : timer > 0 ? (
                    <>Resume Timer</>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Start Speaking (Timer)
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Key Phrases */}
            {currentPrompt.keyPhrases &&
              (currentPrompt.keyPhrases as string[]).length > 0 && (
                <Card>
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setShowPhrases(!showPhrases)}
                  >
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Helpful Phrases
                      </span>
                      {showPhrases ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  {showPhrases && (
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(currentPrompt.keyPhrases as string[]).map(
                          (phrase, i) => (
                            <Badge key={i} variant="secondary" className="text-sm">
                              {phrase}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

            {/* Sample Response */}
            {currentPrompt.sampleResponse && (
              <Card>
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setShowSample(!showSample)}
                >
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Sample Response
                    </span>
                    {showSample ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CardTitle>
                </CardHeader>
                {showSample && (
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm">
                        {currentPrompt.sampleResponse}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Self-Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  How confident do you feel?
                </CardTitle>
                <CardDescription>
                  Rate your speaking performance on this prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={
                        selfRatings[currentPrompt.id] === rating
                          ? "default"
                          : "outline"
                      }
                      size="lg"
                      onClick={() => handleRate(currentPrompt.id, rating)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          selfRatings[currentPrompt.id] &&
                          selfRatings[currentPrompt.id] >= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                        }`}
                      />
                      <span className="text-xs">
                        {rating === 1
                          ? "Poor"
                          : rating === 2
                          ? "Fair"
                          : rating === 3
                          ? "OK"
                          : rating === 4
                          ? "Good"
                          : "Great"}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPromptIndex === 0}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentPromptIndex >= filteredPrompts.length - 1}
                className="flex-1"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Mic className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No speaking prompts available for Part {selectedPart} yet. Run
                the seed script to add content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Phrase Library
  if (viewState === "phrase-library") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewState("overview")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Phrase Library
            </h1>
            <p className="text-muted-foreground">
              Essential German phrases for the speaking exam
            </p>
          </div>
        </div>

        {PHRASE_LIBRARY.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle className="text-lg">{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.phrases.map((phrase, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium">{phrase.de}</span>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {phrase.en}
                      </span>
                    </div>
                    {i < section.phrases.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
}
