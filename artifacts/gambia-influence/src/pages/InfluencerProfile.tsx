import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetInfluencer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Users,
  Instagram,
  Youtube,
  CalendarDays,
  Megaphone,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

const PROMO_TYPES = [
  "Instagram Post",
  "Instagram Story",
  "Instagram Reel",
  "TikTok Video",
  "YouTube Review",
  "Facebook Post",
  "Sponsored Story",
  "Product Unboxing",
  "Live Stream Mention",
  "Other",
];

interface PromoRequestForm {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  promoType: string;
  description: string;
}

const empty: PromoRequestForm = {
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  promoType: "",
  description: "",
};

export default function InfluencerProfile() {
  const [, params] = useRoute("/influencers/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const { data: influencer, isLoading, isError } = useGetInfluencer(id, {
    query: { enabled: !!id, queryKey: ["influencer", id] },
  });

  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [form, setForm] = useState<PromoRequestForm>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<PromoRequestForm>>({});

  function validate(): boolean {
    const e: Partial<PromoRequestForm> = {};
    if (!form.contactName.trim()) e.contactName = "Your name is required";
    if (!form.promoType) e.promoType = "Select a promotion type";
    if (!form.description.trim()) e.description = "Please describe what you want promoted";
    if (form.description.trim().length < 20) e.description = "Please give more detail (at least 20 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/promo-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencerId: id,
          contactName: form.contactName,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          promoType: form.promoType,
          description: form.description,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        toast({ title: "Submission failed", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      setModalOpen(false);
      setSuccessOpen(true);
      setForm(empty);
      setErrors({});
    } catch {
      toast({ title: "Network error", description: "Please check your connection.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function field(k: keyof PromoRequestForm, value: string) {
    setForm(prev => ({ ...prev, [k]: value }));
    setErrors(prev => ({ ...prev, [k]: undefined }));
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex-1 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !influencer) {
    return (
      <div className="container mx-auto px-4 py-12 flex-1 text-center">
        <h2 className="text-2xl font-bold mb-4">Creator Not Found</h2>
        <p className="text-muted-foreground mb-8">The creator you're looking for doesn't exist or has been removed.</p>
        <Link href="/influencers"><Button>Back to Directory</Button></Link>
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
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-accent to-secondary opacity-80" />

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
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-secondary/15 text-secondary-foreground hover:bg-secondary/25 text-sm py-1 px-3">
                      {influencer.niche}
                    </Badge>
                    <Badge variant="outline" className="text-sm py-1 px-3 border-primary/30 text-primary">
                      <Users className="w-3.5 h-3.5 mr-1.5" />
                      {(influencer.followersCount || 0).toLocaleString()} Followers
                    </Badge>
                  </div>
                </div>

                {/* Request Promotion CTA */}
                <div className="flex flex-col gap-3 min-w-[220px]">
                  <Button
                    size="lg"
                    className="w-full h-12 text-base font-bold shadow-md"
                    onClick={() => setModalOpen(true)}
                  >
                    <Megaphone className="w-5 h-5 mr-2" />
                    Request Promotion
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    No account needed · Admin reviews all requests
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
            <div className="md:col-span-2 space-y-8">
              {/* About */}
              <section>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2">About {influencer.name.split(" ")[0]}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {influencer.bio || "This creator hasn't added a bio yet. Reach out to them directly to learn more about their content and collaboration opportunities."}
                </p>
              </section>

              {/* How it works */}
              <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="font-bold text-lg mb-4 text-primary">How Promotion Requests Work</h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
                    Click "Request Promotion" and fill in your details
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
                    Our team reviews your request and contacts you within 24 hours
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
                    We coordinate the campaign and verify the post goes live
                  </li>
                </ol>
              </section>
            </div>

            <div className="space-y-8">
              {/* Stats */}
              <section className="bg-muted/30 rounded-2xl p-6 border">
                <h3 className="font-bold text-lg mb-4">Creator Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Followers</span>
                    <span className="font-bold text-base">{(influencer.followersCount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Niche</span>
                    <span className="font-semibold capitalize">{influencer.niche}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold">{influencer.location}</span>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-muted/30 rounded-2xl p-6 border">
                <h3 className="font-bold text-lg mb-4">Social Links</h3>
                <div className="space-y-3">
                  {influencer.instagramUrl && (
                    <a href={influencer.instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Instagram</span>
                    </a>
                  )}
                  {influencer.tiktokUrl && (
                    <a href={influencer.tiktokUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      </div>
                      <span className="font-medium">TikTok</span>
                    </a>
                  )}
                  {influencer.youtubeUrl && (
                    <a href={influencer.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center p-3 rounded-xl bg-background border hover:border-primary transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <span className="font-medium">YouTube</span>
                    </a>
                  )}
                  {!influencer.instagramUrl && !influencer.tiktokUrl && !influencer.youtubeUrl && (
                    <p className="text-sm text-muted-foreground italic">No social links provided.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Request Promotion Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              Request a Promotion
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Send a request for <strong>{influencer.name}</strong> to promote your product or service.
              Our team will contact you to arrange everything.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Your Name <span className="text-destructive">*</span></Label>
              <Input
                id="contactName"
                placeholder="e.g. Aminata Jallow"
                value={form.contactName}
                onChange={e => field("contactName", e.target.value)}
              />
              {errors.contactName && <p className="text-destructive text-xs">{errors.contactName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={form.contactEmail}
                  onChange={e => field("contactEmail", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPhone">WhatsApp / Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+220 ..."
                  value={form.contactPhone}
                  onChange={e => field("contactPhone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Promotion Type <span className="text-destructive">*</span></Label>
              <Select value={form.promoType} onValueChange={v => field("promoType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose type of promotion..." />
                </SelectTrigger>
                <SelectContent>
                  {PROMO_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.promoType && <p className="text-destructive text-xs">{errors.promoType}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">What Do You Want Promoted? <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                placeholder="Describe your product or service and what you'd like the influencer to say or show. The more detail you give, the better we can help you."
                rows={4}
                value={form.description}
                onChange={e => field("description", e.target.value)}
              />
              {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-sm text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Request Sent!</h2>
              <p className="text-muted-foreground text-sm">
                Your promotion request has been received. Our team will review it and reach out to you within 24 hours to discuss next steps.
              </p>
            </div>
            <Button onClick={() => setSuccessOpen(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
