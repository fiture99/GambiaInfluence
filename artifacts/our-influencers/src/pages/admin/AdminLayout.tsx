import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Users, TrendingUp, MessageSquare, UserCog,
  LogOut, Star, Menu, X, ChevronRight,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin",             label: "Overview",      icon: LayoutDashboard },
  { href: "/admin/campaigns",   label: "Campaigns",     icon: TrendingUp },
  { href: "/admin/influencers", label: "Influencers",   icon: Users },
  { href: "/admin/users",       label: "Client Accounts", icon: UserCog },
  { href: "/admin/inquiries",   label: "Inquiries",     icon: MessageSquare },
];

function SidebarLink({ href, label, icon: Icon, exact = false }: { href: string; label: string; icon: any; exact?: boolean }) {
  const [location] = useLocation();
  const isActive = exact ? location === href : (href === "/admin" ? location === "/admin" : location.startsWith(href));

  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
        isActive
          ? "bg-sidebar-primary text-white shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      }`}>
        <Icon className="w-4 h-4 shrink-0" />
        {label}
        {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
      </div>
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64 shrink-0">
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-sm">
            GamInfluenza
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-sidebar-foreground/50 hover:text-sidebar-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(item => (
          <SidebarLink key={item.href} {...item} onClick={onClose} />
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent mb-2">
          <div className="w-7 h-7 bg-sidebar-primary/30 rounded-full flex items-center justify-center shrink-0">
            <UserCog className="w-3.5 h-3.5 text-sidebar-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user?.fullName}</p>
            <div className="flex items-center gap-1">
              <Badge className="text-xs px-1 py-0 bg-sidebar-primary/20 text-sidebar-primary border-0">Admin</Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden h-14 flex items-center px-4 border-b border-border bg-sidebar text-sidebar-foreground">
          <button onClick={() => setSidebarOpen(true)} className="p-1 mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sidebar-primary rounded-md flex items-center justify-center">
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm">GamInfluenza</span>
          </div>
          <Badge className="ml-2 text-xs bg-sidebar-primary/20 text-sidebar-primary border-0">Admin</Badge>
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
