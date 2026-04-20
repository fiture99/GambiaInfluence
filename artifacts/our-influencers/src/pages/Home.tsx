import { useState } from "react";
import { Link } from "wouter";
import {
  useListInfluencers,
  useGetPlatformStats,
  useGetNicheBreakdown,
  useOiCreateQuickPromotion,
  getListInfluencersQueryKey,
} from "@workspace/api-client-react";
import type { Influencer } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, TrendingUp, Star, ArrowRight, Instagram, Youtube, Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NICHES = ["All", "fashion", "comedy", "tech", "food", "lifestyle", "sports", "beauty", "travel", "music", "gaming"];
const PROMO_TYPES = ["Sponsored Post", "Story Feature", "Product Review", "Brand Ambassador", "Event Coverage", "Giveaway", "Tutorial", "Other"];

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <Link href={`/influencers/${influencer.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden">
        <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
          {influencer.profileImageUrl ? (
            <img
              src={influencer.profileImageUrl}
              alt={influencer.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
            <Badge className="text-xs mb-1 bg-primary/90 border-0 text-white capitalize">{influencer.niche}</Badge>
            <p className="text-white font-semibold text-sm leading-tight">{influencer.name}</p>
            <p className="text-white/70 text-xs">{influencer.location}</p>
          </div>
        </div>
        <CardContent className="py-3 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-foreground">{formatFollowers(influencer.followersCount)}</span>
              <span className="text-xs text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              {influencer.instagramUrl && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
              {influencer.youtubeUrl && <Youtube className="w-3.5 h-3.5 text-red-500" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickPromoForm() {
  const { data: influencers = [] } = useListInfluencers({
    query: { queryKey: getListInfluencersQueryKey() },
  });
  const createMutation = useOiCreateQuickPromotion();
  const { toast } = useToast();
  const [form, setForm] = useState({
    influencerId: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    promoType: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: {
          influencerId: parseInt(form.influencerId),
          contactName: form.contactName,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
          promoType: form.promoType,
          description: form.description,
        },
      });
      setSubmitted(true);
    } catch {
      toast({ title: "Failed to submit", description: "Please try again.", variant: "destructive" });
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Request Submitted!</h3>
        <p className="text-muted-foreground text-sm mb-4">Our team will contact you within 24 hours to discuss your campaign.</p>
        <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm({ influencerId: "", contactName: "", contactEmail: "", contactPhone: "", promoType: "", description: "" }); }}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Select Influencer</Label>
          <Select value={form.influencerId} onValueChange={v => setForm(f => ({ ...f, influencerId: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an influencer..." />
            </SelectTrigger>
            <SelectContent>
              {influencers.map(inf => (
                <SelectItem key={inf.id} value={String(inf.id)}>
                  {inf.name} ({formatFollowers(inf.followersCount)} followers)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Promotion Type</Label>
          <Select value={form.promoType} onValueChange={v => setForm(f => ({ ...f, promoType: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {PROMO_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Your Name</Label>
          <Input placeholder="Full name" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" placeholder="you@company.com" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input placeholder="+1 555 000 0000" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>What do you want promoted?</Label>
        <Textarea
          placeholder="Describe your product, service, or message. Include any specific requirements..."
          rows={4}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={createMutation.isPending || !form.influencerId || !form.promoType}>
        {createMutation.isPending ? "Submitting..." : "Submit Promotion Request"}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");

  const { data: influencers = [], isLoading } = useListInfluencers({
    params: {
      niche: niche !== "All" ? niche : undefined,
      search: search || undefined,
    },
    query: { queryKey: getListInfluencersQueryKey({ niche: niche !== "All" ? niche : undefined, search: search || undefined }) },
  });

  const { data: stats } = useGetPlatformStats();
  const { data: niches = [] } = useGetNicheBreakdown();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary/90 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 text-xs">
              The Premier Influencer Marketing Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Connect Your Brand with the{" "}
              <span className="text-amber-400">Right Influencers</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              We manage end-to-end influencer campaigns — from discovery to posting verification. Real results, real accountability.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-semibold" asChild>
                <a href="#quick-promo">Get Started — No Account Needed</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
        {stats && (
          <div className="relative border-t border-white/10 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-3 gap-4">
              {[
                { label: "Influencers", value: stats.totalInfluencers },
                { label: "Total Followers", value: formatFollowers(stats.totalFollowers) },
                { label: "Top Niche", value: stats.topNiche },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Influencer Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Our Influencers</h2>
            <p className="text-muted-foreground mt-1">Browse creators available for partnerships</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {NICHES.map(n => (
            <button
              key={n}
              onClick={() => setNiche(n)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                niche === n
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No influencers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {influencers.map(inf => <InfluencerCard key={inf.id} influencer={inf} />)}
          </div>
        )}
      </section>

      {/* Quick Promo Section */}
      <section id="quick-promo" className="bg-gradient-to-br from-slate-50 to-primary/5 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-8">
            <Badge className="mb-3 text-xs">No Account Needed</Badge>
            <h2 className="text-2xl font-bold text-foreground mb-2">Quick Promotion Request</h2>
            <p className="text-muted-foreground">
              Pick an influencer and tell us what you need. We'll handle everything and get back to you within 24 hours.
            </p>
          </div>
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-6 pb-6">
              <QuickPromoForm />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-bold">Our<span className="text-primary">Influencers</span></span>
            </div>
            <p className="text-xs text-white/40">© {new Date().getFullYear()} OurInfluencers. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
