"use client";

import { RoleLayout } from "@/components/layout/role-layout";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout variant="client">{children}</RoleLayout>;
}
