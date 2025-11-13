"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Building2,
  Megaphone,
  Gavel,
  DollarSign,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userRole = (session?.user as any)?.role;

  const ownerNavItems = [
    { href: "/dashboard/owner", icon: Home, label: "Dashboard" },
    { href: "/dashboard/owner/spaces", icon: Building2, label: "My Spaces" },
    { href: "/dashboard/owner/bids", icon: Gavel, label: "Bids" },
    { href: "/dashboard/owner/earnings", icon: DollarSign, label: "Earnings" },
    { href: "/dashboard/owner/messages", icon: MessageSquare, label: "Messages" },
  ];

  const advertiserNavItems = [
    { href: "/dashboard/advertiser", icon: Home, label: "Dashboard" },
    { href: "/dashboard/advertiser/search", icon: Building2, label: "Find Spaces" },
    { href: "/dashboard/advertiser/bids", icon: Gavel, label: "My Bids" },
    { href: "/dashboard/advertiser/campaigns", icon: Megaphone, label: "Campaigns" },
    { href: "/dashboard/advertiser/messages", icon: MessageSquare, label: "Messages" },
  ];

  const adminNavItems = [
    { href: "/dashboard/admin", icon: Home, label: "Dashboard" },
    { href: "/dashboard/admin/spaces", icon: Building2, label: "Spaces" },
    { href: "/dashboard/admin/users", icon: Shield, label: "Users" },
    { href: "/dashboard/admin/transactions", icon: DollarSign, label: "Transactions" },
  ];

  const navItems =
    userRole === "OWNER"
      ? ownerNavItems
      : userRole === "ADVERTISER"
      ? advertiserNavItems
      : userRole === "ADMIN"
      ? adminNavItems
      : [];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">AdBidder</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/notifications">
                <Bell className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </Button>
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {session?.user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-[57px] left-0 z-40 h-[calc(100vh-57px)] w-64 border-r bg-white transition-transform md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="md:hidden absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:ml-0 ml-0">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
