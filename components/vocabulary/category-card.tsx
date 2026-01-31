"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryCardProps {
  category: string;
  total: number;
  started: number;
  mastered: number;
}

export function CategoryCard({
  category,
  total,
  started,
  mastered,
}: CategoryCardProps) {
  const progressPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <Link href={`/vocabulary/flashcards?category=${encodeURIComponent(category)}`}>
      <Card className="h-full transition-colors hover:bg-accent/50 cursor-pointer">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{category}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {mastered}/{total} mastered
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
