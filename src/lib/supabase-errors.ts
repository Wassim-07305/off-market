const ERROR_MAP: Record<string, string> = {
  "User already registered": "Un compte avec cet email existe deja",
  "Invalid login credentials": "Email ou mot de passe incorrect",
  "Email not confirmed": "Veuillez confirmer votre email",
  "Password should be at least 6 characters":
    "Le mot de passe doit faire au moins 6 caracteres",
  "Signup requires a valid password": "Le mot de passe est invalide",
  "Email rate limit exceeded": "Trop de tentatives, reessayez plus tard",
};

export function translateSupabaseError(message: string): string {
  return ERROR_MAP[message] ?? message;
}
