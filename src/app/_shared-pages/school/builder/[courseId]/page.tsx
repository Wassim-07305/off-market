"use client";

import { use } from "react";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourse } from "@/hooks/use-courses";
import { CourseEditor } from "@/components/school/course-editor";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course, isLoading } = useCourse(courseId);
  const prefix = useRoutePrefix();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <p className="text-center text-muted-foreground py-16">Cours non trouve</p>;
  }

  return <CourseEditor course={course} routePrefix={prefix} />;
}
