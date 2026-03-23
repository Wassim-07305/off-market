"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Users, UserCog, Send } from "lucide-react";
import dynamic from "next/dynamic";

const ClientsContent = dynamic(
  () => import("@/app/_shared-pages/clients/page"),
  { ssr: false },
);

const EquipeContent = dynamic(() => import("@/app/admin/csm/page"), {
  ssr: false,
});

const InvitationsContent = dynamic(
  () => import("@/app/admin/invitations/page"),
  { ssr: false },
);

type Tab = "clients" | "équipe" | "invitations";

export default function PersonnesPage() {
  const [tab, setTab] = useState<Tab>("clients");

  return (
    <motion.div
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Personnes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerez vos clients, votre équipe et les invitations
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("clients")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "clients"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="w-4 h-4" />
            Clients
          </button>
          <button
            onClick={() => setTab("équipe")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "équipe"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <UserCog className="w-4 h-4" />
            Équipe
          </button>
          <button
            onClick={() => setTab("invitations")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "invitations"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Send className="w-4 h-4" />
            Invitations
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        {tab === "clients" && <ClientsContent />}
        {tab === "équipe" && <EquipeContent />}
        {tab === "invitations" && <InvitationsContent />}
      </div>
    </motion.div>
  );
}
