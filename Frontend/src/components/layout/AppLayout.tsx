import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  MapPinned,
  Menu,
  PackageCheck,
  X
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFoodLoop } from "@/context/FoodLoopContext";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { to: "/dashboard", label: "Operations", icon: Home, id: "dashboard" },
  { to: "/surplus", label: "Surplus inventory", icon: ClipboardList, id: "surplus" },
  { to: "/matching", label: "Partner matching", icon: MapPinned, id: "matching" },
  { to: "/rescue", label: "Rescue", icon: PackageCheck, id: "rescue" },
  { to: "/impact", label: "Impact", icon: BarChart3, id: "impact" }
] as const;

function Brand({ restaurantName }: { restaurantName?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        <Leaf className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-xl font-semibold tracking-tight">FoodLoop</p>
        <p className="text-xs font-semibold text-muted-foreground">
          {restaurantName || "Surplus recovery platform"}
        </p>
      </div>
    </div>
  );
}

function Navigation({
  onNavigate,
  items
}: {
  onNavigate?: () => void;
  items: Array<(typeof baseNavItems)[number]>;
}) {
  return (
    <nav className="grid gap-1.5" aria-label="FoodLoop navigation">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-bold text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function OwnerCard() {
  const navigate = useNavigate();
  const { user, business, logout } = useFoodLoop();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="mt-auto rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-secondary to-white p-4">
      <p className="food-chip mb-3">Workspace active</p>
      <p className="font-display text-lg font-semibold">{business?.name || "Your business"}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {user?.name} · {user?.email}
      </p>
      <Button
        className="mt-3 w-full justify-start gap-2"
        size="sm"
        variant="outline"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}

export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { business, hasPendingSurplus, hasRescuePlans } = useFoodLoop();

  const navItems = useMemo(
    () =>
      baseNavItems.filter((item) => {
        if (item.id === "matching") return hasPendingSurplus;
        if (item.id === "rescue") return hasRescuePlans;
        return true;
      }),
    [hasPendingSurplus, hasRescuePlans]
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border/70 bg-white/80 p-6 backdrop-blur-xl lg:flex lg:flex-col">
        <Brand restaurantName={business?.name} />
        <div className="mt-10">
          <Navigation items={navItems} />
        </div>
        <OwnerCard />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-white/85 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Brand restaurantName={business?.name} />
            <Button
              aria-label="Toggle navigation"
              size="sm"
              variant="outline"
              onClick={() => setIsMobileOpen((value) => !value)}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          {isMobileOpen ? (
            <div className="mt-4 space-y-3 rounded-[1.35rem] border bg-card p-3 shadow-xl">
              <Navigation items={navItems} onNavigate={() => setIsMobileOpen(false)} />
              <OwnerCard />
            </div>
          ) : null}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
