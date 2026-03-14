import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-brand text-6xl text-primary mb-4">404</h1>
        <p className="text-xl text-white mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
