"use client";

import { useState } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourses } from "@/hooks/use-courses";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Plus,
} from "lucide-react";

export default function SchoolPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: courses, isLoading } = useCourses(statusFilter);
  const { isStaff } = useAuth();
  const prefix = useRoutePrefix();

  const filters = [
    { value: "all", label: "Tous" },
    { value: "published", label: "Publies" },
    { value: "draft", label: "Brouillons" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Formation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses?.length ?? 0} cours disponible{(courses?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <Link
            href={`${prefix}/school/builder`}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau cours
          </Link>
        )}
      </motion.div>

      {isStaff && (
        <motion.div
          variants={staggerItem}
          className="flex items-center gap-1.5"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                statusFilter === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-40 bg-muted animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-full bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded-lg animate-shimmer" />
              </div>
            </div>
          ))
        ) : !courses || courses.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun cours pour le moment
            </p>
          </div>
        ) : (
          courses.map((course) => {
            const totalLessons = course.modules?.reduce(
              (acc, m) => acc + (m.lessons?.length ?? 0),
              0
            ) ?? 0;
            const totalDuration = course.estimated_duration ?? 0;
            return (
              <Link
                key={course.id}
                href={`${prefix}/school/${course.id}`}
                className="group bg-surface rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
                style={{ boxShadow: "var(--shadow-card)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
              >
                <div
                  className="h-40 relative overflow-hidden"
                  style={{
                    background: course.cover_image_url
                      ? `url(${course.cover_image_url}) center/cover`
                      : "linear-gradient(135deg, var(--primary) 0%, #18181B 100%)",
                  }}
                >
                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Hover zoom effect */}
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{
                    background: course.cover_image_url
                      ? `url(${course.cover_image_url}) center/cover`
                      : "transparent",
                  }} />
                  {isStaff && (
                    <span
                      className={cn(
                        "absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-10",
                        course.status === "published"
                          ? "bg-success/80 text-white"
                          : course.status === "draft"
                            ? "bg-black/50 text-white/80"
                            : "bg-black/40 text-white/70"
                      )}
                    >
                      {course.status === "published"
                        ? "Publie"
                        : course.status === "draft"
                          ? "Brouillon"
                          : "Archive"}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="font-mono">{totalLessons}</span> lecon{totalLessons !== 1 ? "s" : ""}
                    </span>
                    {totalDuration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono">{Math.round(totalDuration / 60)}</span>h
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-mono">{course.modules?.length ?? 0}</span> module{(course.modules?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
