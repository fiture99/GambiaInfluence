import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats, useGetTopInfluencers, useListBusinesses } from "@workspace/api-client-react";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { ArrowRight, MapPin, TrendingUp, Users, Target } from "lucide-react";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats({ query: { queryKey: ["platformStats"] } });
  const { data: topInfluencers, isLoading: influencersLoading } = useGetTopInfluencers({ limit: 4 }, { query: { queryKey: ["topInfluencers", { limit: 4 }] } });
  const { data: businesses, isLoading: businessesLoading } = useListBusinesses({ query: { queryKey: ["businesses"] } });

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-foreground max-w-4xl mx-auto leading-tight">
            Discover <span className="text-primary">West Africa's</span> Most Vibrant Creators
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
            Connect your business with the authentic voices of The Gambia. The local marketplace for digital culture.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/influencers">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl font-bold hover-elevate">
                Find Influencers
              </Button>
            </Link>
            <Link href="/register/business">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl font-bold bg-background/80 hover-elevate">
                I'm a Business
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Abstract shapes in background */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y relative z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center p-6 text-center space-y-2">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary mb-2">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black tracking-tight">{statsLoading ? "-" : stats?.totalInfluencers.toLocaleString() || 0}</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Active Creators</p>
            </div>
            <div className="flex flex-col items-center p-6 text-center space-y-2">
              <div className="p-4 bg-secondary/10 rounded-2xl text-secondary mb-2">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black tracking-tight">{statsLoading ? "-" : stats?.totalBusinesses.toLocaleString() || 0}</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Local Businesses</p>
            </div>
            <div className="flex flex-col items-center p-6 text-center space-y-2">
              <div className="p-4 bg-accent/20 rounded-2xl text-accent-foreground mb-2">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black tracking-tight">{statsLoading ? "-" : ((stats?.totalFollowers || 0) / 1000000).toFixed(1)}M+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Total Reach</p>
            </div>
            <div className="flex flex-col items-center p-6 text-center space-y-2">
              <div className="p-4 bg-destructive/10 rounded-2xl text-destructive mb-2">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-black tracking-tight capitalize">{statsLoading ? "-" : stats?.topLocation || "Gambia"}</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Top Location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black tracking-tight mb-4">Trending Voices</h2>
              <p className="text-lg text-muted-foreground">Discover the creators shaping culture and driving engagement across The Gambia today.</p>
            </div>
            <Link href="/influencers">
              <Button variant="ghost" className="mt-4 md:mt-0 font-bold hidden md:flex">
                View all creators <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {influencersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[350px] bg-muted/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : topInfluencers && topInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topInfluencers.map(influencer => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border/50">
              <h3 className="text-xl font-bold text-muted-foreground">No creators found</h3>
              <p className="text-muted-foreground mt-2">Be the first to join the platform!</p>
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/influencers">
              <Button variant="outline" className="w-full font-bold">
                View all creators <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Businesses Section */}
      <section className="py-24 bg-muted/20 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black tracking-tight mb-4">Trusted by Local Businesses</h2>
            <p className="text-lg text-muted-foreground">Join these businesses leveraging the power of local influence to grow their reach.</p>
          </div>

          {businessesLoading ? (
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-32 h-12 bg-muted/50 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : businesses && businesses.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {businesses.slice(0, 10).map(business => (
                <div key={business.id} className="bg-background px-6 py-4 rounded-xl shadow-sm border font-bold text-foreground/80 flex items-center justify-center min-w-[140px] text-center">
                  {business.businessName}
                </div>
              ))}
            </div>
          ) : null}
          
          <div className="mt-16 text-center">
            <Link href="/register/business">
              <Button size="lg" className="rounded-xl font-bold hover-elevate">
                Register Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
