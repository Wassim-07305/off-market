"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { QuizConfig, QuizQuestion, QuizAnswer } from "@/types/quiz";
import { useQuizAttempts, useSubmitQuiz } from "@/hooks/use-quizzes";

interface QuizPlayerProps {
  lessonId: string;
  config: QuizConfig;
  onComplete?: (passed: boolean) => void;
}

export function QuizPlayer({ lessonId, config, onComplete }: QuizPlayerProps) {
  const { data: attempts } = useQuizAttempts(lessonId);
  const submitQuiz = useSubmitQuiz();

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | number>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correct: number;
    total: number;
    passed: boolean;
    answers: QuizAnswer[];
  } | null>(null);

  const startTimeRef = useRef<number>(0);

  const questions = config.shuffle_questions
    ? [...config.questions].sort(() => Math.random() - 0.5)
    : config.questions;

  const bestAttempt = attempts?.[0];
  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setStarted(true);
    setAnswers(new Map());
    setShowResults(false);
    setResults(null);
    setCurrentIndex(0);
    startTimeRef.current = Date.now();
  };

  const selectAnswer = (questionId: string, answer: string | number) => {
    setAnswers(new Map(answers).set(questionId, answer));
  };

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    const quizAnswers: QuizAnswer[] = questions.map((q) => {
      const userAnswer = answers.get(q.id);
      let isCorrect = false;

      if (q.type === "multiple_choice") {
        isCorrect = Number(userAnswer) === Number(q.correct_answer);
      } else if (q.type === "true_false") {
        isCorrect = String(userAnswer) === String(q.correct_answer);
      }
      // open_ended: always false, reviewed manually

      return {
        question_id: q.id,
        answer: userAnswer ?? "",
        is_correct: isCorrect,
      };
    });

    const correctCount = quizAnswers.filter((a) => a.is_correct).length;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = questions.reduce((sum, q, i) => {
      return sum + (quizAnswers[i].is_correct ? q.points : 0);
    }, 0);
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= config.passing_score;

    const resultData = {
      score: Math.round(score * 10) / 10,
      correct: correctCount,
      total: questions.length,
      passed,
      answers: quizAnswers,
    };

    setResults(resultData);
    setShowResults(true);

    submitQuiz.mutate(
      {
        lesson_id: lessonId,
        answers: quizAnswers,
        score: resultData.score,
        total_questions: questions.length,
        correct_answers: correctCount,
        passed,
        time_spent: timeSpent,
      },
      {
        onSuccess: () => {
          if (passed) onComplete?.(true);
        },
      }
    );
  };

  // ─── Not started yet ──────────────────

  if (!started) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Quiz</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {questions.length} question{questions.length > 1 ? "s" : ""} — Score minimum : {config.passing_score}%
          </p>
        </div>
        {bestAttempt && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              bestAttempt.passed
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            }`}
          >
            {bestAttempt.passed ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5" />
            )}
            Dernier score : {bestAttempt.score}%
            {bestAttempt.passed ? " — Reussi" : " — Non reussi"}
          </div>
        )}
        <button
          onClick={handleStart}
          className="h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {bestAttempt ? "Retenter le quiz" : "Commencer le quiz"}
        </button>
      </div>
    );
  }

  // ─── Show results ─────────────────────

  if (showResults && results) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {/* Score header */}
        <div
          className={`p-6 text-center ${
            results.passed ? "bg-emerald-500/10" : "bg-red-500/10"
          }`}
        >
          <div className="text-4xl font-bold text-foreground mb-1">{results.score}%</div>
          <p className="text-sm font-medium text-foreground">
            {results.correct}/{results.total} reponses correctes
          </p>
          <div
            className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-medium ${
              results.passed
                ? "bg-emerald-500/20 text-emerald-700"
                : "bg-red-500/20 text-red-700"
            }`}
          >
            {results.passed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Quiz reussi !
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Score insuffisant (minimum {config.passing_score}%)
              </>
            )}
          </div>
        </div>

        {/* Answers review */}
        {config.show_correct_answers && (
          <div className="p-4 space-y-3">
            {questions.map((q, i) => {
              const answer = results.answers[i];
              return (
                <div
                  key={q.id}
                  className={`p-3 rounded-lg border ${
                    answer.is_correct
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {answer.is_correct ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Retry */}
        <div className="p-4 border-t border-border flex justify-center">
          <button
            onClick={handleStart}
            className="inline-flex items-center gap-2 h-9 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retenter
          </button>
        </div>
      </div>
    );
  }

  // ─── Active quiz ──────────────────────

  const answeredCurrent = answers.has(currentQuestion.id);
  const isLast = currentIndex === questions.length - 1;
  const answeredCount = answers.size;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Counter */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Question {currentIndex + 1} sur {questions.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {currentQuestion.points} pt{currentQuestion.points > 1 ? "s" : ""}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-lg font-medium text-foreground">{currentQuestion.question}</h3>

        {/* Answer options */}
        {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(currentQuestion.id, i)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                  answers.get(currentQuestion.id) === i
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-surface border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium mr-3">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "true_false" && (
          <div className="flex gap-3">
            {[
              { value: "true", label: "Vrai" },
              { value: "false", label: "Faux" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => selectAnswer(currentQuestion.id, value)}
                className={`flex-1 h-12 rounded-lg text-sm font-medium border transition-colors ${
                  answers.get(currentQuestion.id) === value
                    ? "bg-primary/10 border-primary text-foreground"
                    : "bg-surface border-border text-foreground hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === "open_ended" && (
          <textarea
            value={String(answers.get(currentQuestion.id) ?? "")}
            onChange={(e) => selectAnswer(currentQuestion.id, e.target.value)}
            rows={4}
            placeholder="Votre reponse..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Precedent
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length || submitQuiz.isPending}
              className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitQuiz.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Valider ({answeredCount}/{questions.length})
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={!answeredCurrent}
              className="inline-flex items-center gap-1 h-9 px-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
