import { Link } from "wouter";
import { Influencer } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Users } from "lucide-react";

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <Link href={`/influencers/${influencer.id}`} className="block">
      <Card className="h-full overflow-hidden hover-elevate transition-all border-border/50 group cursor-pointer">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm ring-2 ring-primary/20 group-hover:ring-primary transition-all">
              <AvatarImage src={influencer.profileImageUrl || undefined} alt={influencer.name} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {influencer.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-xl line-clamp-1">{influencer.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{influencer.bio || "No bio available"}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Badge variant="secondary" className="font-medium bg-secondary/15 text-secondary-foreground hover:bg-secondary/25">
                {influencer.niche}
              </Badge>
              <Badge variant="outline" className="font-medium">
                <MapPin className="w-3 h-3 mr-1" />
                {influencer.location}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 p-4 flex justify-between items-center border-t border-border/30">
          <div className="flex items-center text-sm font-medium text-muted-foreground">
            <Users className="w-4 h-4 mr-1.5" />
            {(influencer.followersCount || 0).toLocaleString()} followers
          </div>
          <span className="text-primary text-sm font-bold group-hover:underline">View Profile &rarr;</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
