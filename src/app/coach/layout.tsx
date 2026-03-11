"use client";

import { RoleLayout } from "@/components/layout/role-layout";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleLayout variant="coach">{children}</RoleLayout>;
}
