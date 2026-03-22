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

export interface CsvInviteRow {
  nom: string;
  email: string;
  role: string;
}

export const AUDIT_ACTIONS = [
  { value: "user.login", label: "Connexion" },
  { value: "user.logout", label: "Deconnexion" },
  { value: "user.create", label: "Creation utilisateur" },
  { value: "user.update", label: "Modification utilisateur" },
  { value: "user.delete", label: "Suppression utilisateur" },
  { value: "user.role_change", label: "Changement de role" },
  { value: "user.invite", label: "Invitation envoyee" },
  { value: "user.offboard", label: "Offboarding" },
  { value: "client.create", label: "Creation client" },
  { value: "client.update", label: "Modification client" },
  { value: "client.delete", label: "Suppression client" },
  { value: "contract.create", label: "Creation contrat" },
  { value: "contract.sign", label: "Signature contrat" },
  { value: "invoice.create", label: "Creation facture" },
  { value: "invoice.paid", label: "Paiement facture" },
  { value: "invoice.refund", label: "Remboursement" },
  { value: "formation.create", label: "Creation formation" },
  { value: "settings.update", label: "Modification parametres" },
  { value: "api_key.create", label: "Creation cle API" },
  { value: "api_key.revoke", label: "Revocation cle API" },
  { value: "data.export", label: "Export de donnees" },
  { value: "data.delete", label: "Suppression de donnees" },
] as const;
