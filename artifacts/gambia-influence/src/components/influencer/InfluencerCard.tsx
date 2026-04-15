import { Link } from "wouter";
import { Influencer } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users } from "lucide-react";

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  const hasImage = !!influencer.profileImageUrl;
  
  return (
    <Link href={`/influencers/${influencer.id}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-0 bg-transparent rounded-2xl relative shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="absolute inset-0 z-0">
          {hasImage ? (
            <img 
              src={influencer.profileImageUrl!} 
              alt={influencer.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              <span className="text-6xl font-black text-white/50">
                {influencer.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
        
        <CardContent className="relative z-20 h-full flex flex-col justify-end p-5 min-h-[380px]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary text-primary-foreground border-none font-bold text-xs">
                {influencer.niche}
              </Badge>
            </div>
            
            <div>
              <h3 className="font-black text-2xl text-white line-clamp-1 group-hover:text-primary-foreground transition-colors">{influencer.name}</h3>
              <div className="flex items-center text-white/80 text-sm mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                <span className="truncate">{influencer.location}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-white text-sm font-bold">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1.5 text-primary" />
                {(influencer.followersCount || 0).toLocaleString()} followers
              </div>
              <span className="opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                View &rarr;
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
