"use client";

import { useRouter } from "next/navigation";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { TemplateGallery } from "@/components/forms/template-gallery";

export default function NewFormPage() {
  const router = useRouter();
  const prefix = useRoutePrefix();

  return (
    <TemplateGallery
      onSelectTemplate={(formId) => {
        router.push(`${prefix}/forms/builder/${formId}`);
      }}
      onCreateBlank={() => {
        router.push(`${prefix}/forms/builder`);
      }}
      onBack={() => {
        router.push(`${prefix}/forms`);
      }}
    />
  );
}
