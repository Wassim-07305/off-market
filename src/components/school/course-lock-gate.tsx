"use client";

import type { ReactNode } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useCourseAccess } from "@/hooks/use-course-access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CourseLockGateProps {
  courseId: string;
  children: ReactNode;
}

export function CourseLockGate({ courseId, children }: CourseLockGateProps) {
  const { canAccess, prerequisites, isLoading } = useCourseAccess(courseId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (canAccess) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg border-amber-200 bg-amber-50/50">
        <CardHeader className="items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Cours verrouille</CardTitle>
          <p className="text-sm text-muted-foreground">
            Vous devez completer les formations prerequises pour acceder a ce
            contenu.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {prerequisites.map((prereq) => (
            <div
              key={prereq.courseId}
              className="rounded-xl border border-border bg-white p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{prereq.course}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    prereq.current >= prereq.required
                      ? "text-green-600"
                      : "text-amber-600",
                  )}
                >
                  {prereq.current}% / {prereq.required}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    prereq.current >= prereq.required
                      ? "bg-green-500"
                      : "bg-amber-500",
                  )}
                  style={{
                    width: `${Math.min(prereq.current, 100)}%`,
                  }}
                />
                {/* Required threshold marker */}
                {prereq.required < 100 && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-gray-500"
                    style={{ left: `${prereq.required}%` }}
                    title={`${prereq.required}% requis`}
                  />
                )}
              </div>

              <div className="mt-3">
                <a href={`/school/courses/${prereq.courseId}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Acceder au cours
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
