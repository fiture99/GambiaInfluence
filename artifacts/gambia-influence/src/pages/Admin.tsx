import { useState, useEffect, useRef} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  useListInfluencers,
  useCreateInfluencer,
  useUpdateInfluencer,
  useDeleteInfluencer,
  getListInfluencersQueryKey,
  useListBusinesses,
  useCreateBusiness,
  useUpdateBusiness,
  useDeleteBusiness,
  getListBusinessesQueryKey,
  setAuthTokenGetter,
} from "@workspace/api-client-react";
import type { Influencer, Business } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, ArrowLeft, Users, Building2 } from "lucide-react";

const GAMBIAN_CITIES = [
  "Banjul", "Serekunda", "Bakau", "Brikama", "Kanifing",
  "Fajara", "Kotu", "Kololi", "Farafenni", "Lamin", "Sukuta", "Other",
];

const NICHES = [
  "fashion", "comedy", "tech", "food", "lifestyle",
  "sports", "beauty", "travel", "music", "gaming",
];

const BUSINESS_TYPES = [
  "restaurant", "shop", "hotel", "bank", "telecom",
  "NGO", "school", "hospital", "real estate", "other",
];

// ─── Influencer form ──────────────────────────────────────────────────────────

const influencerSchema = z.object({
  name: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  niche: z.string().min(1, "Required"),
  followersCount: z.coerce.number().min(0, "Must be 0 or more"),
  bio: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tiktokUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  youtubeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  profileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});



type InfluencerFormValues = z.infer<typeof influencerSchema>;

const influencerDefaults: InfluencerFormValues = {
  name: "", location: "", niche: "", followersCount: 0,
  bio: "", phone: "", whatsappNumber: "",
  instagramUrl: "", tiktokUrl: "", youtubeUrl: "", profileImageUrl: "",
};

function influencerToFormValues(inf: Influencer): InfluencerFormValues {
  return {
    name: inf.name,
    location: inf.location,
    niche: inf.niche,
    followersCount: inf.followersCount,
    bio: inf.bio ?? "",
    phone: inf.phone ?? "",
    whatsappNumber: inf.whatsappNumber ?? "",
    instagramUrl: inf.instagramUrl ?? "",
    tiktokUrl: inf.tiktokUrl ?? "",
    youtubeUrl: inf.youtubeUrl ?? "",
    profileImageUrl: inf.profileImageUrl ?? "",
  };
}

function cleanInfluencerPayload(values: InfluencerFormValues) {
  return {
    ...values,
    bio: values.bio || null,
    phone: values.phone || null,
    whatsappNumber: values.whatsappNumber || null,
    instagramUrl: values.instagramUrl || null,
    tiktokUrl: values.tiktokUrl || null,
    youtubeUrl: values.youtubeUrl || null,
    profileImageUrl: values.profileImageUrl || null,
  };
}

interface InfluencerDialogProps {
  open: boolean;
  onClose: () => void;
  editing: Influencer | null;
}

function InfluencerDialog({ open, onClose, editing }: InfluencerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createInfluencer = useCreateInfluencer();
  const updateInfluencer = useUpdateInfluencer();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    setImagePreview(editing?.profileImageUrl ?? null);
  }, [editing, open]);

  const form = useForm<InfluencerFormValues>({
    resolver: zodResolver(influencerSchema),
    values: editing ? influencerToFormValues(editing) : influencerDefaults,
  });

  function onSubmit(values: InfluencerFormValues) {
    const data = cleanInfluencerPayload(values);
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: getListInfluencersQueryKey() });

    if (editing) {
      updateInfluencer.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => { toast({ title: "Influencer updated" }); invalidate(); onClose(); },
          onError: () => toast({ title: "Error", description: "Failed to update.", variant: "destructive" }),
        }
      );
    } else {
      createInfluencer.mutate(
        { data },
        {
          onSuccess: () => { toast({ title: "Influencer created" }); invalidate(); onClose(); },
          onError: () => toast({ title: "Error", description: "Failed to create.", variant: "destructive" }),
        }
      );
    }
  }

  const isPending = createInfluencer.isPending || updateInfluencer.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Influencer" : "Add Influencer"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="profileImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Profile Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const base64 = reader.result as string;
                              setImagePreview(base64);
                              field.onChange(base64); // store base64 as the value
                            };
                            reader.readAsDataURL(file);
                          }}
                        />

                        {/* Preview */}
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-muted"
                          />
                        )}

                        {/* Upload button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? "Change Photo" : "Upload Photo"}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>Upload your profile photo</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GAMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="niche" render={({ field }) => (
                <FormItem>
                  <FormLabel>Niche *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select niche" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="followersCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Followers *</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {/* <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl><Input placeholder="220..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} /> */}
              {/* <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} /> */}
              <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram URL</FormLabel>
                  <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tiktokUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>TikTok URL</FormLabel>
                  <FormControl><Input placeholder="https://tiktok.com/@..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editing ? "Save Changes" : "Create Influencer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Business form ────────────────────────────────────────────────────────────

