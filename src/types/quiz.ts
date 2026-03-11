// ─── QUIZ QUESTION TYPES ────────────────

export type QuestionType = "multiple_choice" | "true_false" | "open_ended";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple_choice
  correct_answer: string | number; // Index for MC, "true"/"false" for TF, text for open
  explanation?: string;
  points: number;
}

export interface QuizConfig {
  questions: QuizQuestion[];
  passing_score: number; // Percentage (0-100)
  show_correct_answers: boolean;
  shuffle_questions: boolean;
  time_limit?: number; // Minutes, null = no limit
}

// ─── QUIZ ATTEMPT ───────────────────────

export interface QuizAnswer {
  question_id: string;
  answer: string | number;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  lesson_id: string;
  student_id: string;
  answers: QuizAnswer[];
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  completed_at: string;
  time_spent: number;
  created_at: string;
}

// ─── EXERCISE SUBMISSION ────────────────

export type SubmissionStatus = "draft" | "submitted" | "reviewed" | "revision_requested";

export interface ExerciseSubmission {
  id: string;
  lesson_id: string;
  student_id: string;
  content: string;
  attachments: { name: string; url: string }[];
  status: SubmissionStatus;
  coach_feedback: string | null;
  grade: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}
