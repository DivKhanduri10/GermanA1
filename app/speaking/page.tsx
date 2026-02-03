"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Lightbulb,
  BookOpen,
  Volume2,
  VolumeX,
  MessageSquare,
  Play,
  Square,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

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
    description:
      "Introduce yourself – name, age, country, languages, hobbies, work/studies",
    icon: Mic,
    tip: "Practice a 1-minute introduction covering all key points.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
  },
  {
    part: 2,
    title: "Ask & Answer Questions",
    description:
      "Spell a word, ask about everyday topics, and respond to questions",
    icon: MessageSquare,
    tip: "Learn W-Fragen (Wer, Was, Wo, Wann, Wie) and practice spelling your name.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
  },
  {
    part: 3,
    title: "Make Requests & Respond",
    description: "Ask someone to do something and respond to requests",
    icon: Volume2,
    tip: "Use 'Können Sie bitte...' and 'Könnten Sie...' for polite requests.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950",
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
  const [loading, setLoading] = useState(true);
  const [viewState, setViewState] = useState<ViewState>("overview");
  const [selectedPart, setSelectedPart] = useState<number>(1);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showSample, setShowSample] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [selfRatings, setSelfRatings] = useState<Record<number, number>>({});
  const [savedPrompts, setSavedPrompts] = useState<Set<number>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const recorder = useAudioRecorder();
  const tts = useTextToSpeech("de-DE");

  const filteredPrompts = prompts.filter((p) => p.partNumber === selectedPart);
  const currentPrompt = filteredPrompts[currentPromptIndex];

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      const res = await fetch("/api/speaking/prompts");
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch {
      console.error("Failed to fetch prompts");
    } finally {
      setLoading(false);
    }
  }

  function startPractice(part: number) {
    setSelectedPart(part);
    setCurrentPromptIndex(0);
    setShowSample(false);
    setShowPhrases(false);
    recorder.resetRecording();
    setViewState("practice");
  }

  const handleNext = useCallback(() => {
    if (currentPromptIndex < filteredPrompts.length - 1) {
      setCurrentPromptIndex((i) => i + 1);
      setShowSample(false);
      setShowPhrases(false);
      recorder.resetRecording();
      tts.stop();
    }
  }, [currentPromptIndex, filteredPrompts.length, recorder, tts]);

  function handlePrevious() {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex((i) => i - 1);
      setShowSample(false);
      setShowPhrases(false);
      recorder.resetRecording();
      tts.stop();
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
          durationSeconds: recorder.duration,
        }),
      });
      setSavedPrompts((prev) => new Set(prev).add(promptId));
    } catch {
      console.error("Failed to save progress");
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handlePlayRecording() {
    if (recorder.audioUrl && audioRef.current) {
      audioRef.current.src = recorder.audioUrl;
      audioRef.current.play();
      setIsPlayingRecording(true);
    }
  }

  function handleStopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingRecording(false);
    }
  }

  // Overview
  if (viewState === "overview") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Speaking</h1>
            <p className="text-muted-foreground">
              Prepare for the speaking exam (Sprechen) – Goethe A1
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewState("phrase-library")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Phrase Library
          </Button>
        </div>

        {/* Audio Support Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="rounded-full p-2 bg-primary/10 h-fit">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Voice Recording Now Available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Record your responses, play them back to self-evaluate, and
                  hear sample responses read aloud. Your browser&apos;s microphone
                  permission is required for recording.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-32 bg-muted animate-pulse rounded mt-2" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {PART_DESCRIPTIONS.map(({ part, title, description, icon: Icon, tip, color, bgColor }) => {
              const partPrompts = prompts.filter((p) => p.partNumber === part);
              const practicedCount = partPrompts.filter((p) => selfRatings[p.id]).length;
              const progress = partPrompts.length > 0 ? (practicedCount / partPrompts.length) * 100 : 0;

              return (
                <Card
                  key={part}
                  className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
                  onClick={() => startPractice(part)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge>Part {part}</Badge>
                      <div className={`rounded-full p-2 ${bgColor}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{tip}</span>
                    </div>
                    {partPrompts.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{practicedCount}/{partPrompts.length} practiced</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Practice Part {part}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick Phrase Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Phrases</CardTitle>
            <CardDescription>Essential phrases for the speaking exam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {PHRASE_LIBRARY[0].phrases.slice(0, 4).map((phrase, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => tts.speak(phrase.de)}
                >
                  <div>
                    <span className="font-medium text-sm">{phrase.de}</span>
                    <span className="text-xs text-muted-foreground ml-2">– {phrase.en}</span>
                  </div>
                  <Volume2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => setViewState("phrase-library")}>
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
    const partInfo = PART_DESCRIPTIONS[selectedPart - 1];

    return (
      <div className="space-y-6">
        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlayingRecording(false)}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setViewState("overview");
              recorder.resetRecording();
              tts.stop();
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Part {selectedPart}: {partInfo.title}
            </h1>
            <p className="text-muted-foreground">
              Prompt {currentPromptIndex + 1} of {filteredPrompts.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">{formatTime(recorder.duration)}</span>
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
                  {savedPrompts.has(currentPrompt.id) && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl leading-relaxed">{currentPrompt.prompt}</p>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                {/* Recording Controls */}
                {recorder.error && (
                  <div className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {recorder.error}
                  </div>
                )}

                <div className="flex gap-2 w-full">
                  {recorder.state === "idle" && (
                    <Button
                      onClick={recorder.startRecording}
                      className="flex-1"
                      disabled={!recorder.isSupported}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  )}

                  {recorder.state === "requesting" && (
                    <Button disabled className="flex-1">
                      <Mic className="mr-2 h-4 w-4 animate-pulse" />
                      Requesting microphone...
                    </Button>
                  )}

                  {recorder.state === "recording" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={recorder.pauseRecording}
                        className="flex-1"
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={recorder.stopRecording}
                        className="flex-1"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    </>
                  )}

                  {recorder.state === "paused" && (
                    <>
                      <Button
                        onClick={recorder.resumeRecording}
                        className="flex-1"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Resume
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={recorder.stopRecording}
                        className="flex-1"
                      >
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                    </>
                  )}

                  {recorder.state === "stopped" && recorder.audioUrl && (
                    <>
                      {isPlayingRecording ? (
                        <Button
                          variant="outline"
                          onClick={handleStopPlayback}
                          className="flex-1"
                        >
                          <Square className="mr-2 h-4 w-4" />
                          Stop Playback
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handlePlayRecording}
                          className="flex-1"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Play Recording
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        onClick={recorder.resetRecording}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Record Again
                      </Button>
                    </>
                  )}
                </div>

                {/* Recording indicator */}
                {recorder.state === "recording" && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                    Recording...
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Key Phrases */}
            {currentPrompt.keyPhrases && (currentPrompt.keyPhrases as string[]).length > 0 && (
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setShowPhrases(!showPhrases)}>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Helpful Phrases
                    </span>
                    {showPhrases ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                {showPhrases && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(currentPrompt.keyPhrases as string[]).map((phrase, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-sm cursor-pointer hover:bg-secondary/80"
                          onClick={() => tts.speak(phrase)}
                        >
                          {phrase}
                          <Volume2 className="ml-1.5 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Sample Response */}
            {currentPrompt.sampleResponse && (
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setShowSample(!showSample)}>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Sample Response
                    </span>
                    {showSample ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
                {showSample && (
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-sm">{currentPrompt.sampleResponse}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (tts.isSpeaking) {
                            tts.stop();
                          } else {
                            tts.speak(currentPrompt.sampleResponse!);
                          }
                        }}
                        disabled={!tts.isSupported}
                      >
                        {tts.isSpeaking ? (
                          <>
                            <VolumeX className="mr-2 h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Listen
                          </>
                        )}
                      </Button>
                      {tts.isSupported && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Speed:</span>
                          <Slider
                            value={[tts.rate]}
                            onValueChange={([v]) => tts.setRate(v)}
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            className="w-24"
                          />
                          <span className="w-8">{tts.rate.toFixed(1)}x</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Self-Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How confident do you feel?</CardTitle>
                <CardDescription>Rate your speaking performance on this prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={selfRatings[currentPrompt.id] === rating ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleRate(currentPrompt.id, rating)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          selfRatings[currentPrompt.id] && selfRatings[currentPrompt.id] >= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : ""
                        }`}
                      />
                      <span className="text-xs">
                        {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "OK" : rating === 4 ? "Good" : "Great"}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handlePrevious} disabled={currentPromptIndex === 0} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={currentPromptIndex >= filteredPrompts.length - 1} className="flex-1">
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-4">
                <MicOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No prompts available</p>
              <p className="text-sm text-muted-foreground">
                No speaking prompts available for Part {selectedPart} yet.
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
          <Button variant="ghost" size="icon" onClick={() => setViewState("overview")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Phrase Library</h1>
            <p className="text-muted-foreground">Essential German phrases for the speaking exam</p>
          </div>
        </div>

        {tts.isSupported && (
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <span>Click any phrase to hear it pronounced</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Speed:</span>
                  <Slider
                    value={[tts.rate]}
                    onValueChange={([v]) => tts.setRate(v)}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="w-24"
                  />
                  <span className="w-8">{tts.rate.toFixed(1)}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {PHRASE_LIBRARY.map((section) => (
          <Card key={section.category}>
            <CardHeader>
              <CardTitle className="text-lg">{section.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.phrases.map((phrase, i) => (
                  <div key={i}>
                    <div
                      className="flex items-center justify-between gap-4 p-2 -mx-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                      onClick={() => tts.speak(phrase.de)}
                    >
                      <div>
                        <span className="font-medium">{phrase.de}</span>
                        <span className="text-sm text-muted-foreground ml-3">{phrase.en}</span>
                      </div>
                      <Volume2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    {i < section.phrases.length - 1 && <Separator className="mt-3" />}
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
