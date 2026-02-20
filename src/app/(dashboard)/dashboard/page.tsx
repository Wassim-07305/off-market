"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopStudents } from "@/components/dashboard/top-students";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import {
  Users,
  DollarSign,
  GraduationCap,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";

export default function DashboardPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page title */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1
          className="text-3xl font-semibold text-foreground"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble de ton activite
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Eleves actifs"
          value="47"
          change={12}
          changeLabel="vs mois dernier"
          icon={Users}
        />
        <StatCard
          title="Revenus du mois"
          value="8 400 EUR"
          change={8.5}
          changeLabel="vs mois dernier"
          icon={DollarSign}
        />
        <StatCard
          title="Completion moyenne"
          value="73%"
          change={5}
          changeLabel="vs mois dernier"
          icon={GraduationCap}
        />
        <StatCard
          title="Score d'engagement"
          value="82"
          change={-3}
          changeLabel="vs mois dernier"
          icon={Activity}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <RevenueChart />
        <EngagementChart />
      </motion.div>

      {/* Bottom section */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <ActivityFeed />
        <TopStudents />
        <AIInsightsCard />
      </motion.div>
    </motion.div>
  );
}
