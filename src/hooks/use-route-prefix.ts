"use client";

import { usePathname } from "next/navigation";

/**
 * Extracts the role-based route prefix from the current pathname.
 * e.g. "/admin/dashboard" → "/admin", "/client/school/123" → "/client"
 */
export function useRoutePrefix(): string {
  const pathname = usePathname();
  const match = pathname.match(/^\/(admin|coach|sales|client)/);
  return match ? `/${match[1]}` : "";
}
