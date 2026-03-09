export interface UserInvite {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "coach" | "setter" | "closer" | "client";
  invite_code: string;
  status: "pending" | "accepted" | "expired";
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "coach", label: "Coach" },
  { value: "setter", label: "Setter" },
  { value: "closer", label: "Closer" },
  { value: "client", label: "Client" },
] as const;
