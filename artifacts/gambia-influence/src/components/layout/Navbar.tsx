import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black text-primary tracking-tighter">GamInfluencers</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/influencers" className="text-sm font-medium hover:text-primary transition-colors">
            Browse
          </Link>
          <div className="flex gap-2">
            <Link href="/register/influencer" className="hidden sm:block">
              <Button variant="outline">Join as Influencer</Button>
            </Link>
            <Link href="/register/business">
              <Button>For Businesses</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
