"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  HelpCircle,
  ToggleLeft,
  MessageSquare,
  Save,
} from "lucide-react";
import type { QuizConfig, QuizQuestion, QuestionType } from "@/types/quiz";
import { toast } from "sonner";

interface QuizBuilderProps {
  initialConfig?: QuizConfig;
  onSave: (config: QuizConfig) => void;
  isSaving?: boolean;
}

const QUESTION_TYPE_LABELS: Record<
  QuestionType,
  { label: string; icon: typeof HelpCircle }
> = {
  multiple_choice: { label: "Choix multiple", icon: CheckCircle },
  true_false: { label: "Vrai / Faux", icon: ToggleLeft },
  open_ended: { label: "Reponse libre", icon: MessageSquare },
};

function generateId() {
  return crypto.randomUUID();
}

function createEmptyQuestion(type: QuestionType): QuizQuestion {
  return {
    id: generateId(),
    type,
    question: "",
    options: type === "multiple_choice" ? ["", "", "", ""] : undefined,
    correct_answer:
      type === "true_false" ? "true" : type === "multiple_choice" ? 0 : "",
    explanation: "",
    points: 1,
  };
}

export function QuizBuilder({
  initialConfig,
  onSave,
  isSaving,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialConfig?.questions ?? [createEmptyQuestion("multiple_choice")],
  );
  const [passingScore, setPassingScore] = useState(
    initialConfig?.passing_score ?? 70,
  );
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(
    initialConfig?.show_correct_answers ?? true,
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(
    initialConfig?.shuffle_questions ?? false,
  );

  const addQuestion = (type: QuestionType) => {
    setQuestions([...questions, createEmptyQuestion(type)]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error("Le quiz doit contenir au moins une question");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    );
  };

  const handleSave = () => {
    // Validate
    for (const q of questions) {
      if (!q.question.trim()) {
        toast.error("Toutes les questions doivent avoir un enonce");
        return;
      }
      if (q.type === "multiple_choice" && q.options) {
        const filledOptions = q.options.filter((o) => o.trim());
        if (filledOptions.length < 2) {
          toast.error("Les QCM doivent avoir au moins 2 options");
          return;
        }
      }
    }

    onSave({
      questions,
      passing_score: passingScore,
      show_correct_answers: showCorrectAnswers,
      shuffle_questions: shuffleQuestions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Parametres du quiz
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Score minimum (%)
            </label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCorrectAnswers}
              onChange={(e) => setShowCorrectAnswers(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">
              Afficher les reponses correctes
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm text-foreground">
              Melanger les questions
            </span>
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            index={index}
            question={question}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onRemove={() => removeQuestion(question.id)}
          />
        ))}
      </div>

      {/* Add question */}
      <div className="flex flex-wrap gap-2">
        {(
          Object.entries(QUESTION_TYPE_LABELS) as [
            QuestionType,
            { label: string; icon: typeof HelpCircle },
          ][]
        ).map(([type, { label, icon: Icon }]) => (
          <button
            key={type}
            onClick={() => addQuestion(type)}
            className="inline-flex items-center gap-2 h-9 px-3 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 h-10 px-5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Enregistrer le quiz"}
        </button>
      </div>
    </div>
  );
}

// ─── Individual Question Editor ─────────

function QuestionEditor({
  index,
  question,
  onUpdate,
  onRemove,
}: {
  index: number;
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
  onRemove: () => void;
}) {
  const typeConfig = QUESTION_TYPE_LABELS[question.type];
  const Icon = typeConfig.icon;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border">
        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase">
          Q{index + 1} — {typeConfig.label}
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={question.points}
            onChange={(e) =>
              onUpdate({ points: Math.max(1, Number(e.target.value)) })
            }
            min={1}
            className="w-16 h-7 px-2 bg-surface border border-border rounded text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-muted-foreground">
            pt{question.points > 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Question text */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Enonce
          </label>
          <textarea
            value={question.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            rows={2}
            placeholder="Posez votre question ici..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Type-specific editor */}
        {question.type === "multiple_choice" && (
          <MultipleChoiceEditor question={question} onUpdate={onUpdate} />
        )}
        {question.type === "true_false" && (
          <TrueFalseEditor question={question} onUpdate={onUpdate} />
        )}
        {question.type === "open_ended" && (
          <div className="text-xs text-muted-foreground italic">
            La reponse sera evaluee manuellement par le coach.
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Explication (optionnel)
          </label>
          <input
            type="text"
            value={question.explanation ?? ""}
            onChange={(e) => onUpdate({ explanation: e.target.value })}
            placeholder="Explication affichee apres la reponse..."
            className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Multiple Choice Editor ─────────────

function MultipleChoiceEditor({
  question,
  onUpdate,
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  const options = question.options ?? ["", ""];

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    onUpdate({ options: [...options, ""] });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    // Adjust correct answer if needed
    const correctIdx = Number(question.correct_answer);
    if (index === correctIdx) {
      onUpdate({ options: newOptions, correct_answer: 0 });
    } else if (index < correctIdx) {
      onUpdate({ options: newOptions, correct_answer: correctIdx - 1 });
    } else {
      onUpdate({ options: newOptions });
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">
        Options (cliquez sur le cercle pour definir la bonne reponse)
      </label>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdate({ correct_answer: index })}
            className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${
              Number(question.correct_answer) === index
                ? "bg-emerald-500 border-emerald-500"
                : "border-border hover:border-primary"
            }`}
          >
            {Number(question.correct_answer) === index && (
              <CheckCircle className="w-4 h-4 text-white mx-auto" />
            )}
          </button>
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {options.length > 2 && (
            <button
              onClick={() => removeOption(index)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addOption}
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter une option
      </button>
    </div>
  );
}

// ─── True/False Editor ──────────────────

function TrueFalseEditor({
  question,
  onUpdate,
}: {
  question: QuizQuestion;
  onUpdate: (updates: Partial<QuizQuestion>) => void;
}) {
  return (
    <div className="flex gap-3">
      {["true", "false"].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onUpdate({ correct_answer: value })}
          className={`flex-1 h-10 rounded-lg text-sm font-medium border transition-colors ${
            question.correct_answer === value
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
              : "bg-surface border-border text-muted-foreground hover:border-primary"
          }`}
        >
          {value === "true" ? "Vrai" : "Faux"}
        </button>
      ))}
    </div>
  );
}
