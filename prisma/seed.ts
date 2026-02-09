import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

interface VocabEntry {
  word: string;
  article: string | null;
  plural: string | null;
  translation: string;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  category: string;
  ipaPronunciation: string | null;
  difficultyLevel: number;
}

async function seedVocabulary() {
  const filePath = path.join(__dirname, "../data/vocabulary.json");
  if (!fs.existsSync(filePath)) {
    console.log("vocabulary.json not found, skipping vocabulary seed");
    return;
  }

  const data: VocabEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${data.length} vocabulary words...`);

  // Clear existing
  await prisma.vocabulary.deleteMany();

  // Batch insert
  const batchSize = 50;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await prisma.vocabulary.createMany({
      data: batch.map((entry) => ({
        word: entry.word,
        article: entry.article,
        plural: entry.plural,
        translation: entry.translation,
        exampleSentence: entry.exampleSentence,
        exampleTranslation: entry.exampleTranslation,
        category: entry.category,
        ipaPronunciation: entry.ipaPronunciation,
        difficultyLevel: entry.difficultyLevel,
      })),
    });
    console.log(`  Inserted ${Math.min(i + batchSize, data.length)}/${data.length}`);
  }

  console.log("Vocabulary seeding complete!");
}

async function seedGrammarTopics() {
  const filePath = path.join(__dirname, "../data/grammar-topics.json");
  if (!fs.existsSync(filePath)) {
    console.log("grammar-topics.json not found, skipping grammar seed");
    return;
  }

  const topics = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${topics.length} grammar topics...`);

  await prisma.grammarExercise.deleteMany();
  await prisma.grammarTopic.deleteMany();

  for (const topic of topics) {
    await prisma.grammarTopic.create({
      data: {
        topicName: topic.topicName,
        topicSlug: topic.topicSlug,
        description: topic.description,
        difficultyOrder: topic.difficultyOrder,
        contentMarkdown: topic.contentMarkdown,
      },
    });
  }

  console.log("Grammar topics seeding complete!");
}

async function seedGrammarExercises() {
  const filePath = path.join(__dirname, "../data/grammar-exercises.json");
  if (!fs.existsSync(filePath)) {
    console.log("grammar-exercises.json not found, skipping grammar exercises seed");
    return;
  }

  const exercises = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${exercises.length} grammar exercises...`);

  // Get topic slug -> id mapping
  const topics = await prisma.grammarTopic.findMany({
    select: { id: true, topicSlug: true },
  });
  const topicMap = new Map(topics.map((t) => [t.topicSlug, t.id]));

  const batchSize = 50;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    await prisma.grammarExercise.createMany({
      data: batch
        .filter((ex: { topicSlug: string }) => topicMap.has(ex.topicSlug))
        .map((ex: { topicSlug: string; exerciseType: string; question: string; options: unknown; correctAnswer: string; explanation: string; difficulty: number }) => ({
          topicId: topicMap.get(ex.topicSlug)!,
          exerciseType: ex.exerciseType,
          question: ex.question,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          difficulty: ex.difficulty || 1,
        })),
    });
    console.log(`  Inserted ${Math.min(i + batchSize, exercises.length)}/${exercises.length}`);
  }

  console.log("Grammar exercises seeding complete!");
}

async function seedReadingExercises() {
  const filePath = path.join(__dirname, "../data/reading-exercises.json");
  if (!fs.existsSync(filePath)) {
    console.log("reading-exercises.json not found, skipping reading seed");
    return;
  }

  const exercises = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${exercises.length} reading exercises...`);

  await prisma.readingExercise.deleteMany();

  const batchSize = 50;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    await prisma.readingExercise.createMany({ data: batch });
    console.log(`  Inserted ${Math.min(i + batchSize, exercises.length)}/${exercises.length}`);
  }

  console.log("Reading exercises seeding complete!");
}

async function seedListeningExercises() {
  const filePath = path.join(__dirname, "../data/listening-exercises.json");
  if (!fs.existsSync(filePath)) {
    console.log("listening-exercises.json not found, skipping listening seed");
    return;
  }

  const exercises = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${exercises.length} listening exercises...`);

  await prisma.listeningExercise.deleteMany();

  const batchSize = 50;
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize);
    await prisma.listeningExercise.createMany({
      data: batch.map((e: Record<string, unknown>) => ({
        partNumber: e.partNumber,
        transcript: e.transcript,
        question: e.question,
        questionType: e.questionType,
        options: e.options,
        correctAnswer: e.correctAnswer,
        setId: e.setId,
      })),
    });
    console.log(`  Inserted ${Math.min(i + batchSize, exercises.length)}/${exercises.length}`);
  }

  console.log("Listening exercises seeding complete!");
}

async function seedWritingPrompts() {
  const filePath = path.join(__dirname, "../data/writing-prompts.json");
  if (!fs.existsSync(filePath)) {
    console.log("writing-prompts.json not found, skipping writing seed");
    return;
  }

  const prompts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${prompts.length} writing prompts...`);

  await prisma.writingPrompt.deleteMany();

  await prisma.writingPrompt.createMany({ data: prompts });

  console.log("Writing prompts seeding complete!");
}

async function seedSpeakingPrompts() {
  const filePath = path.join(__dirname, "../data/speaking-prompts.json");
  if (!fs.existsSync(filePath)) {
    console.log("speaking-prompts.json not found, skipping speaking seed");
    return;
  }

  const prompts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Seeding ${prompts.length} speaking prompts...`);

  await prisma.speakingPrompt.deleteMany();

  await prisma.speakingPrompt.createMany({ data: prompts });

  console.log("Speaking prompts seeding complete!");
}

async function main() {
  console.log("Starting database seed...\n");

  await seedVocabulary();
  await seedGrammarTopics();
  await seedGrammarExercises();
  await seedReadingExercises();
  await seedListeningExercises();
  await seedWritingPrompts();
  await seedSpeakingPrompts();

  console.log("\nAll seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
