# Metrik — Suivi Fitness, Poids & Nutrition Décomplexé

<div align="center">

![Metrik Banner](https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&h=400&q=80)

**L'application web personnelle de tracking de santé pensée pour éliminer la frustration des modèles freemium.**  
*Zéro publicité • Zéro paywall • Calculs caloriques honnêtes par fourchettes • Zéro pesée d'aliments au gramme.*

[![Next.js](https://img.shields.io/badge/Next.js-16%2B_(App_Router)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Postgres-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Production-metrik--pi.vercel.app-2563EB?style=flat-square&logo=vercel)](https://metrik-pi.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br />

👉 **Site en ligne (Production) : [https://metrik-pi.vercel.app](https://metrik-pi.vercel.app)**


</div>

---

## 📖 Sommaire
1. [À Propos de Metrik](#-à-propos-de-metrik)
2. [Stack Technique](#-stack-technique)
3. [Architecture de la Documentation](#-architecture-de-la-documentation)
4. [Prérequis & Installation](#-prérequis--installation)
5. [Variables d'Environnement](#-variables-denvironnement)
6. [Mise en Place de la Base de Données](#-mise-en-place-de-la-base-de-données)
7. [Conventions de Développement](#-conventions-de-développement)
8. [Roadmap d'Implémentation](#-roadmap-dimplémentation)

---

## 🌟 À Propos de Metrik

La majorité des applications fitness grand public (MyFitnessPal, Strava, Yazio) ont dérivé vers des modèles agressifs : abonnement mensuel pour voir un graphique à 30 jours, saisie anxiogène et chronophage de chaque gramme de nourriture, et dépenses caloriques illusoires au calorie près.

**Metrik prend le contre-pied total avec 4 piliers fondamentaux :**
- **Fourchettes caloriques honnêtes :** Estimation scientifique basée sur les indices **METs (Metabolic Equivalent of Task)** indexés dynamiquement sur votre poids du jour, avec une marge réaliste de $\pm 10\%$.
- **Feed d'activités façon Airbnb / Plateforme de standing :** Présentation élégante sous forme de cards horizontales mettant en avant vos captures d'écran Strava ou photos d'effort.
- **Suivi alimentaire décomplexé :** Un log de repas se fait en 5 secondes. Pas de scan de code-barres obligatoire ni de pesée millimétrée : vous indiquez une estimation globale et une description libre.
- **Data-visualisation gratifiante :** Courbe de poids lissée sur moyenne mobile 7 jours et calendrier de consistance sous forme de **Heatmap style GitHub** pour valoriser la régularité.

---

## 🛠 Stack Technique

- **Framework Web :** [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions, React 19)
- **Langage :** [TypeScript](https://www.typescriptlang.org/) (Mode `strict: true`)
- **Design & UI :** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [lucide-react](https://lucide.dev/)
- **Thématisation :** `next-themes` (Dark mode profond `#090A0F` & Light mode blanc cassé `#F8F9FA`, accent bleu électrique `#2563EB`)
- **Backend & Données :** [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth SSR, Supabase Storage)
- **Visualisation de Données :** [Recharts](https://recharts.org/) pour les courbes et comparatifs + Composant SVG personnalisé pour la Heatmap annuelle.

---

## 📚 Architecture de la Documentation

Pour assurer une clarté totale lors du cycle de développement, le projet s'articule autour de 4 documents maîtres situés à la racine du dépôt :

| Document | Rôle & Contenu |
| :--- | :--- |
| **[PRD.md](./PRD.md)** | **Product Requirements Document :** Vision produit, personas, user flows, formules scientifiques (Mifflin-St Jeor, METs), spécifications fonctionnelles détaillées. |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | **Architecture Technique :** Arborescence Next.js App Router, patterns Server/Client Components, Server Actions sécurisées, intégration `@supabase/ssr`, pipeline d'images. |
| **[DATABASE.md](./DATABASE.md)** | **Base de Données & Sécurité :** Schéma relationnel complet SQL, triggers de synchronisation du poids, politiques de sécurité RLS, configuration du bucket Storage et seeds. |
| **[README.md](./README.md)** | **Guide Général :** Présentation du projet, installation pas à pas, variables d'environnement, conventions et roadmap. |

---

## 🚀 Prérequis & Installation

### Prérequis
- [Node.js](https://nodejs.org/) v18.18+ ou v20+ (LTS recommandé)
- Gestionnaire de paquets [pnpm](https://pnpm.io/) (recommandé) ou `npm`
- Un projet [Supabase](https://supabase.com/) (Cloud ou instance locale Supabase CLI)

### Installation Pas à Pas

1. **Cloner le dépôt ou se positionner dans le dossier :**
   ```bash
   cd "/Users/max/Desktop/Projets Persos/Metrik"
   ```

2. **Installer les dépendances :**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configurer les variables d'environnement :**
   Copiez le fichier d'exemple et renseignez vos clés d'API Supabase :
   ```bash
   cp .env.example .env.local
   ```

4. **Initialiser la base de données :**
   Rendez-vous sur votre dashboard Supabase > **SQL Editor**, puis copiez et exécutez l'intégralité du script présent dans **[DATABASE.md](./DATABASE.md)**.

5. **Lancer le serveur de développement :**
   ```bash
   pnpm dev
   # ou
   npm run dev
   ```
   L'application est immédiatement accessible sur [http://localhost:3000](http://localhost:3000).

---

## 🔐 Variables d'Environnement

Le fichier `.env.local` doit contenir les variables suivantes :

```env
# ==============================================================================
# METRIK — CONFIGURATION ENVIRONNEMENT
# ==============================================================================

# URL publique de votre instance Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co

# Clé anonyme publique (Anon Key) — Utilisable côté navigateur & client
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé secrète d'administration (Optionnelle - réservée aux scripts de maintenance serveur)
# Ne JAMAIS préfixer par NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL canonique de l'application (pour les redirections Auth & Magic Links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Déploiement en Production sur Vercel (Pérenne & Continu)

L'application est officiellement déployée et accessible en ligne :
👉 **[https://metrik-pi.vercel.app](https://metrik-pi.vercel.app)**

### Architecture de Déploiement
Le projet est lié au repository GitHub `maxlamenace33-del/Metrik` et supporte à la fois le déploiement automatique par commit et le déploiement instantané via la CLI Vercel (`--prebuilt`).

### 1. Variables d'Environnement Configurées sur Vercel
Dans le dashboard Vercel (**Settings** > **Environment Variables**) :
- `NEXT_PUBLIC_SUPABASE_URL` : `https://oamtnjveskdtyekizavo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : votre clé publique Supabase (`sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` : votre clé secrète Supabase (`sb_secret_...`)
- `NEXT_PUBLIC_APP_URL` : `https://metrik-pi.vercel.app`

### 2. Configuration Supabase Auth (URLs de redirection)
Dans le dashboard **Supabase** > **Authentication** > **URL Configuration** :
- **Site URL :** `https://metrik-pi.vercel.app`
- **Redirect URLs :**
  - `https://metrik-pi.vercel.app/**`
  - `http://localhost:3000/**`

### 3. Commandes de Déploiement CLI
Pour un déploiement ultra-rapide sans dépendre de la file d'attente des serveurs cloud :
```bash
# 1. Compilation locale optimisée Next.js (Turbopack, ~1s)
npx vercel build --prod

# 2. Envoi direct des fichiers pré-compilés sur le CDN Vercel (~5s)
npx vercel deploy --prebuilt --prod
```


---

## 🗄 Mise en Place de la Base de Données

Le schéma PostgreSQL inclut :
1. **Tables :** `profiles`, `weight_logs`, `sports`, `activities`, `meal_logs`.
2. **Triggers intelligents :**
   - Création automatique du profil lors de l'inscription (`handle_new_user`).
   - Synchronisation automatique et instantanée du `profiles.current_weight_kg` lors de l'ajout ou la modification d'une pesée.
3. **Sécurité RLS (Row Level Security) :** Isolation stricte des données par `auth.uid()`.
4. **Bucket Storage :** `activity-images` configuré avec politique d'écriture réservée au propriétaire `${auth.uid()}/*`.
5. **Référentiel Seeds :** Sports pré-configurés (Padel, Tennis, Football, Five, Course à pied, Basketball, Natation) avec leurs valeurs METs officielles (Faible, Moyen, Élevé).

Consultez **[DATABASE.md](./DATABASE.md)** pour le script SQL complet.

---

## 📐 Conventions de Développement

### Commits & Git Flow
Nous appliquons la spécification [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat(activities): add realtime METs calculator to activity modal`
- `fix(weight): prevent negative weight values in zod schema`
- `perf(dashboard): optimize moving average calculation with memoization`
- `style(ui): align dark mode borders with new color palette`
- `docs: update DATABASE.md with new storage policies`

### Règles de Code
- **Typage Strict :** Zéro `any`. Les types Supabase générés (`types/database.types.ts`) sont utilisés pour tous les retours de requêtes.
- **Server Actions :** Toute mutation utilise Zod pour la validation d'entrée et retourne une structure standardisée `{ success: boolean, data?: T, error?: string }`.
- **Imports Aliasés :** Utilisation systématique du préfixe `@/` (ex. `@/components/...`, `@/lib/...`).

---

## 🗺 Roadmap d'Implémentation

```mermaid
flowchart LR
    P1[Phase 1: Setup & DB] --> P2[Phase 2: Auth & Profil]
    P2 --> P3[Phase 3: Activités & Feed]
    P3 --> P4[Phase 4: Dashboard & Data-Viz]
    P4 --> P5[Phase 5: Nutrition & Polish]
```

### Phase 1 : Initialisation, Setup Stack & Base de données
- [x] Spécifications Produit & Architecture (PRD, ARCHITECTURE, DATABASE, README)
- [x] Initialisation du projet Next.js avec Tailwind CSS, shadcn/ui et Lucide Icons
- [x] Exécution du script SQL complet dans Supabase (Tables, Triggers, RLS, Storage)
- [x] Configuration de `@supabase/ssr` (`client.ts`, `server.ts`, `middleware.ts`, `proxy.ts`)

### Phase 2 : Auth & Onboarding Profil / BMR
- [x] Pages `/login` et `/register` avec support Email/Mot de passe et Magic Link
- [x] Page de profil & formulaire d'onboarding (Taille, Sexe, Date de naissance, Niveau d'activité)
- [x] Implémentation de la bibliothèque de calculs purs (`bmr.ts`, formule Mifflin-St Jeor & TDEE)

### Phase 3 : Module Activités Sportives & Feed Style Airbnb
- [x] Référentiel des sports et formulaire modal de création d'activité
- [x] Calculateur dynamique de calories METs en temps réel ($\pm 10\%$)
- [x] Composant d'upload d'image vers Supabase Storage (`activity-images`) avec compression WebP
- [x] Feed horizontal style Airbnb avec cards personnalisées et badge d'intensité

### Phase 4 : Dashboard Analytics & Data-Visualisation
- [x] Cartes KPIs (Dernier poids, variation 7j, bilan calorique, consistance mensuelle)
- [x] Graphique de poids Recharts avec courbe de moyenne mobile lissée sur 7 jours
- [x] Composant Heatmap de consistance sportive style GitHub (52 semaines)
- [x] Modal de pesée rapide en 1 clic

### Phase 5 : Journal Nutrition Simplifié & Équilibre Énergétique
- [x] Journal de repas rapide (Petit-déjeuner, Déjeuner, Dîner, Snack) avec estimation libre
- [x] Jauge de balance énergétique journalière (TDEE + Sport vs Calories ingérées)
- [x] Bar chart hebdomadaire comparatif dépenses vs apports
- [x] Déploiement en production sur Vercel (`https://metrik-pi.vercel.app`)

### Évolutions & Améliorations Futures
- [ ] Préparation PWA (manifest, installation écran d'accueil iOS/Android, icônes mobiles)
- [ ] Export complet des données utilisateur en CSV / JSON (pesées, activités, repas)
- [ ] Presets et raccourcis de repas fréquents (Open Food Facts / suggestions rapides)

