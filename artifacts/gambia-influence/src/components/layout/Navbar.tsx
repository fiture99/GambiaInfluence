import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className=" flex items-center gap-2 ">
          <img
            src="/Logo.png"
            alt="GamInfluencers"
            className="h-16 w-auto object-contain mix-blend-multiply"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/influencers" className="text-sm font-medium  transition-colors">
            <Button  className="bg-transparent text-prmary border-0 hover:text-blue-900 hover:border-b-2 hover:border-blue-900 hover:rounded-none">Browse</Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/register/influencer" className="hidden sm:block">
              <Button variant="outline"  className=" border-0 hover:text-blue-900 hover:border-b-2 hover:border-blue-900 hover:rounded-none">Join as Influencer</Button>
            </Link>
            <Link href="/register/business"  >
              <Button className="bg-blue-900 text-white border-0 border-b-2 border-blue-900 hover:bg-transparent hover:text-blue-900 hover:border-b-2 hover:border-blue-900 hover:rounded-none">For Businesses</Button>    
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
