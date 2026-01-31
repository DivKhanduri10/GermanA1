import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Headphones,
  FileText,
  PenTool,
  Mic,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const modules = [
  {
    title: "Vocabulary",
    description: "Learn 650 essential German words with flashcards, quizzes, and games",
    href: "/vocabulary",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    title: "Grammar",
    description: "Master 14 core A1 grammar topics with interactive exercises",
    href: "/grammar",
    icon: GraduationCap,
    color: "text-green-500",
  },
  {
    title: "Listening",
    description: "Practice comprehension with dialogues, announcements, and monologues",
    href: "/listening",
    icon: Headphones,
    color: "text-purple-500",
  },
  {
    title: "Reading",
    description: "Improve reading skills with emails, ads, and short texts",
    href: "/reading",
    icon: FileText,
    color: "text-orange-500",
  },
  {
    title: "Writing",
    description: "Practice form filling and message writing with AI feedback",
    href: "/writing",
    icon: PenTool,
    color: "text-pink-500",
  },
  {
    title: "Speaking",
    description: "Prepare for the speaking exam with prompts and phrase libraries",
    href: "/speaking",
    icon: Mic,
    color: "text-teal-500",
  },
];

export function ModuleCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => {
        const Icon = mod.icon;
        return (
          <Link key={mod.title} href={mod.href}>
            <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${mod.color}`} />
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                </div>
                <CardDescription className="mt-2">
                  {mod.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
