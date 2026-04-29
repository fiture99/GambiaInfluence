import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-black text-primary mb-4 tracking-tighter">GamInfluencers</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connecting local businesses with the vibrant voices of West African digital culture.
        </p>
        <div className="flex justify-center gap-6 text-sm font-medium">
          <Link href="/influencers" className="hover:text-primary transition-colors">Browse</Link>
          <Link href="/register/influencer" className="hover:text-primary transition-colors">Influencers</Link>
          <Link href="/register/business" className="hover:text-primary transition-colors">Businesses</Link>
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} GamInfluencers. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
