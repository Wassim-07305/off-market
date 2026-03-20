"use client";

import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { WidgetGrid } from "@/components/dashboard/widget-grid";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function DashboardPage() {
  const { isClient, loading } = useAuth();

  // Wait for profile to load before deciding which dashboard to show
  // Without this guard, profile=null → isClient=false → StaffDashboard renders for clients
  if (loading) return null;

  // Clients get the enhanced dedicated dashboard
  if (isClient) {
    return <ClientDashboard />;
  }

  return <StaffDashboard />;
}

// --- Staff / Admin / Coach dashboard ---

function StaffDashboard() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Page title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vue d&apos;ensemble de ton activite
        </p>
      </motion.div>

      {/* Configurable widget grid */}
      <motion.div variants={staggerItem}>
        <WidgetGrid />
      </motion.div>
    </motion.div>
  );
}
