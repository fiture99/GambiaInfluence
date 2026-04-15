import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetPlatformStats, useGetTopInfluencers, useListBusinesses, useGetNicheBreakdown } from "@workspace/api-client-react";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { ArrowRight, MapPin, TrendingUp, Users, Target, Camera, Music, Utensils, Heart, Briefcase, Shirt, MonitorPlay, Dumbbell, Globe, Smile } from "lucide-react";

// Helper to map niches to icons and colors
const getNicheConfig = (niche: string) => {
  const normalized = niche.toLowerCase();
  if (normalized.includes('photo') || normalized.includes('art')) return { icon: Camera, color: 'bg-blue-500/10 text-blue-600', border: 'border-blue-200 hover:border-blue-400' };
  if (normalized.includes('music') || normalized.includes('dance')) return { icon: Music, color: 'bg-purple-500/10 text-purple-600', border: 'border-purple-200 hover:border-purple-400' };
  if (normalized.includes('food') || normalized.includes('cook')) return { icon: Utensils, color: 'bg-orange-500/10 text-orange-600', border: 'border-orange-200 hover:border-orange-400' };
  if (normalized.includes('beauty') || normalized.includes('makeup')) return { icon: Heart, color: 'bg-pink-500/10 text-pink-600', border: 'border-pink-200 hover:border-pink-400' };
  if (normalized.includes('business') || normalized.includes('finance')) return { icon: Briefcase, color: 'bg-emerald-500/10 text-emerald-600', border: 'border-emerald-200 hover:border-emerald-400' };
  if (normalized.includes('fashion') || normalized.includes('style')) return { icon: Shirt, color: 'bg-rose-500/10 text-rose-600', border: 'border-rose-200 hover:border-rose-400' };
  if (normalized.includes('tech') || normalized.includes('game')) return { icon: MonitorPlay, color: 'bg-indigo-500/10 text-indigo-600', border: 'border-indigo-200 hover:border-indigo-400' };
  if (normalized.includes('fitness') || normalized.includes('health') || normalized.includes('sport')) return { icon: Dumbbell, color: 'bg-red-500/10 text-red-600', border: 'border-red-200 hover:border-red-400' };
  if (normalized.includes('travel')) return { icon: Globe, color: 'bg-cyan-500/10 text-cyan-600', border: 'border-cyan-200 hover:border-cyan-400' };
  return { icon: Smile, color: 'bg-primary/10 text-primary', border: 'border-primary/20 hover:border-primary/40' };
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats({ query: { queryKey: ["platformStats"] } });
  const { data: topInfluencers, isLoading: influencersLoading } = useGetTopInfluencers({ limit: 6 }, { query: { queryKey: ["topInfluencers", { limit: 6 }] } });
  const { data: businesses, isLoading: businessesLoading } = useListBusinesses({ query: { queryKey: ["businesses"] } });
  const { data: niches } = useGetNicheBreakdown({ query: { queryKey: ["niches"] } });

  // Profile images for hero collage
  const heroImages = [
    "/profiles/fatou-jallow.png",
    "/profiles/lamin-touray.png",
    "/profiles/mariama-ceesay.png",
    "/profiles/alieu-darboe.png",
    "/profiles/ndey-sanneh.png"
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
                The #1 Influencer Platform in West Africa
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
                Discover <span className="text-primary relative inline-block">
                  Authentic
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,0 100,5 Q50,10 0,5 Z" fill="currentColor" />
                  </svg>
                </span> Creators
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl">
                Connect your business with the most vibrant and influential voices shaping culture across The Gambia and Senegal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/influencers">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl font-bold hover-elevate shadow-lg shadow-primary/20">
                    Find Creators
                  </Button>
                </Link>
                <Link href="/register/business">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl font-bold bg-background hover-elevate border-2">
                    I'm a Business
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Collage */}
            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Center big image */}
                <div className="absolute z-30 w-56 h-72 rounded-2xl overflow-hidden border-4 border-background shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src={heroImages[0]} alt="Creator" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-3">
                    <p className="text-white font-bold text-sm">Fatou Jallow</p>
                    <p className="text-primary text-xs font-medium">Fashion</p>
                  </div>
                </div>
                {/* Top left */}
                <div className="absolute z-20 w-40 h-48 rounded-2xl overflow-hidden border-4 border-background shadow-xl -translate-x-32 -translate-y-24 -rotate-6 hover:-rotate-2 transition-transform duration-500">
                  <img src={heroImages[1]} alt="Creator" className="w-full h-full object-cover" />
                </div>
                {/* Top right */}
                <div className="absolute z-20 w-40 h-52 rounded-2xl overflow-hidden border-4 border-background shadow-xl translate-x-36 -translate-y-16 rotate-12 hover:rotate-6 transition-transform duration-500">
                  <img src={heroImages[2]} alt="Creator" className="w-full h-full object-cover" />
                </div>
                {/* Bottom left */}
                <div className="absolute z-10 w-36 h-44 rounded-2xl overflow-hidden border-4 border-background shadow-xl -translate-x-28 translate-y-32 -rotate-12 hover:-rotate-6 transition-transform duration-500 opacity-90">
                  <img src={heroImages[3]} alt="Creator" className="w-full h-full object-cover" />
                </div>
                {/* Bottom right */}
                <div className="absolute z-10 w-44 h-48 rounded-2xl overflow-hidden border-4 border-background shadow-xl translate-x-32 translate-y-28 rotate-6 hover:rotate-0 transition-transform duration-500 opacity-90">
                  <img src={heroImages[4]} alt="Creator" className="w-full h-full object-cover" />
                </div>
                
                {/* Decorative blob */}
                <div className="absolute z-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-60"></div>
                <div className="absolute z-0 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-60 translate-x-20 translate-y-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Darker Brand Theme */}
      <section className="py-16 bg-zinc-950 text-zinc-50 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            <div className="flex flex-col items-center p-4 text-center space-y-3 pt-8 md:pt-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-primary border border-zinc-800 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">{statsLoading ? "-" : stats?.totalInfluencers.toLocaleString() || 0}</h3>
              <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Active Creators</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center space-y-3 pt-8 md:pt-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-secondary border border-zinc-800 shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">{statsLoading ? "-" : stats?.totalBusinesses.toLocaleString() || 0}</h3>
              <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Local Businesses</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center space-y-3 pt-8 md:pt-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-accent border border-zinc-800 shadow-inner">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">{statsLoading ? "-" : ((stats?.totalFollowers || 0) / 1000000).toFixed(1)}M+</h3>
              <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Total Reach</p>
            </div>
            <div className="flex flex-col items-center p-4 text-center space-y-3 pt-8 md:pt-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-destructive border border-zinc-800 shadow-inner">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight capitalize">{statsLoading ? "-" : stats?.topLocation || "Gambia"}</h3>
              <p className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Top Location</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Influencers */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Trending Voices</h2>
              <p className="text-lg text-muted-foreground font-medium">Discover the creators shaping culture and driving engagement across the region today.</p>
            </div>
            <Link href="/influencers">
              <Button variant="outline" className="mt-6 md:mt-0 font-bold border-2 hidden md:flex">
                View all creators <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {influencersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[380px] bg-card rounded-2xl animate-pulse border shadow-sm"></div>
              ))}
            </div>
          ) : topInfluencers && topInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topInfluencers.map(influencer => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background rounded-2xl border border-dashed border-border/50 shadow-sm">
              <h3 className="text-xl font-bold text-muted-foreground">No creators found</h3>
              <p className="text-muted-foreground mt-2">Be the first to join the platform!</p>
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link href="/influencers">
              <Button variant="outline" className="w-full font-bold border-2">
                View all creators <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Niche */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Find Your Perfect Match</h2>
            <p className="text-lg text-muted-foreground font-medium">Browse creators by their specialized content categories to reach your exact target audience.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {niches?.map((n) => {
              const config = getNicheConfig(n.niche);
              const Icon = config.icon;
              return (
                <Link key={n.niche} href={`/influencers?niche=${encodeURIComponent(n.niche)}`}>
                  <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 bg-card hover:-translate-y-1 transition-all cursor-pointer shadow-sm hover:shadow-md ${config.border}`}>
                    <div className={`p-2 rounded-xl ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold capitalize text-foreground">{n.niche}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{n.count} creators</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground font-medium">Three simple steps to launch your next successful influencer marketing campaign.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-3xl border shadow-sm relative text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-primary/20 -mt-16 border-4 border-background">1</div>
              <h3 className="text-xl font-bold mb-3">Discover Creators</h3>
              <p className="text-muted-foreground">Browse our directory of verified local influencers across various niches and platforms.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border shadow-sm relative text-center mt-8 md:mt-0">
              <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-secondary/20 -mt-16 border-4 border-background">2</div>
              <h3 className="text-xl font-bold mb-3">Connect Directly</h3>
              <p className="text-muted-foreground">Reach out via WhatsApp or phone to discuss your campaign requirements and budget.</p>
            </div>
            
            <div className="bg-background p-8 rounded-3xl border shadow-sm relative text-center mt-8 md:mt-0">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-6 shadow-lg shadow-accent/20 -mt-16 border-4 border-background">3</div>
              <h3 className="text-xl font-bold mb-3">Grow Your Brand</h3>
              <p className="text-muted-foreground">Launch authentic campaigns that resonate with local audiences and drive real business results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Businesses Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Trusted by Local Businesses</h2>
            <p className="text-lg text-muted-foreground font-medium">Join these brands leveraging the power of local influence to grow their reach.</p>
          </div>

          {businessesLoading ? (
            <div className="flex flex-wrap justify-center gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="w-36 h-16 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : businesses && businesses.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto">
              {businesses.slice(0, 12).map(business => (
                <div key={business.id} className="bg-card px-6 py-4 rounded-xl shadow-sm border-2 font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center min-w-[140px] text-center">
                  {business.businessName}
                </div>
              ))}
            </div>
          ) : null}
          
          <div className="mt-16 text-center bg-muted/40 rounded-3xl p-12 max-w-4xl mx-auto border border-dashed border-border/60">
            <h3 className="text-2xl font-black mb-4">Want to reach more customers?</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create a business profile to start connecting with the perfect influencers for your brand.</p>
            <Link href="/register/business">
              <Button size="lg" className="rounded-xl font-bold hover-elevate px-8 h-14 text-lg">
                Register Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