const businessSchema = z.object({
  businessName: z.string().min(1, "Required"),
  businessType: z.string().min(1, "Required"),
  location: z.string().optional(),
  contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const businessDefaults: BusinessFormValues = {
  businessName: "", businessType: "", location: "",
  contactEmail: "", contactPhone: "", description: "", website: "",
};

function businessToFormValues(b: Business): BusinessFormValues {
  return {
    businessName: b.businessName,
    businessType: b.businessType,
    location: b.location ?? "",
    contactEmail: b.contactEmail ?? "",
    contactPhone: b.contactPhone ?? "",
    description: b.description ?? "",
    website: b.website ?? "",
  };
}

function cleanBusinessPayload(values: BusinessFormValues) {
  return {
    ...values,
    location: values.location || null,
    contactEmail: values.contactEmail || null,
    contactPhone: values.contactPhone || null,
    description: values.description || null,
    website: values.website || null,
  };
}

interface BusinessDialogProps {
  open: boolean;
  onClose: () => void;
  editing: Business | null;
}

function BusinessDialog({ open, onClose, editing }: BusinessDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    values: editing ? businessToFormValues(editing) : businessDefaults,
  });

  function onSubmit(values: BusinessFormValues) {
    const data = cleanBusinessPayload(values);
    const invalidate = () =>
      queryClient.invalidateQueries({ queryKey: getListBusinessesQueryKey() });

    if (editing) {
      updateBusiness.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => { toast({ title: "Business updated" }); invalidate(); onClose(); },
          onError: () => toast({ title: "Error", description: "Failed to update.", variant: "destructive" }),
        }
      );
    } else {
      createBusiness.mutate(
        { data },
        {
          onSuccess: () => { toast({ title: "Business created" }); invalidate(); onClose(); },
          onError: () => toast({ title: "Error", description: "Failed to create.", variant: "destructive" }),
        }
      );
    }
  }

  const isPending = createBusiness.isPending || updateBusiness.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Business" : "Add Business"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="businessName" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="businessType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUSINESS_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GAMBIAN_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactEmail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Website</FormLabel>
                  <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editing ? "Save Changes" : "Create Business"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Influencers Tab ──────────────────────────────────────────────────────────

function InfluencersTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: influencers, isLoading } = useListInfluencers();
  const deleteInfluencer = useDeleteInfluencer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Influencer | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(inf: Influencer) { setEditing(inf); setDialogOpen(true); }
  function closeDialog() { setDialogOpen(false); setEditing(null); }

  function handleDelete() {
    if (deletingId === null) return;
    deleteInfluencer.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Influencer deleted" });
          queryClient.invalidateQueries({ queryKey: getListInfluencersQueryKey() });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  }

  const deletingInfluencer = influencers?.find((i) => i.id === deletingId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{influencers?.length ?? 0} influencers</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Influencer
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Niche</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Followers</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {influencers?.map((inf) => (
                <tr key={inf.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {inf.profileImageUrl ? (
                        <img
                          src={inf.profileImageUrl}
                          alt={inf.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                          {inf.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{inf.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{inf.location}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant="secondary" className="capitalize">{inf.niche}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {inf.followersCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(inf)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(inf.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {influencers?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No influencers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <InfluencerDialog open={dialogOpen} onClose={closeDialog} editing={editing} />

      <AlertDialog open={deletingId !== null} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete influencer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingInfluencer?.name}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={handleDelete}
              disabled={deleteInfluencer.isPending}
            >
              {deleteInfluencer.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Businesses Tab ───────────────────────────────────────────────────────────

function BusinessesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: businesses, isLoading } = useListBusinesses();
  const deleteBusiness = useDeleteBusiness();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Business | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(b: Business) { setEditing(b); setDialogOpen(true); }
  function closeDialog() { setDialogOpen(false); setEditing(null); }

  function handleDelete() {
    if (deletingId === null) return;
    deleteBusiness.mutate(
      { id: deletingId },
      {
        onSuccess: () => {
          toast({ title: "Business deleted" });
          queryClient.invalidateQueries({ queryKey: getListBusinessesQueryKey() });
          setDeletingId(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
          setDeletingId(null);
        },
      }
    );
  }

  const deletingBusiness = businesses?.find((b) => b.id === deletingId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{businesses?.length ?? 0} businesses</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Add Business
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Business Name</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Contact</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {businesses?.map((b) => (
                <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{b.businessName}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className="capitalize">{b.businessType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {b.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {b.contactEmail ?? b.contactPhone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(b)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(b.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {businesses?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No businesses yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <BusinessDialog open={dialogOpen} onClose={closeDialog} editing={editing} />

      <AlertDialog open={deletingId !== null} onOpenChange={(o) => { if (!o) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingBusiness?.businessName}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={handleDelete}
              disabled={deleteBusiness.isPending}
            >
              {deleteBusiness.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = "gi_admin_token";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

function applyToken(token: string) {
  sessionStorage.setItem(SESSION_KEY, token);
  setAuthTokenGetter(() => token);
}

function clearToken() {
  sessionStorage.removeItem(SESSION_KEY);
  setAuthTokenGetter(null);
}

function LoginGate({ onSuccess }: { onSuccess: (username: string) => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit({ username, password }: LoginFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        toast({ title: "Invalid credentials", description: "Check your username and password.", variant: "destructive" });
        return;
      }

      const { token, username: loggedInAs } = (await res.json()) as { token: string; username: string };
      applyToken(token);
      onSuccess(loggedInAs);
    } catch {
      toast({ title: "Login failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-primary tracking-tighter">GamInfluencers</span>
          <p className="mt-2 text-muted-foreground text-sm">Admin access only</p>
        </div>
        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <h1 className="text-lg font-semibold mb-4">Sign in to Admin Panel</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter your username" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
        <div className="text-center mt-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Site
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    const storedUser = sessionStorage.getItem("gi_admin_user");
    if (stored) {
      applyToken(stored);
      setAuthed(true);
      if (storedUser) setAdminUsername(storedUser);
    }
  }, []);

 

  if (!authed) {
    return <LoginGate onSuccess={(username) => {
      sessionStorage.setItem("gi_admin_user", username);
      setAdminUsername(username);
      setAuthed(true);
    }} />;
  }

  function handleLogout() {
    clearToken();
    sessionStorage.removeItem("gi_admin_user");
    setAdminUsername("");
    setAuthed(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">Admin Panel</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">· GamInfluencers</span>
          </div>
          <div className="flex items-center gap-2">
            {adminUsername && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Signed in as <strong>{adminUsername}</strong>
              </span>
            )}
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Site
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="influencers">
          <TabsList className="mb-6">
            <TabsTrigger value="influencers" className="gap-2">
              <Users className="w-4 h-4" /> Influencers
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-2">
              <Building2 className="w-4 h-4" /> Businesses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="influencers">
            <InfluencersTab />
          </TabsContent>

          <TabsContent value="businesses">
            <BusinessesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
