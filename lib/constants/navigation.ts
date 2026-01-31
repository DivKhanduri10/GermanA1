import {
  BookOpen,
  GraduationCap,
  Headphones,
  FileText,
  PenTool,
  Mic,
  BarChart3,
  Home,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: { label: string; href: string }[];
}

export const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Vocabulary",
    href: "/vocabulary",
    icon: BookOpen,
    children: [
      { label: "Overview", href: "/vocabulary" },
      { label: "Flashcards", href: "/vocabulary/flashcards" },
      { label: "Quiz", href: "/vocabulary/quiz" },
      { label: "Matching Game", href: "/vocabulary/games" },
    ],
  },
  {
    label: "Grammar",
    href: "/grammar",
    icon: GraduationCap,
  },
  {
    label: "Listening",
    href: "/listening",
    icon: Headphones,
  },
  {
    label: "Reading",
    href: "/reading",
    icon: FileText,
  },
  {
    label: "Writing",
    href: "/writing",
    icon: PenTool,
  },
  {
    label: "Speaking",
    href: "/speaking",
    icon: Mic,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
];
