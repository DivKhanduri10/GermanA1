"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  PenLine,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  History,
  Sparkles,
} from "lucide-react";

interface WritingPrompt {
  id: number;
  promptType: string;
  scenario: string;
  instructions: string;
  wordCountMin: number | null;
  wordCountMax: number | null;
  sampleResponse: string | null;
}

interface Evaluation {
  overallScore: number;
  taskCompletion: { score: number; feedback: string };
  grammar: { score: number; errors: string[]; feedback: string };
  vocabulary: { score: number; feedback: string };
  coherence: { score: number; feedback: string };
  wordCount: number;
  suggestions: string[];
  correctedVersion: string | null;
  encouragement: string;
}

interface Submission {
  id: number;
  content: string;
  evaluation: Evaluation;
  score: number | null;
}

type ViewState = "prompts" | "writing" | "evaluation" | "history";

export default function WritingPage() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<WritingPrompt | null>(null);
  const [content, setContent] = useState("");
  const [viewState, setViewState] = useState<ViewState>("prompts");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts(type?: string) {
    setLoading(true);
    const params = type && type !== "all" ? `?type=${type}` : "";
    const res = await fetch(`/api/writing/prompts${params}`);
    const data = await res.json();
    setPrompts(data.prompts || []);
    setLoading(false);
  }

  async function fetchSubmissions() {
    const res = await fetch("/api/writing/submissions");
    const data = await res.json();
    setSubmissions(data.submissions || []);
  }

  function handleSelectPrompt(prompt: WritingPrompt) {
    setSelectedPrompt(prompt);
    setContent("");
    setEvaluation(null);
    setViewState("writing");
  }

  async function handleSubmit() {
    if (!selectedPrompt || !content.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/writing/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: selectedPrompt.id, content }),
      });
      const data = await res.json();
      setEvaluation(data.submission.evaluation);
      setViewState("evaluation");
    } catch {
      console.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleViewHistory() {
    fetchSubmissions();
    setViewState("history");
  }

  function handleBack() {
    setViewState("prompts");
    setSelectedPrompt(null);
    setContent("");
    setEvaluation(null);
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // Prompt list view
  if (viewState === "prompts") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
            <p className="text-muted-foreground">
              Practice form filling and message writing for the Goethe A1 exam
            </p>
          </div>
          <Button variant="outline" onClick={handleViewHistory}>
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v);
            fetchPrompts(v);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="form-filling">Form Filling</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="email">Emails</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : prompts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <PenLine className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No writing prompts available yet. Run the seed script to add content.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {prompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectPrompt(prompt)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{prompt.promptType}</Badge>
                        {prompt.wordCountMin && (
                          <span className="text-xs text-muted-foreground">
                            {prompt.wordCountMin}-{prompt.wordCountMax} words
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{prompt.scenario}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {prompt.instructions}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Writing view
  if (viewState === "writing" && selectedPrompt) {
    const minWords = selectedPrompt.wordCountMin || 0;
    const maxWords = selectedPrompt.wordCountMax || 100;
    const wordProgress = Math.min((wordCount / maxWords) * 100, 100);
    const meetsMinimum = wordCount >= minWords;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedPrompt.scenario}
            </h1>
            <Badge variant="secondary">{selectedPrompt.promptType}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{selectedPrompt.instructions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Your Response
            </CardTitle>
            <CardDescription>
              Write your response in German.
              {selectedPrompt.wordCountMin && (
                <span>
                  {" "}
                  Aim for {selectedPrompt.wordCountMin}-
                  {selectedPrompt.wordCountMax} words.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Schreiben Sie hier Ihre Antwort..."
              className="min-h-[200px] text-base"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={`text-sm font-medium ${
                    meetsMinimum ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {wordCount} words
                </span>
                {selectedPrompt.wordCountMin && (
                  <Progress value={wordProgress} className="w-32 h-2" />
                )}
              </div>
              {meetsMinimum && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Minimum met
                </span>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluating your writing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Evaluation
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Evaluation view
  if (viewState === "evaluation" && evaluation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Evaluation Results
            </h1>
            <p className="text-muted-foreground">
              {selectedPrompt?.scenario}
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold">
                    {evaluation.overallScore}%
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  evaluation.overallScore >= 70
                    ? "default"
                    : evaluation.overallScore >= 40
                    ? "secondary"
                    : "destructive"
                }
                className="text-lg px-4 py-1"
              >
                {evaluation.overallScore >= 70
                  ? "Good!"
                  : evaluation.overallScore >= 40
                  ? "Keep practicing"
                  : "Needs work"}
              </Badge>
            </div>
            <Progress value={evaluation.overallScore} className="h-3" />
            <p className="mt-4 text-sm text-muted-foreground italic">
              {evaluation.encouragement}
            </p>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Task Completion",
              data: evaluation.taskCompletion,
              icon: FileText,
            },
            { title: "Grammar", data: evaluation.grammar, icon: CheckCircle2 },
            { title: "Vocabulary", data: evaluation.vocabulary, icon: PenLine },
            { title: "Coherence", data: evaluation.coherence, icon: Sparkles },
          ].map(({ title, data, icon: Icon }) => (
            <Card key={title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold">{data.score}</span>
                  <span className="text-muted-foreground">/ 5</span>
                </div>
                <p className="text-sm text-muted-foreground">{data.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grammar Errors */}
        {evaluation.grammar.errors && evaluation.grammar.errors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Grammar Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {evaluation.grammar.errors.map((error, i) => (
                  <li
                    key={i}
                    className="text-sm flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="text-red-500 mt-0.5">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Corrected Version */}
        {evaluation.correctedVersion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Corrected Version</CardTitle>
              <CardDescription>
                Here&apos;s how your text could be improved:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-sm">
                  {evaluation.correctedVersion}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions */}
        {evaluation.suggestions && evaluation.suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {evaluation.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-0.5">💡</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Your Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Text</CardTitle>
            <CardDescription>
              {evaluation.wordCount} words written
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {content}
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Try Another Prompt
          </Button>
          <Button
            onClick={() => {
              setContent("");
              setEvaluation(null);
              setViewState("writing");
            }}
            className="flex-1"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // History view
  if (viewState === "history") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Writing History
            </h1>
            <p className="text-muted-foreground">
              Your past writing submissions
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No submissions yet. Start writing to build your history!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <Card key={sub.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Submission #{sub.id}
                    </CardTitle>
                    {sub.score !== null && (
                      <Badge
                        variant={
                          sub.score >= 0.7
                            ? "default"
                            : sub.score >= 0.4
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {Math.round(sub.score * 100)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {sub.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
