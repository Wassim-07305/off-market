"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useStudents, type StudentWithDetails } from "@/hooks/use-students";
import { STUDENT_PIPELINE_STAGES, STUDENT_FLAGS } from "@/lib/constants";
import type { StudentPipelineStage } from "@/types/database";
import { cn, getInitials, formatDate } from "@/lib/utils";
import { FlagDot } from "./flag-indicator";
import { EngagementTagBadge } from "./engagement-tag";
import { GripVertical, AlertTriangle, Clock, User } from "lucide-react";

// ─── Student Card ────────────────────────────────────────────

function StudentCard({
  student,
  isDragging,
}: {
  student: StudentWithDetails;
  isDragging?: boolean;
}) {
  const details = student.student_details?.[0];
  const flag = details?.flag ?? "green";
  const stageEnteredAt = details?.stage_entered_at;

  // Check if student is stuck (more than 14 days in same stage)
  const isStuck = useMemo(() => {
    if (!stageEnteredAt) return false;
    const daysSince =
      (Date.now() - new Date(stageEnteredAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 14;
  }, [stageEnteredAt]);

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl p-3 group transition-shadow",
        isDragging ? "shadow-lg opacity-90 rotate-2" : "hover:shadow-sm",
        flag === "red" && "border-red-200 bg-red-50/30",
        flag === "orange" && "border-orange-200 bg-orange-50/30",
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium shrink-0">
              {getInitials(student.full_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-foreground truncate">
                  {student.full_name}
                </p>
                <FlagDot flag={flag} size="sm" pulse={flag === "red"} />
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {details?.tag && (
              <EngagementTagBadge
                tag={details.tag}
                size="sm"
                showIcon={false}
              />
            )}
            {details?.assigned_coach_profile && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <User className="w-2.5 h-2.5" />
                {details.assigned_coach_profile.full_name.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Stuck alert */}
          {isStuck && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-warning font-medium">
              <AlertTriangle className="w-3 h-3" />
              Bloque depuis{" "}
              {stageEnteredAt
                ? Math.round(
                    (Date.now() - new Date(stageEnteredAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : "?"}{" "}
              jours
            </div>
          )}

          {/* Health score bar */}
          {details && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    (details.health_score ?? 0) >= 70
                      ? "bg-emerald-500"
                      : (details.health_score ?? 0) >= 40
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${details.health_score ?? 0}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {details.health_score ?? 0}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Draggable wrapper ───────────────────────────────────────

function DraggableStudent({ student }: { student: StudentWithDetails }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: student.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-30")}
    >
      <StudentCard student={student} />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────

function StageColumn({
  stage,
  students,
}: {
  stage: (typeof STUDENT_PIPELINE_STAGES)[number];
  students: StudentWithDetails[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  // Count flags
  const flagCounts = useMemo(() => {
    const counts: Record<string, number> = { green: 0, yellow: 0, orange: 0, red: 0 };
    for (const s of students) {
      const f = s.student_details?.[0]?.flag ?? "green";
      counts[f] = (counts[f] ?? 0) + 1;
    }
    return counts;
  }, [students]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] shrink-0",
        isOver && "ring-2 ring-primary/30 rounded-xl",
      )}
    >
      <div className={cn("rounded-xl px-3 py-2 mb-2 border", stage.bg)}>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-semibold", stage.color)}>
            {stage.label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-mono">
              {students.length}
            </span>
            {/* Flag summary dots */}
            <div className="flex items-center gap-1">
              {flagCounts.red > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-red-600 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {flagCounts.red}
                </span>
              )}
              {flagCounts.orange > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] text-orange-600 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {flagCounts.orange}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2 min-h-[100px]">
        {students.map((student) => (
          <DraggableStudent key={student.id} student={student} />
        ))}
        {students.length === 0 && (
          <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground border border-dashed border-border/60 rounded-xl">
            Aucun eleve
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conversion Stats ────────────────────────────────────────

function ConversionStats({
  studentsByStage,
}: {
  studentsByStage: Map<StudentPipelineStage, StudentWithDetails[]>;
}) {
  const stages = STUDENT_PIPELINE_STAGES;

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {stages.map((stage, i) => {
        const count = studentsByStage.get(stage.value)?.length ?? 0;
        const prevCount =
          i > 0
            ? (studentsByStage.get(stages[i - 1].value)?.length ?? 0)
            : count;
        const conversionRate =
          prevCount > 0 && i > 0 ? Math.round((count / prevCount) * 100) : null;

        return (
          <div key={stage.value} className="flex items-center gap-1">
            {i > 0 && (
              <div className="flex flex-col items-center px-1">
                <span className="text-[9px] text-muted-foreground font-mono">
                  {conversionRate !== null ? `${conversionRate}%` : ""}
                </span>
                <div className="w-4 h-px bg-border" />
              </div>
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium",
                stage.bg,
                stage.color,
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", stage.dotColor)} />
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Pipeline Kanban ────────────────────────────────────

export function StudentPipelineKanban() {
  const { students, isLoading, updateStudentPipelineStage } = useStudents();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // Group students by pipeline stage
  const studentsByStage = useMemo(() => {
    const map = new Map<StudentPipelineStage, StudentWithDetails[]>();
    STUDENT_PIPELINE_STAGES.forEach((s) => map.set(s.value, []));
    students.forEach((student) => {
      const stage = student.student_details?.[0]?.pipeline_stage ?? "onboarding";
      const list = map.get(stage);
      if (list) list.push(student);
    });
    return map;
  }, [students]);

  const activeStudent = activeId
    ? (students.find((s) => s.id === activeId) ?? null)
    : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const studentId = String(active.id);
    const newStage = String(over.id) as StudentPipelineStage;

    if (!STUDENT_PIPELINE_STAGES.some((s) => s.value === newStage)) return;

    const student = students.find((s) => s.id === studentId);
    const currentStage = student?.student_details?.[0]?.pipeline_stage;
    if (!student || currentStage === newStage) return;

    updateStudentPipelineStage.mutate({
      profileId: studentId,
      stage: newStage,
    });
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STUDENT_PIPELINE_STAGES.slice(0, 4).map((s) => (
          <div key={s.value} className="min-w-[280px] space-y-2">
            <div className="h-8 bg-muted rounded-xl animate-shimmer" />
            <div className="h-24 bg-muted rounded-xl animate-shimmer" />
            <div className="h-24 bg-muted rounded-xl animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Conversion funnel */}
      <ConversionStats studentsByStage={studentsByStage} />

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STUDENT_PIPELINE_STAGES.map((stage) => {
            const stageStudents = studentsByStage.get(stage.value) ?? [];
            return (
              <StageColumn
                key={stage.value}
                stage={stage}
                students={stageStudents}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeStudent ? (
            <div className="w-[260px]">
              <StudentCard student={activeStudent} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
