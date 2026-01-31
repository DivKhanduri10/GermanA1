"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  const isComplete = mastered === total && total > 0;

  return (
    <Link
      href={`/vocabulary/flashcards?category=${encodeURIComponent(category)}`}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{category}</CardTitle>
            {isComplete && (
              <Badge
                variant="default"
                className="text-[10px] px-1.5 py-0 h-5"
              >
                Done
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {mastered}/{total} mastered
              </span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            {started > mastered && (
              <p className="text-[11px] text-muted-foreground">
                {started - mastered} in progress
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
