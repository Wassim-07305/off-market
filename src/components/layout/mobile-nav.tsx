"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  FileText,
  BarChart3,
} from "lucide-react";

const mobileNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "coach", "setter", "closer"] },
  { name: "CRM", href: "/crm", icon: Users, roles: ["admin", "coach", "setter", "closer"] },
  { name: "Messages", href: "/messaging", icon: MessageSquare, roles: ["admin", "coach", "setter", "closer", "client"] },
  { name: "Formation", href: "/school", icon: GraduationCap, roles: ["admin", "coach", "client"] },
  { name: "Forms", href: "/forms", icon: FileText, roles: ["admin", "coach", "client"] },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const role = profile?.role ?? "admin";

  const filtered = mobileNavItems.filter((item) =>
    (item.roles as readonly string[]).includes(role)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {filtered.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
