"use client";

import MessagingContainer from "@/components/messaging/messaging-container";
import { PageTransition } from "@/components/ui/page-transition";

export default function MessagingPage() {
  return (
    <PageTransition>
      <MessagingContainer />
    </PageTransition>
  );
}
