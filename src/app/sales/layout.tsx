"use client";

import { RoleLayout } from "@/components/layout/role-layout";

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return <RoleLayout variant="sales">{children}</RoleLayout>;
}
