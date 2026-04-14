import { useState } from "react";
import { useListInfluencers, useGetNicheBreakdown, useGetLocationBreakdown } from "@workspace/api-client-react";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";

// Simple debounce hook for local usage
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useState(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  });
  
  return debouncedValue;
}

export default function Influencers() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<string>("all");
  const [niche, setNiche] = useState<string>("all");

  const debouncedSearch = useDebounceValue(search, 500);

  const queryParams = {
    search: debouncedSearch || undefined,
    location: location !== "all" ? location : undefined,
    niche: niche !== "all" ? niche : undefined
  };

  const { data: influencers, isLoading } = useListInfluencers(queryParams, { 
    query: { queryKey: ["influencers", queryParams] } 
  });
  
  const { data: niches } = useGetNicheBreakdown({ query: { queryKey: ["niches"] } });
  const { data: locations } = useGetLocationBreakdown({ query: { queryKey: ["locations"] } });

  const clearFilters = () => {
    setSearch("");
    setLocation("all");
    setNiche("all");
  };

  const hasActiveFilters = search || location !== "all" || niche !== "all";

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Creator Directory</h1>
          <p className="text-muted-foreground text-lg">Find the perfect voice for your next campaign.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                  <FilterX className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="search"
                    placeholder="Name or keyword..." 
                    className="pl-9 bg-background"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niche</Label>
                <Select value={niche} onValueChange={setNiche}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Niches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    {niches?.map((n) => (
                      <SelectItem key={n.niche} value={n.niche}>
                        <span className="capitalize">{n.niche}</span> <span className="text-muted-foreground text-xs ml-1">({n.count})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations?.map((l) => (
                      <SelectItem key={l.location} value={l.location}>
                        <span className="capitalize">{l.location}</span> <span className="text-muted-foreground text-xs ml-1">({l.count})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex justify-between items-center text-sm font-medium text-muted-foreground">
            <span>
              {isLoading ? "Searching..." : `${influencers?.length || 0} creators found`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[350px] bg-muted/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : influencers && influencers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencers.map(influencer => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-muted/20 border border-dashed rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No creators found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any creators matching your current filters. Try adjusting your search or clearing filters.
              </p>
              <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
