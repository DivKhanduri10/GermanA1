import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Headphones,
  FileText,
  PenTool,
  Mic,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const modules = [
  {
    title: "Vocabulary",
    description:
      "Learn 650 essential German words with flashcards, quizzes, and games",
    href: "/vocabulary",
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950",
    borderColor: "group-hover:border-blue-300 dark:group-hover:border-blue-800",
  },
  {
    title: "Grammar",
    description:
      "Master 14 core A1 grammar topics with interactive exercises",
    href: "/grammar",
    icon: GraduationCap,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950",
    borderColor:
      "group-hover:border-green-300 dark:group-hover:border-green-800",
  },
  {
    title: "Listening",
    description:
      "Practice comprehension with dialogues, announcements, and monologues",
    href: "/listening",
    icon: Headphones,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950",
    borderColor:
      "group-hover:border-purple-300 dark:group-hover:border-purple-800",
  },
  {
    title: "Reading",
    description:
      "Improve reading skills with emails, ads, and short texts",
    href: "/reading",
    icon: FileText,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-950",
    borderColor:
      "group-hover:border-orange-300 dark:group-hover:border-orange-800",
  },
  {
    title: "Writing",
    description:
      "Practice form filling and message writing with AI feedback",
    href: "/writing",
    icon: PenTool,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-950",
    borderColor:
      "group-hover:border-pink-300 dark:group-hover:border-pink-800",
  },
  {
    title: "Speaking",
    description:
      "Prepare for the speaking exam with prompts and phrase libraries",
    href: "/speaking",
    icon: Mic,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-950",
    borderColor:
      "group-hover:border-teal-300 dark:group-hover:border-teal-800",
  },
];

export function ModuleCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod) => {
        const Icon = mod.icon;
        return (
          <Link key={mod.title} href={mod.href} className="group">
            <Card
              className={`h-full transition-all duration-200 hover:shadow-md cursor-pointer ${mod.borderColor}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${mod.bgColor}`}>
                    <Icon className={`h-5 w-5 ${mod.color}`} />
                  </div>
                  <CardTitle className="text-lg">{mod.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-3">
                  {mod.description}
                </CardDescription>
                <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Start learning
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
