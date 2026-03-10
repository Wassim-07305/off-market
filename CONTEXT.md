# CONTEXT.md — Off-Market

## Identité du projet

- **Client :** Alexia Laneau (coach business, partenariat avec Nassim)
- **Deal :** Échange — app 4 000 € contre coaching 11 000 €
- **Statut :** 60% CDC réalisé
- **GitHub :** https://github.com/Wassim-07305/off-market
- **Vercel (prod) :** https://off-market-ahmanewassim6-2668s-projects.vercel.app

## Description du projet (CDC)

**Off-Market** est une plateforme tout-en-un de coaching et gestion business pour freelances et coachs qui veulent atteindre et dépasser 10 000€ de CA mensuel. **Ce n'est PAS une app immobilière.**

Multi-portails : Admin (Alexia), Coach, Élève.

**Modules :** CRM Élèves, Formation LMS, Messagerie, Appels vidéo, Gamification, Journal/Check-ins, Form Builder, Contrats, Communauté, Onboarding personnalisé, IA (réponses automatiques, analyse client), Notifications.

Alexia utilise l'app pour gérer ses coachés, suivre leur progression, envoyer des modules de formation et automatiser ses relances.

## Stack technique

- **Attention : React + Vite (pas Next.js)** — projet développé par Gilles
- React 19 + TypeScript + Vite + Tailwind CSS 4
- Supabase (PostgreSQL + Auth + RLS)
- shadcn/ui + Lucide React + Sonner
- Déployé sur Vercel

## Supabase

- **Project ref :** srhpdgqqiuzdrlqaitdk
- **Password :** ginnu3-hybzih-jopnuG
- **Connection string :**
  ```
  postgresql://postgres.srhpdgqqiuzdrlqaitdk:ginnu3-hybzih-jopnuG@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
  ```

## Comptes de test

| Rôle  | Email                   | Mot de passe |
|-------|-------------------------|--------------|
| Test  | test@off-market.fr      | Test1234x    |

## Commandes utiles

```bash
npm run dev     # Démarrer le serveur Vite
npm run build   # TypeScript check + build production
npm run lint    # ESLint
```

## Équipe

- **Gilles Hayibor** (GitHub: ghayibor) — dev principal délégué, branches dev
- **Wassim** — supervision et livraison

## Instructions Claude Code

- Modèle : `claude-opus-4-5`
- Toujours utiliser : `--permission-mode bypassPermissions`
- Lire ce CONTEXT.md en premier, puis `git log`, puis `npm run build`
- Corriger TOUTES les erreurs TypeScript/ESLint
- Pusher sur GitHub après chaque lot de changements
- Utiliser les vraies données Supabase (pas de mocks)
- Appliquer les migrations si des tables manquent
- Ne jamais casser les fonctionnalités existantes
