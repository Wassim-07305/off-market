"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import CrmRoadmapPage from "@/app/_shared-pages/crm/[id]/roadmap/page";

export default function Page() {
  const params = useParams();
  return (
    <RoleGuard module="clients">
      <CrmRoadmapPage params={Promise.resolve({ id: params.id as string })} />
    </RoleGuard>
  );
}
