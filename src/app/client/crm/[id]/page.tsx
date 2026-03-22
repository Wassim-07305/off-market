"use client";

import { useParams } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import CrmDetailPage from "@/app/_shared-pages/crm/[id]/page";

export default function Page() {
  const params = useParams();
  return (
    <RoleGuard module="clients">
      <CrmDetailPage params={Promise.resolve({ id: params.id as string })} />
    </RoleGuard>
  );
}
