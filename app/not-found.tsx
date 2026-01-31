import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. It might have been
        moved or you may have mistyped the URL.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
