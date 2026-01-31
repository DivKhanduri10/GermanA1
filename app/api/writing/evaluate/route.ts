import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId();
  const body = await request.json();
  const { promptId, content } = body as {
    promptId: number;
    content: string;
  };

  if (!promptId || !content) {
    return NextResponse.json(
      { error: "promptId and content are required" },
      { status: 400 }
    );
  }

  const prompt = await prisma.writingPrompt.findUnique({
    where: { id: promptId },
  });

  if (!prompt) {
    return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
  }

  let evaluation;
  let score: number | null = null;

  // Check if OpenAI API key is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const systemPrompt = `You are a German language teacher evaluating A1-level (beginner) writing for the Goethe-Zertifikat A1: Start Deutsch 1 exam.

The student was given this task:
Type: ${prompt.promptType}
Scenario: ${prompt.scenario}
Instructions: ${prompt.instructions}
${prompt.wordCountMin ? `Minimum words: ${prompt.wordCountMin}` : ""}
${prompt.wordCountMax ? `Maximum words: ${prompt.wordCountMax}` : ""}

Evaluate the student's response and provide feedback in the following JSON format:
{
  "overallScore": <number 0-100>,
  "taskCompletion": {
    "score": <number 0-5>,
    "feedback": "<string>"
  },
  "grammar": {
    "score": <number 0-5>,
    "errors": ["<error descriptions>"],
    "feedback": "<string>"
  },
  "vocabulary": {
    "score": <number 0-5>,
    "feedback": "<string>"
  },
  "coherence": {
    "score": <number 0-5>,
    "feedback": "<string>"
  },
  "wordCount": <number>,
  "suggestions": ["<improvement suggestions>"],
  "correctedVersion": "<corrected German text>",
  "encouragement": "<positive encouraging message>"
}

Be encouraging but honest. This is a beginner student. Focus on A1-level grammar and vocabulary.
Respond ONLY with valid JSON.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const responseText = completion.choices[0]?.message?.content;
      if (responseText) {
        evaluation = JSON.parse(responseText);
        score = evaluation.overallScore / 100;
      }
    } catch (error) {
      console.error("OpenAI evaluation error:", error);
      evaluation = createFallbackEvaluation(content, prompt);
      score = evaluation.overallScore / 100;
    }
  } else {
    // Fallback evaluation without AI
    evaluation = createFallbackEvaluation(content, prompt);
    score = evaluation.overallScore / 100;
  }

  // Save submission
  const submission = await prisma.writingSubmission.create({
    data: {
      sessionId,
      promptId,
      content,
      evaluation: evaluation as object,
      score,
    },
  });

  // Save study session
  await prisma.studySession.create({
    data: {
      sessionId,
      module: "writing",
      itemsPracticed: 1,
      score,
      endedAt: new Date(),
    },
  });

  return NextResponse.json({
    submission: {
      id: submission.id,
      content: submission.content,
      evaluation,
      score,
    },
  });
}

function createFallbackEvaluation(
  content: string,
  prompt: { wordCountMin: number | null; wordCountMax: number | null }
) {
  const wordCount = content.trim().split(/\s+/).length;
  const meetsMinWords = !prompt.wordCountMin || wordCount >= prompt.wordCountMin;
  const meetsMaxWords = !prompt.wordCountMax || wordCount <= prompt.wordCountMax;
  const lengthScore = meetsMinWords && meetsMaxWords ? 4 : meetsMinWords ? 3 : 2;

  return {
    overallScore: lengthScore * 15,
    taskCompletion: {
      score: lengthScore,
      feedback:
        "AI evaluation is not available. This is a basic word-count check only.",
    },
    grammar: {
      score: 0,
      errors: [],
      feedback:
        "Grammar evaluation requires the OpenAI API. Please configure OPENAI_API_KEY.",
    },
    vocabulary: {
      score: 0,
      feedback: "Vocabulary evaluation requires the OpenAI API.",
    },
    coherence: {
      score: 0,
      feedback: "Coherence evaluation requires the OpenAI API.",
    },
    wordCount,
    suggestions: [
      "Configure the OPENAI_API_KEY environment variable for detailed AI-powered feedback.",
    ],
    correctedVersion: null,
    encouragement:
      "Great job writing in German! Configure AI evaluation for detailed feedback.",
  };
}
