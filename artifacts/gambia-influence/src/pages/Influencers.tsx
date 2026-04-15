import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListInfluencers, useGetNicheBreakdown, useGetLocationBreakdown } from "@workspace/api-client-react";
import { InfluencerCard } from "@/components/influencer/InfluencerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FilterX } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Simple debounce hook for local usage
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

export default function Influencers() {
  const [loc, setLocationHash] = useLocation();
  
  // Parse URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const initialNiche = searchParams.get("niche") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState<string>(initialLocation);
  const [niche, setNiche] = useState<string>(initialNiche);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location !== "all") params.set("location", location);
    if (niche !== "all") params.set("niche", niche);
    
    const newSearch = params.toString();
    const newUrl = newSearch ? `/influencers?${newSearch}` : "/influencers";
    
    // Only push if different to avoid loop
    if (window.location.search !== `?${newSearch}` && window.location.search !== newSearch) {
      setLocationHash(newUrl);
    }
  }, [search, location, niche, setLocationHash]);

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
    <div className="flex flex-col flex-1 bg-muted/10">
      {/* Header Banner */}
      <div className="bg-background border-b pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-8">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Creator Directory</h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium">Find the perfect authentic voice for your next campaign.</p>
          </div>
          
          {/* Top Niche Tabs */}
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-2">
              <button
                onClick={() => setNiche("all")}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
                  niche === "all" 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                All Categories
              </button>
              {niches?.map((n) => (
                <button
                  key={n.niche}
                  onClick={() => setNiche(n.niche)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize border-2 flex items-center gap-2 ${
                    niche === n.niche 
                      ? "bg-foreground text-background border-foreground" 
                      : "bg-background text-foreground border-border hover:border-foreground/30"
                  }`}
                >
                  {n.niche}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${niche === n.niche ? "bg-background/20" : "bg-muted text-muted-foreground"}`}>
                    {n.count}
                  </span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-background border rounded-3xl p-6 sticky top-24 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-3 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80">
                    <FilterX className="w-3 h-3 mr-1.5" /> Clear
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="search" className="font-bold text-foreground/80">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="search"
                      placeholder="Name or keyword..." 
                      className="pl-10 bg-muted/50 border-transparent focus-visible:border-primary rounded-xl h-12 font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="font-bold text-foreground/80">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="bg-muted/50 border-transparent focus:border-primary rounded-xl h-12 font-medium">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-medium rounded-lg">All Locations</SelectItem>
                      {locations?.map((l) => (
                        <SelectItem key={l.location} value={l.location} className="font-medium rounded-lg">
                          <span className="capitalize">{l.location}</span> <span className="text-muted-foreground text-xs ml-1">({l.count})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 lg:hidden">
                  <Label className="font-bold text-foreground/80">Niche</Label>
                  <Select value={niche} onValueChange={setNiche}>
                    <SelectTrigger className="bg-muted/50 border-transparent focus:border-primary rounded-xl h-12 font-medium">
                      <SelectValue placeholder="All Niches" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-medium rounded-lg">All Niches</SelectItem>
                      {niches?.map((n) => (
                        <SelectItem key={n.niche} value={n.niche} className="font-medium rounded-lg">
                          <span className="capitalize">{n.niche}</span> <span className="text-muted-foreground text-xs ml-1">({n.count})</span>
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
            <div className="mb-6 flex justify-between items-center text-sm font-bold text-muted-foreground bg-background px-4 py-3 rounded-2xl border shadow-sm inline-flex">
              <span>
                {isLoading ? "Searching..." : `${influencers?.length || 0} creators found`}
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[380px] bg-background border rounded-2xl animate-pulse shadow-sm"></div>
                ))}
              </div>
            ) : influencers && influencers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencers.map(influencer => (
                  <InfluencerCard key={influencer.id} influencer={influencer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-background border border-dashed rounded-3xl shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-black mb-3">No creators found</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 font-medium">
                  We couldn't find any creators matching your current filters. Try adjusting your search or clearing filters.
                </p>
                <Button size="lg" className="rounded-xl font-bold px-8 h-12" onClick={clearFilters}>Clear all filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
