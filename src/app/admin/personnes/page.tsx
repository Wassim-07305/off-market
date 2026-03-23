"use client";

import { useState, Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Users, UserCog, Send, AlertTriangle, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";

class TabErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean; error: string | null }
> {
  constructor(props: { children: ReactNode; name: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Erreur de chargement
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Impossible de charger la section {this.props.name}. Veuillez reessayer.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        {tab === "clients" && (
          <TabErrorBoundary name="Clients">
            <ClientsContent />
          </TabErrorBoundary>
        )}
        {tab === "équipe" && (
          <TabErrorBoundary name="Equipe">
            <EquipeContent />
          </TabErrorBoundary>
        )}
        {tab === "invitations" && (
          <TabErrorBoundary name="Invitations">
            <InvitationsContent />
          </TabErrorBoundary>
        )}
      </div>
    </motion.div>
  );
}
