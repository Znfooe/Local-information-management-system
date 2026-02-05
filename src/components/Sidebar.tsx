import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, KeyRound, Bot, Settings, Command, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t("nav.api") },
    { to: "/password", icon: KeyRound, label: t("nav.password") },
    { to: "/ai", icon: Bot, label: t("nav.ai") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <div className="w-64 border-r-2 border-border bg-card h-full flex flex-col">
      <div className="p-6 border-b-2 border-border border-dashed">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Command className="h-6 w-6 stroke-2" />
          {t("app.title")}
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 border-2 border-transparent",
                isActive
                  ? "bg-background border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]"
                  : "hover:bg-muted/50 hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className={cn("h-4 w-4", "stroke-2")} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t-2 border-border border-dashed text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
        <Tag className="h-3 w-3" />
        v1.0.0
      </div>
    </div>
  );
}
