import { useRoute, Link } from "wouter";
import { useGetInfluencer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users, Phone, Instagram, Youtube, Twitter, MessageCircle, ArrowLeft, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function InfluencerProfile() {
  const [, params] = useRoute("/influencers/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;

  const { data: influencer, isLoading, isError } = useGetInfluencer(id, {
    query: {
      enabled: !!id,
      queryKey: ["influencer", id]
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex-1 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError || !influencer) {
    return (
      <div className="container mx-auto px-4 py-12 flex-1 text-center">
        <h2 className="text-2xl font-bold mb-4">Creator Not Found</h2>
        <p className="text-muted-foreground mb-8">The creator you're looking for doesn't exist or has been removed.</p>
        <Link href="/influencers">
          <Button>Back to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex-1 max-w-5xl">
      <Link href="/influencers">
        <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </Link>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-accent to-secondary opacity-80"></div>
        
        <div className="px-6 md:px-12 pb-12 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start -mt-20 md:-mt-24 mb-8">
            <Avatar className="h-40 w-40 md:h-48 md:w-48 border-8 border-card shadow-lg bg-background">
              <AvatarImage src={influencer.profileImageUrl || undefined} alt={influencer.name} className="object-cover" />
              <AvatarFallback className="text-5xl font-black text-primary bg-primary/10">
                {influencer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pt-2 md:pt-28 w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{influencer.name}</h1>
                  <div className="flex flex-wrap gap-3 text-muted-foreground font-medium mb-4">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {influencer.location}
                    </span>
                    <span className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-1" /> Joined {format(new Date(influencer.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-secondary/15 text-secondary-foreground hover:bg-secondary/25 text-sm py-1 px-3">
                      {influencer.niche}
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 border-primary/30 text-primary">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {(influencer.followersCount || 0).toLocaleString()} Followers
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  {influencer.whatsappNumber && (
                    <a href={`https://wa.me/${influencer.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white hover-elevate shadow-sm h-12 text-base font-bold">
                        <MessageCircle className="w-5 h-5 mr-2" /> Message on WhatsApp
                      </Button>
                    </a>
                  )}
                  {influencer.phone && (
                    <a href={`tel:${influencer.phone}`}>
                      <Button variant="outline" className="w-full h-12 text-base font-bold border-2">
                        <Phone className="w-5 h-5 mr-2" /> Call Creator
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center border-b pb-2">
                  About {influencer.name.split(' ')[0]}
                </h2>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {influencer.bio || "This creator hasn't added a bio yet. Reach out to them directly to learn more about their content and collaboration opportunities."}
                  </p>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-muted/30 rounded-2xl p-6 border">
                <h3 className="font-bold text-lg mb-4">Social Links</h3>
                <div className="space-y-3">
                  {influencer.instagramUrl ? (
                    <a href={influencer.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Instagram</span>
                    </a>
                  ) : null}
                  
                  {influencer.tiktokUrl ? (
                    <a href={influencer.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      </div>
                      <span className="font-medium">TikTok</span>
                    </a>
                  ) : null}
                  
                  {influencer.youtubeUrl ? (
                    <a href={influencer.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <span className="font-medium">YouTube</span>
                    </a>
                  ) : null}

                  {!influencer.instagramUrl && !influencer.tiktokUrl && !influencer.youtubeUrl && (
                    <p className="text-sm text-muted-foreground italic">No social links provided.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
