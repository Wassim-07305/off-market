"use client";

import { useState } from "react";
import Link from "next/link";
import { useCourses } from "@/hooks/use-courses";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Plus,
  Filter,
} from "lucide-react";

export default function SchoolPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: courses, isLoading } = useCourses(statusFilter);
  const { isAdmin } = useAuth();

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
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1
            className="text-3xl font-semibold text-foreground"
            style={{ fontFamily: "Instrument Serif, serif" }}
          >
            Formation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses?.length ?? 0} cours disponible{(courses?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/school/builder"
            className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau cours
          </Link>
        )}
      </motion.div>

      {isAdmin && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="flex items-center gap-1.5"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-colors",
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
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
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
                href={`/school/${course.id}`}
                className="group bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="h-40 relative"
                  style={{
                    background: course.cover_image_url
                      ? `url(${course.cover_image_url}) center/cover`
                      : "linear-gradient(135deg, #AF0000 0%, #18181B 100%)",
                  }}
                >
                  {isAdmin && (
                    <span
                      className={cn(
                        "absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full",
                        course.status === "published"
                          ? "bg-success/90 text-white"
                          : course.status === "draft"
                            ? "bg-zinc-800/90 text-zinc-300"
                            : "bg-zinc-500/90 text-white"
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
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
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
                      {totalLessons} lecon{totalLessons !== 1 ? "s" : ""}
                    </span>
                    {totalDuration > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.round(totalDuration / 60)}h
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.modules?.length ?? 0} module{(course.modules?.length ?? 0) !== 1 ? "s" : ""}
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
