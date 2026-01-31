import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="rounded-full bg-muted p-6">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold">Seite nicht gefunden</h2>
        <p className="text-muted-foreground text-center max-w-md">
          The page you&apos;re looking for doesn&apos;t exist. It might have
          been moved or you may have mistyped the URL.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
