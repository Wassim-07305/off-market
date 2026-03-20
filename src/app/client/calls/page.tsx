"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import CallsPage from "@/app/_shared-pages/calls/page";

export default function Page() {
  return (
    <RoleGuard module="closer-calls">
      <CallsPage />
    </RoleGuard>
  );
}
