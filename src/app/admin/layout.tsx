"use client";

import { RoleLayout } from "@/components/layout/role-layout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout variant="admin">{children}</RoleLayout>;
}
