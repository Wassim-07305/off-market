"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import CrmPage from "@/app/_shared-pages/crm/page";

export default function Page() {
  return (
    <RoleGuard module="clients">
      <CrmPage />
    </RoleGuard>
  );
}
