import { useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  useOiListCampaigns, useOiCreateCampaign, useOiUpdateCampaign, useOiDeleteCampaign,
  useListInfluencers, useOiListUsers,
  getOiListCampaignsQueryKey, getListInfluencersQueryKey, getOiListUsersQueryKey,
} from "@workspace/api-client-react";
import type { OiCampaign } from "@workspace/api-client-react";
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
import { Plus, Search, Edit2, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending","active","posted","completed","cancelled"] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", active: "Active", posted: "Posted", completed: "Completed", cancelled: "Cancelled",
};

type Status = typeof STATUSES[number];

function formatFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface EditDialog {
  open: boolean;
  campaign: OiCampaign | null;
}

export default function AdminCampaigns() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<EditDialog>({ open: false, campaign: null });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({ title: "", description: "", budget: "", clientId: "", influencerId: "" });
  const [editForm, setEditForm] = useState({ title: "", description: "", budget: "", status: "", postUrl: "" });

  const { data: campaigns = [], isLoading, refetch, isFetching } = useOiListCampaigns({
    query: { queryKey: getOiListCampaignsQueryKey(), refetchInterval: 30000 },
  });
  const { data: influencers = [] } = useListInfluencers({ query: { queryKey: getListInfluencersQueryKey() } });
  const { data: users = [] } = useOiListUsers({ query: { queryKey: getOiListUsersQueryKey() } });
  const clients = users.filter(u => u.role === "client");

  const createMutation = useOiCreateCampaign();
  const updateMutation = useOiUpdateCampaign();
  const deleteMutation = useOiDeleteCampaign();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getOiListCampaignsQueryKey() });

  const filtered = campaigns.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.clientName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.influencerName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({
        data: {
          title: createForm.title,
          description: createForm.description || null,
          budget: createForm.budget || null,
          clientId: parseInt(createForm.clientId),
          influencerId: parseInt(createForm.influencerId),
        },
      });
      invalidate();
      setCreateOpen(false);
      setCreateForm({ title: "", description: "", budget: "", clientId: "", influencerId: "" });
      toast({ title: "Campaign created" });
    } catch {
      toast({ title: "Failed to create campaign", variant: "destructive" });
    }
  }

  function openEdit(campaign: OiCampaign) {
    setEditForm({
      title: campaign.title,
      description: campaign.description ?? "",
      budget: campaign.budget ?? "",
      status: campaign.status,
      postUrl: campaign.postUrl ?? "",
    });
    setEditDialog({ open: true, campaign });
  }

  async function handleUpdate() {
    if (!editDialog.campaign) return;
    try {
      await updateMutation.mutateAsync({
        id: editDialog.campaign.id,
        data: {
          title: editForm.title,
          description: editForm.description || null,
          budget: editForm.budget || null,
          status: editForm.status as Status,
          postUrl: editForm.postUrl || null,
        },
      });
      invalidate();
      setEditDialog({ open: false, campaign: null });
      toast({ title: "Campaign updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMutation.mutateAsync({ id });
      invalidate();
      setDeleteConfirm(null);
      toast({ title: "Campaign deleted" });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  }

  return (
    <AdminLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">Manage all influencer campaigns</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No campaigns found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-foreground truncate">{c.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 status-${c.status}`}>{c.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Client: <span className="font-medium text-foreground">{c.clientName ?? "—"}</span>
                        {" · "} Influencer: <span className="font-medium text-foreground">{c.influencerName ?? "—"}</span>
                        {c.budget && <span> · Budget: <span className="font-medium text-foreground">{c.budget}</span></span>}
                        {" · "} {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.status === "posted" && c.postUrl && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs text-emerald-600" asChild>
                          <a href={c.postUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3" /> Post
                          </a>
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(c)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(c.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Campaign Title</Label>
              <Input placeholder="e.g. Summer Fashion Drop" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Client</Label>
                <Select value={createForm.clientId} onValueChange={v => setCreateForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Influencer</Label>
                <Select value={createForm.influencerId} onValueChange={v => setCreateForm(f => ({ ...f, influencerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select influencer..." /></SelectTrigger>
                  <SelectContent>
                    {influencers.map(i => <SelectItem key={i.id} value={String(i.id)}>{i.name} ({formatFollowers(i.followersCount)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Budget (optional)</Label>
              <Input placeholder="e.g. $500 or negotiated" value={createForm.budget} onChange={e => setCreateForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Textarea rows={3} placeholder="Campaign details, requirements..." value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!createForm.title || !createForm.clientId || !createForm.influencerId || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={o => !o && setEditDialog({ open: false, campaign: null })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Edit Campaign</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Campaign Title</Label>
              <Input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Budget</Label>
                <Input placeholder="e.g. $500" value={editForm.budget} onChange={e => setEditForm(f => ({ ...f, budget: e.target.value }))} />
              </div>
            </div>
            {(editForm.status === "posted" || editDialog.campaign?.postUrl) && (
              <div className="space-y-1.5">
                <Label>Post URL</Label>
                <Input type="url" placeholder="https://instagram.com/p/..." value={editForm.postUrl} onChange={e => setEditForm(f => ({ ...f, postUrl: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, campaign: null })}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteConfirm !== null} onOpenChange={o => !o && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Campaign?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
