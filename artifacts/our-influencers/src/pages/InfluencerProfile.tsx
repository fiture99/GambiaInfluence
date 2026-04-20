import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  useGetInfluencer,
  useOiCreateQuickPromotion,
  getGetInfluencerQueryKey,
} from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Instagram, Youtube, Phone, Users, Star, MessageCircle, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROMO_TYPES = ["Sponsored Post", "Story Feature", "Product Review", "Brand Ambassador", "Event Coverage", "Giveaway", "Tutorial", "Other"];

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function InfluencerProfile() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "");
  const { data: influencer, isLoading } = useGetInfluencer(id, {
    query: { enabled: !isNaN(id), queryKey: getGetInfluencerQueryKey(id) },
  });

  const createMutation = useOiCreateQuickPromotion();
  const { toast } = useToast();
  const [form, setForm] = useState({ contactName: "", contactEmail: "", contactPhone: "", promoType: "", description: "" });
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!influencer) return;
    try {
      await createMutation.mutateAsync({
        data: {
          influencerId: influencer.id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-[320px_1fr] gap-8">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">Influencer not found</h2>
          <Button asChild variant="outline"><Link href="/">Back to home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/"><ArrowLeft className="w-4 h-4" /> Back to influencers</Link>
        </Button>

        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-10">
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg">
              {influencer.profileImageUrl ? (
                <img src={influencer.profileImageUrl} alt={influencer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-16 h-16 text-primary/30" />
                </div>
              )}
            </div>

            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-bold">{formatFollowers(influencer.followersCount)}</span>
                  <span className="text-sm text-muted-foreground">followers</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  {influencer.instagramUrl && (
                    <a href={influencer.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-600 hover:underline">
                      <Instagram className="w-4 h-4" /> Instagram <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {influencer.youtubeUrl && (
                    <a href={influencer.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-600 hover:underline">
                      <Youtube className="w-4 h-4" /> YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {influencer.whatsappNumber && (
                    <a href={`https://wa.me/${influencer.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-600 hover:underline">
                      <MessageCircle className="w-4 h-4" /> WhatsApp <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {influencer.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" /> {influencer.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="capitalize">{influencer.niche}</Badge>
                <span className="text-sm text-muted-foreground">{influencer.location}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{influencer.name}</h1>
            </div>

            {influencer.bio && (
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed">{influencer.bio}</p>
              </div>
            )}

            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Request a Promotion</CardTitle>
                <p className="text-sm text-muted-foreground">No account needed — fill in your details and we'll get back to you.</p>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Request Sent!</h3>
                    <p className="text-sm text-muted-foreground">We'll contact you within 24 hours.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={() => setSubmitted(false)}>Send another</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Your Name</Label>
                        <Input size={1} placeholder="Full name" value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Promotion Type</Label>
                        <Select value={form.promoType} onValueChange={v => setForm(f => ({ ...f, promoType: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                          <SelectContent>
                            {PROMO_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input type="email" placeholder="you@company.com" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Input placeholder="+1 555 000 0000" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">What to promote</Label>
                      <Textarea placeholder="Describe what you want promoted..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={createMutation.isPending || !form.promoType}>
                      {createMutation.isPending ? "Submitting..." : "Send Request"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
