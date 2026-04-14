import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Home from "@/pages/Home";
import Influencers from "@/pages/Influencers";
import InfluencerProfile from "@/pages/InfluencerProfile";
import RegisterInfluencer from "@/pages/RegisterInfluencer";
import RegisterBusiness from "@/pages/RegisterBusiness";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/influencers" component={Influencers} />
        <Route path="/influencers/:id" component={InfluencerProfile} />
        <Route path="/register/influencer" component={RegisterInfluencer} />
        <Route path="/register/business" component={RegisterBusiness} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
