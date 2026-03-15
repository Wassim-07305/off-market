"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Book, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { KBSidebar } from "@/components/knowledge-base/kb-sidebar";
import { KBPageEditor } from "@/components/knowledge-base/kb-page-editor";

export default function KnowledgeBasePageDetail() {
  const { isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ pageId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Extraire le base path (ex: /admin/knowledge-base)
  const basePath = pathname.replace(/\/[^/]+$/, "");

  const handleSelectPage = (pageId: string) => {
    router.push(`${basePath}/${pageId}`);
  };

  const handlePageDeleted = () => {
    router.push(basePath);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-64px)] flex flex-col"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeft className="w-4 h-4" />
            )}
          </button>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground tracking-tight">
              Base de connaissances
            </h1>
            <p className="text-xs text-muted-foreground">
              Wiki interne — documentation et ressources
            </p>
          </div>
        </div>
      </motion.div>

      {/* Split layout */}
      <motion.div variants={staggerItem} className="flex-1 flex min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 border-r border-border bg-surface/30 overflow-hidden">
            <KBSidebar
              selectedPageId={params.pageId}
              onSelectPage={handleSelectPage}
              canEdit={isStaff}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <KBPageEditor
            pageId={params.pageId}
            onNavigate={handleSelectPage}
            onDeleted={handlePageDeleted}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
