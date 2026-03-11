import type { ConditionalLogic, ConditionalRule } from "@/types/database";

/**
 * Evaluate whether a field should be visible given current form answers.
 * Returns true if the field should be shown.
 */
export function evaluateConditionalLogic(
  logic: ConditionalLogic | Record<string, never>,
  answers: Record<string, string>
): boolean {
  // No conditional logic or not enabled → always visible
  if (!logic || !("enabled" in logic) || !logic.enabled) return true;
  if (!logic.rules || logic.rules.length === 0) return true;

  const results = logic.rules.map((rule) => evaluateRule(rule, answers));

  const match = logic.logic === "or"
    ? results.some(Boolean)
    : results.every(Boolean);

  return logic.action === "show" ? match : !match;
}

function evaluateRule(rule: ConditionalRule, answers: Record<string, string>): boolean {
  const answer = answers[rule.fieldId] ?? "";

  switch (rule.operator) {
    case "equals":
      return answer === rule.value;
    case "not_equals":
      return answer !== rule.value;
    case "contains":
      return answer.toLowerCase().includes(rule.value.toLowerCase());
    case "not_contains":
      return !answer.toLowerCase().includes(rule.value.toLowerCase());
    case "is_empty":
      return answer.trim() === "";
    case "is_not_empty":
      return answer.trim() !== "";
    case "gt":
      return Number(answer) > Number(rule.value);
    case "lt":
      return Number(answer) < Number(rule.value);
    default:
      return true;
  }
}

export const CONDITIONAL_OPERATORS: { value: ConditionalRule["operator"]; label: string; needsValue: boolean }[] = [
  { value: "equals", label: "est egal a", needsValue: true },
  { value: "not_equals", label: "est different de", needsValue: true },
  { value: "contains", label: "contient", needsValue: true },
  { value: "not_contains", label: "ne contient pas", needsValue: true },
  { value: "is_empty", label: "est vide", needsValue: false },
  { value: "is_not_empty", label: "n'est pas vide", needsValue: false },
  { value: "gt", label: "est superieur a", needsValue: true },
  { value: "lt", label: "est inferieur a", needsValue: true },
];
