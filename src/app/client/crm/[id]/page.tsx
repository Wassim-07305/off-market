"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import CrmDetailPage from "@/app/_shared-pages/crm/[id]/page";

export default function Page() {
  return (
    <RoleGuard module="clients">
      <CrmDetailPage />
    </RoleGuard>
  );
}
