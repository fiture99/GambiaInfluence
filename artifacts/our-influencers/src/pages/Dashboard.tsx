import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOiListCampaigns,
  useOiGetCampaignSummary,
  getOiListCampaignsQueryKey,
  getOiGetCampaignSummaryQueryKey,
} from "@workspace/api-client-react";
import type { OiCampaign } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Search, RefreshCw, TrendingUp, Clock, CheckCircle, PlayCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pending:   { label: "Pending",     className: "status-pending",   icon: <Clock className="w-3 h-3" /> },
  active:    { label: "Active",      className: "status-active",    icon: <PlayCircle className="w-3 h-3" /> },
  posted:    { label: "Posted",      className: "status-posted",    icon: <CheckCircle className="w-3 h-3" /> },
  completed: { label: "Completed",   className: "status-completed", icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: "Cancelled",   className: "status-cancelled", icon: null },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "status-pending", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
}

function CampaignCard({ campaign }: { campaign: OiCampaign }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Influencer: <span className="font-medium text-foreground">{campaign.influencerName ?? "—"}</span>
            </p>
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        {campaign.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{campaign.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-3">
            {campaign.budget && (
              <span className="font-medium text-foreground">Budget: {campaign.budget}</span>
            )}
            <span>Started {new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
          {campaign.status === "posted" && campaign.postUrl && (
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50" asChild>
              <a href={campaign.postUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" /> View Post
              </a>
            </Button>
          )}
        </div>

        {campaign.status === "posted" && campaign.postedAt && (
          <div className="mt-2 p-2 rounded-md bg-emerald-50 border border-emerald-100 text-xs text-emerald-700">
            Content posted on {new Date(campaign.postedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: campaigns = [], isLoading, refetch, isFetching } = useOiListCampaigns({
    query: {
      queryKey: getOiListCampaignsQueryKey(),
      refetchInterval: 30000,
    },
  });

  const { data: summary } = useOiGetCampaignSummary({
    query: {
      queryKey: getOiGetCampaignSummaryQueryKey(),
      refetchInterval: 30000,
    },
  });

  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.influencerName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statsCards = [
    { label: "Total Campaigns", value: summary?.total ?? 0, icon: TrendingUp, color: "text-primary" },
    { label: "Active", value: summary?.active ?? 0, icon: PlayCircle, color: "text-blue-600" },
    { label: "Posted", value: summary?.posted ?? 0, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Completed", value: summary?.completed ?? 0, icon: CheckCircle, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="font-medium text-foreground">{user?.fullName}</span>.
            Track your influencer campaign progress in real time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statsCards.map(stat => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <span className="text-xs text-muted-foreground">Auto-refreshes every 30s</span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground">Your campaigns will appear here once created by the admin.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
          </div>
        )}
      </div>
    </div>
  );
}
