"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import CrmRoadmapPage from "@/app/_shared-pages/crm/[id]/roadmap/page";

export default function Page() {
  return (
    <RoleGuard module="clients">
      <CrmRoadmapPage />
    </RoleGuard>
  );
}
