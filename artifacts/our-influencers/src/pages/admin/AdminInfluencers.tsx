import { useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  useListInfluencers, useCreateInfluencer, useUpdateInfluencer, useDeleteInfluencer,
  getListInfluencersQueryKey,
} from "@workspace/api-client-react";
import type { Influencer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Edit2, Trash2, Users, Instagram, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NICHES = ["fashion","comedy","tech","food","lifestyle","sports","beauty","travel","music","gaming"];

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

type InfluencerForm = {
  name: string; bio: string; location: string; niche: string;
  followersCount: string; profileImageUrl: string;
  instagramUrl: string; youtubeUrl: string; phone: string; whatsappNumber: string;
};

const emptyForm: InfluencerForm = {
  name: "", bio: "", location: "", niche: "",
  followersCount: "", profileImageUrl: "",
  instagramUrl: "", youtubeUrl: "", phone: "", whatsappNumber: "",
};

function InfluencerFormFields({ form, setForm }: { form: InfluencerForm; setForm: (f: InfluencerForm) => void }) {
  const set = (k: keyof InfluencerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-3 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input placeholder="Full name" value={form.name} onChange={set("name")} />
        </div>
        <div className="space-y-1.5">
          <Label>Niche *</Label>
          <Select value={form.niche} onValueChange={v => setForm({ ...form, niche: v })}>
            <SelectTrigger><SelectValue placeholder="Select niche..." /></SelectTrigger>
            <SelectContent>{NICHES.map(n => <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input placeholder="City, Country" value={form.location} onChange={set("location")} />
        </div>
        <div className="space-y-1.5">
          <Label>Followers Count *</Label>
          <Input type="number" placeholder="e.g. 125000" value={form.followersCount} onChange={set("followersCount")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Profile Image URL</Label>
        <Input type="url" placeholder="https://..." value={form.profileImageUrl} onChange={set("profileImageUrl")} />
      </div>
      <div className="space-y-1.5">
        <Label>Bio</Label>
        <Textarea rows={2} placeholder="Short description..." value={form.bio} onChange={set("bio")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Instagram URL</Label>
          <Input type="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={set("instagramUrl")} />
        </div>
        <div className="space-y-1.5">
          <Label>YouTube URL</Label>
          <Input type="url" placeholder="https://youtube.com/..." value={form.youtubeUrl} onChange={set("youtubeUrl")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input placeholder="+1 555 000 0000" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label>WhatsApp Number</Label>
          <Input placeholder="+1 555 000 0000" value={form.whatsappNumber} onChange={set("whatsappNumber")} />
        </div>
      </div>
    </div>
  );
}

export default function AdminInfluencers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editInfluencer, setEditInfluencer] = useState<Influencer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const { data: influencers = [], isLoading } = useListInfluencers({
    params: { search: search || undefined },
    query: { queryKey: getListInfluencersQueryKey({ search: search || undefined }) },
  });

  const createMutation = useCreateInfluencer();
  const updateMutation = useUpdateInfluencer();
  const deleteMutation = useDeleteInfluencer();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListInfluencersQueryKey() });

  function formToData(form: InfluencerForm) {
    return {
      name: form.name,
      bio: form.bio || null,
      location: form.location || null,
      niche: form.niche,
      followersCount: parseInt(form.followersCount) || 0,
      profileImageUrl: form.profileImageUrl || null,
      instagramUrl: form.instagramUrl || null,
      youtubeUrl: form.youtubeUrl || null,
      phone: form.phone || null,
      whatsappNumber: form.whatsappNumber || null,
    };
  }

  function influencerToForm(i: Influencer): InfluencerForm {
    return {
      name: i.name, bio: i.bio ?? "", location: i.location ?? "", niche: i.niche,
      followersCount: String(i.followersCount), profileImageUrl: i.profileImageUrl ?? "",
      instagramUrl: i.instagramUrl ?? "", youtubeUrl: i.youtubeUrl ?? "",
      phone: i.phone ?? "", whatsappNumber: i.whatsappNumber ?? "",
    };
  }

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({ data: formToData(createForm) });
      invalidate();
      setCreateOpen(false);
      setCreateForm(emptyForm);
      toast({ title: "Influencer added" });
    } catch {
      toast({ title: "Failed to add influencer", variant: "destructive" });
    }
  }

  function openEdit(inf: Influencer) {
    setEditInfluencer(inf);
    setEditForm(influencerToForm(inf));
  }

  async function handleUpdate() {
    if (!editInfluencer) return;
    try {
      await updateMutation.mutateAsync({ id: editInfluencer.id, data: formToData(editForm) });
      invalidate();
      setEditInfluencer(null);
      toast({ title: "Influencer updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      invalidate();
      setDeleteConfirm(null);
      toast({ title: "Influencer removed" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Influencers</h1>
            <p className="text-muted-foreground mt-1">Manage the influencer directory</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Influencer
          </Button>
        </div>

        <div className="relative max-w-xs mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search influencers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No influencers found
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map(inf => (
              <Card key={inf.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary/10 shrink-0">
                      {inf.profileImageUrl ? (
                        <img src={inf.profileImageUrl} alt={inf.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{inf.name}</p>
                          <p className="text-xs text-muted-foreground">{inf.location}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(inf)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(inf.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge className="capitalize text-xs">{inf.niche}</Badge>
                        <span className="text-xs font-medium text-foreground">{formatFollowers(inf.followersCount)}</span>
                        <div className="flex items-center gap-1">
                          {inf.instagramUrl && <Instagram className="w-3 h-3 text-pink-500" />}
                          {inf.youtubeUrl && <Youtube className="w-3 h-3 text-red-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Influencer</DialogTitle></DialogHeader>
          <InfluencerFormFields form={createForm} setForm={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createForm.name || !createForm.niche || !createForm.followersCount || createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Influencer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editInfluencer !== null} onOpenChange={o => !o && setEditInfluencer(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Influencer</DialogTitle></DialogHeader>
          <InfluencerFormFields form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInfluencer(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Remove Influencer?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove the influencer from the platform.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
