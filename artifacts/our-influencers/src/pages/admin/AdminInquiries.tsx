import { useState } from "react";
import AdminLayout from "./AdminLayout";
import {
  useOiListQuickPromotions, useOiUpdateQuickPromotion,
  getOiListQuickPromotionsQueryKey,
} from "@workspace/api-client-react";
import type { OiQuickPromotion } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Phone, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["new", "contacted", "in_progress", "done"] as const;
type InquiryStatus = typeof STATUSES[number];

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  done: "Done",
};

export default function AdminInquiries() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInquiry, setSelectedInquiry] = useState<OiQuickPromotion | null>(null);
  const [newStatus, setNewStatus] = useState<InquiryStatus>("new");

  const { data: inquiries = [], isLoading, refetch, isFetching } = useOiListQuickPromotions({
    query: { queryKey: getOiListQuickPromotionsQueryKey(), refetchInterval: 30000 },
  });
  const updateMutation = useOiUpdateQuickPromotion();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getOiListQuickPromotionsQueryKey() });

  const filtered = inquiries.filter(i => {
    const matchSearch =
      i.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (i.contactEmail ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (i.influencerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function openDetail(inquiry: OiQuickPromotion) {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status as InquiryStatus);
  }

  async function handleUpdateStatus() {
    if (!selectedInquiry) return;
    try {
      await updateMutation.mutateAsync({ id: selectedInquiry.id, data: { status: newStatus } });
      invalidate();
      setSelectedInquiry(null);
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  const counts = {
    new: inquiries.filter(i => i.status === "new").length,
    contacted: inquiries.filter(i => i.status === "contacted").length,
    in_progress: inquiries.filter(i => i.status === "in_progress").length,
    done: inquiries.filter(i => i.status === "done").length,
  };

  return (
    <AdminLayout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quick Promo Inquiries</h1>
            <p className="text-muted-foreground mt-1">Manage incoming promotion requests</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`rounded-xl p-3 text-center border transition-all ${
                filterStatus === s ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-muted/50"
              }`}
            >
              <p className={`text-xl font-bold ${s === "new" ? "text-amber-600" : s === "done" ? "text-emerald-600" : "text-foreground"}`}>{counts[s]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{STATUS_LABELS[s]}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9 h-9" placeholder="Search inquiries..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No inquiries found
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(inq => (
              <Card
                key={inq.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDetail(inq)}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground">{inq.contactName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 status-${inq.status}`}>
                          {STATUS_LABELS[inq.status as InquiryStatus] ?? inq.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Influencer: <span className="font-medium text-foreground">{inq.influencerName ?? "—"}</span>
                        {" · "} Type: <span className="font-medium">{inq.promoType}</span>
                        {" · "} {new Date(inq.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground mt-1.5 line-clamp-2">{inq.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0 text-xs text-muted-foreground text-right">
                      {inq.contactEmail && (
                        <a href={`mailto:${inq.contactEmail}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary">
                          <Mail className="w-3 h-3" /> {inq.contactEmail}
                        </a>
                      )}
                      {inq.contactPhone && (
                        <a href={`tel:${inq.contactPhone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="w-3 h-3" /> {inq.contactPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={selectedInquiry !== null} onOpenChange={o => !o && setSelectedInquiry(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Inquiry from {selectedInquiry?.contactName}</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Influencer</p>
                  <p className="font-medium">{selectedInquiry.influencerName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Promo Type</p>
                  <p className="font-medium">{selectedInquiry.promoType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium">{selectedInquiry.contactEmail ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium">{selectedInquiry.contactPhone ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <div className="p-3 rounded-lg bg-muted text-sm leading-relaxed">{selectedInquiry.description}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Update Status</p>
                <Select value={newStatus} onValueChange={v => setNewStatus(v as InquiryStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Close</Button>
            <Button onClick={handleUpdateStatus} disabled={updateMutation.isPending || newStatus === selectedInquiry?.status}>
              {updateMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
