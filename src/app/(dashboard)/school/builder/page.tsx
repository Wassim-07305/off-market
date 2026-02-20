"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourseMutations } from "@/hooks/use-courses";
import { toast } from "sonner";
import { ArrowLeft, Plus, Save, GripVertical, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CourseBuilderPage() {
  const router = useRouter();
  const { createCourse, createModule, createLesson } = useCourseMutations();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<
    Array<{
      id: string;
      title: string;
      lessons: Array<{ id: string; title: string; type: string }>;
    }>
  >([]);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: crypto.randomUUID(),
        title: "",
        lessons: [],
      },
    ]);
  };

  const addLesson = (moduleId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { id: crypto.randomUUID(), title: "", type: "text" },
              ],
            }
          : m
      )
    );
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    const course = await createCourse.mutateAsync({
      title,
      description,
      status: "draft",
    });

    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      if (!mod.title.trim()) continue;
      const savedModule = await createModule.mutateAsync({
        course_id: course.id,
        title: mod.title,
        sort_order: i,
      });

      for (let j = 0; j < mod.lessons.length; j++) {
        const lesson = mod.lessons[j];
        if (!lesson.title.trim()) continue;
        await createLesson.mutateAsync({
          module_id: savedModule.id,
          title: lesson.title,
          content_type: lesson.type,
          sort_order: j,
        });
      }
    }

    toast.success("Cours cree");
    router.push("/school");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/school"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <button
          onClick={handleSave}
          disabled={createCourse.isPending}
          className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Sauvegarder
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Nouveau cours
        </h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours"
            className="w-full h-11 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du cours"
            rows={3}
            className="w-full px-4 py-3 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Modules</h3>
          <button
            onClick={addModule}
            className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Module
          </button>
        </div>

        {modules.map((mod, mi) => (
          <div
            key={mod.id}
            className="bg-surface border border-border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <input
                value={mod.title}
                onChange={(e) =>
                  setModules(
                    modules.map((m) =>
                      m.id === mod.id ? { ...m, title: e.target.value } : m
                    )
                  )
                }
                placeholder={`Module ${mi + 1}`}
                className="flex-1 h-9 px-3 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => removeModule(mod.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {mod.lessons.map((lesson, li) => (
              <div key={lesson.id} className="flex items-center gap-2 pl-6">
                <input
                  value={lesson.title}
                  onChange={(e) =>
                    setModules(
                      modules.map((m) =>
                        m.id === mod.id
                          ? {
                              ...m,
                              lessons: m.lessons.map((l) =>
                                l.id === lesson.id
                                  ? { ...l, title: e.target.value }
                                  : l
                              ),
                            }
                          : m
                      )
                    )
                  }
                  placeholder={`Lecon ${li + 1}`}
                  className="flex-1 h-8 px-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={lesson.type}
                  onChange={(e) =>
                    setModules(
                      modules.map((m) =>
                        m.id === mod.id
                          ? {
                              ...m,
                              lessons: m.lessons.map((l) =>
                                l.id === lesson.id
                                  ? { ...l, type: e.target.value }
                                  : l
                              ),
                            }
                          : m
                      )
                    )
                  }
                  className="h-8 px-2 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none"
                >
                  <option value="text">Texte</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Exercice</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            ))}

            <button
              onClick={() => addLesson(mod.id)}
              className="ml-6 h-7 px-2.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Lecon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
