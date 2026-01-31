"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="rounded-full bg-destructive/10 p-4 w-fit mx-auto mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error.message ||
              "An unexpected error occurred while loading this page."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
