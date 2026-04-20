import AdminLayout from "./AdminLayout";
import { useOiGetCampaignSummary, useOiListCampaigns, useOiListQuickPromotions, useListInfluencers, getOiGetCampaignSummaryQueryKey, getOiListCampaignsQueryKey, getOiListQuickPromotionsQueryKey, getListInfluencersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, MessageSquare, CheckCircle, Clock, PlayCircle, Star } from "lucide-react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: number | string; icon: any; color: string; sub?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const { data: summary, isLoading: summaryLoading } = useOiGetCampaignSummary({
    query: { queryKey: getOiGetCampaignSummaryQueryKey(), refetchInterval: 30000 },
  });
  const { data: campaigns = [], isLoading: campaignsLoading } = useOiListCampaigns({
    query: { queryKey: getOiListCampaignsQueryKey(), refetchInterval: 30000 },
  });
  const { data: inquiries = [] } = useOiListQuickPromotions({
    query: { queryKey: getOiListQuickPromotionsQueryKey() },
  });
  const { data: influencers = [] } = useListInfluencers({
    query: { queryKey: getListInfluencersQueryKey() },
  });

  const recentCampaigns = [...campaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const newInquiries = inquiries.filter(i => i.status === "new").length;

  return (
    <AdminLayout>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform summary and recent activity</p>
        </div>

        {summaryLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Campaigns" value={summary?.total ?? 0} icon={TrendingUp} color="bg-primary/10 text-primary" sub={`$${summary?.totalBudget ?? "0.00"} total budget`} />
            <StatCard label="Active" value={summary?.active ?? 0} icon={PlayCircle} color="bg-blue-100 text-blue-600" />
            <StatCard label="Posted / Completed" value={(summary?.posted ?? 0) + (summary?.completed ?? 0)} icon={CheckCircle} color="bg-emerald-100 text-emerald-600" />
            <StatCard label="New Inquiries" value={newInquiries} icon={MessageSquare} color="bg-amber-100 text-amber-600" sub="Awaiting review" />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Campaigns</CardTitle>
                <Link href="/admin/campaigns" className="text-xs text-primary hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {campaignsLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
              ) : recentCampaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No campaigns yet</div>
              ) : (
                <div className="space-y-2">
                  {recentCampaigns.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.influencerName ?? "—"} · {c.clientName ?? "—"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 status-${c.status}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary fill-primary/30" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{influencers.length} Influencers</p>
                    <p className="text-sm text-muted-foreground">Listed on the platform</p>
                  </div>
                  <Link href="/admin/influencers" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Campaign Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { label: "Pending", value: summary?.pending ?? 0, cls: "status-pending" },
                  { label: "Active", value: summary?.active ?? 0, cls: "status-active" },
                  { label: "Posted", value: summary?.posted ?? 0, cls: "status-posted" },
                  { label: "Completed", value: summary?.completed ?? 0, cls: "status-completed" },
                  { label: "Cancelled", value: summary?.cancelled ?? 0, cls: "status-cancelled" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
                    <span className="text-sm font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
