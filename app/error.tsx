"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Something went wrong
          </CardTitle>
          <CardDescription>
            {error.message || "An unexpected error occurred while loading this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
