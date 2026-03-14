"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { ClipboardList } from "lucide-react";

export default function AuditPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-muted-foreground" />
          Journal d&apos;audit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historique complet des actions sur la plateforme
        </p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <AuditLogTable />
      </motion.div>
    </motion.div>
  );
}
