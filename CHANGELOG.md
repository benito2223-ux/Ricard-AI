# Changelog — Ricard AI

Toutes les modifications notables de ce projet sont documentées ici.  
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.16] — 2026-05-09 · Sprint 3 — Gamification & Objectifs

### Ajouté
- **Streaks journaliers** 🔥 : compteur de jours consécutifs par profil, mis à jour à chaque connexion
- **Système de rang XP** ⭐ : 5 niveaux (🌱 Graine → ⚡ Étincelle → 🌟 Nova → 🔥 Soleil → 🚀 Maître) basés sur le total de messages envoyés
- **Barre de progression XP** vers le rang suivant dans le Dashboard famille
- **Toasts milestone streak** automatiques aux paliers 3, 7, 14, 30, 60, 100 jours (une seule notification par palier, mémorisée)
- **Toast level-up de rang** : notification automatique à chaque nouveau rang débloqué
- **Objectif du jour** 🎯 : Réglages → 🎯 Objectifs du jour — champ texte pour Zya et Zélie
- **Bannière objectif** : s'affiche en haut de l'onglet Zya (violet) et Zélie (rose) quand un objectif est défini
- **Dashboard famille** 📊 : second onglet dans FamilyTab avec :
  - Cards profil (streak, rang, barre XP, messages cette semaine)
  - Section "Objectifs en cours" listant les objectifs actifs
  - Classement semaine avec podium 🥇🥈🥉 et barres visuelles de comparaison
- **Streak + rang** visibles sur les cartes du sélecteur de profils
- **Streak + rang** visibles dans le sous-titre du header Zya et Zélie
- Helpers : `getStreak()`, `updateStreak()`, `getXP()`, `getRank()`, constante `RANKS`

### Modifié
- `loadSettings()` : nouveau champ `dailyGoals: { zya:'', zelie:'' }`
- `buildState()` : appel `updateStreak(pid)` à chaque connexion profil
- `ZyaTab` : affichage streak + rang dans le header + bannière objectif
- `ZelieTab` : affichage streak + rang dans le header + bannière objectif
- `FamilyTab` : refonte avec onglet Messages / Dashboard

### Technique
- Version : `1.16` — SW cache : `ricard-ai-v16`

---

## [1.15] — 2026-05-09 · Sprint 2 — Contrôle parental & Expérience

### Ajouté
- **Plages horaires** ⏰ par enfant (Zya, Zélie) : configurable dans Réglages → ⏰ Plages horaires
  - Overlay punk de blocage sur la carte profil hors créneau (auto-fermeture 3,5s)
  - Parents jamais bloqués
- **Système de toasts** 🔔 : notifications en bas à droite, empilables, cliquables pour fermer
  - `SHOW_TOAST` / `DISMISS_TOAST` dans le reducer
  - Auto-dismiss configurable par durée
- **Alertes budget automatiques** 💰 :
  - 80% → toast orange (une seule fois par mois, mémorisé)
  - 100% → toast rouge (une seule fois par mois, mémorisé)
- **Compteur "messages aujourd'hui"** 📊 sur chaque carte profil dans ProfileSelector
- **Message de bienvenue** 👋 : overlay animé (scale + fade, auto-dismiss 2,5s) à chaque connexion profil
  - Messages variés selon le moment de la journée (matin/après-midi/soir/nuit)
  - Action : `DISMISS_WELCOME` dans le reducer
- **Bouton "Changer de profil"** 👤 dans le header de chat desktop : badge avatar coloré + nom du profil actif

### Modifié
- `loadSettings()` : nouveau champ `accessHours: { zya, zelie }` avec `enabled`, `start`, `end`
- `sendMessage` : vérification budget avec toasts après chaque message
- `buildState()` : champs `toasts: [], welcome: pid`
- `ProfileSelector` : intégration vérification horaires + état local `blocked`
- Helpers : `isInAccessHours()`, `getWelcomeMsg()`

### Technique
- Version : `1.15` — SW cache : `ricard-ai-v15`

---

## [1.14] — 2026-05-09 · Sprint 1 — Sécurité famille complète

### Ajouté
- **Constantes développeur** dans le module cloud :
  - `FIREBASE_CONFIG` : config Firebase hardcodée — tous les appareils se configurent automatiquement
  - `FAMILY_ID_HARDCODED` : ID famille figé — plus de divergence entre appareils
- **Portail famille** 🔒 : écran plein écran punk au lancement sur tout nouvel appareil
  - Code 4 chiffres configurable dans Réglages → 🔐 Sécurité → Code portail famille
  - Autorisation de l'appareil stockée en `localStorage` (`ricard_device_auth`)
  - Lien d'aide "Je ne connais pas le code"
  - Changer le code invalide toutes les autorisations existantes
- **Codes PIN par profil** : Papa, Maman, Zya, Zélie ont chacun leur propre code
  - Parents : accèdent à tous les profils
  - Enfants : uniquement au leur
  - Migration automatique : `adminPin` → `profileCodes.papa` et `profileCodes.maman`
- **Auto-lock** ⏱ sur inactivité : retour ProfileSelector après N minutes sans activité (5/10/20/30/60 min ou désactivé)
- **Icône 🔒** sur toutes les cartes profil protégées (pas seulement les adultes)
- Section **🔐 Sécurité** dans les Réglages remplaçant l'ancien "Code PIN — Profils adultes"
- Reducer : actions `SHOW_FAMILY_GATE`, `HIDE_FAMILY_GATE`
- Composant `FamilyGate` : numpad punk avec shake animation sur code erroné

### Modifié
- `loadSettings()` : nouveaux champs `profileCodes`, `appCode`, `autoLockMinutes`
- `PinEntry` : vérifie `profileCodes[pid]` en priorité, fallback `adminPin`
- `ProfileSelector` click handler : gate tous les profils avec code (pas seulement admin)
- Auto-init Firebase : essaie `FIREBASE_CONFIG` en premier, puis config sauvegardée
- `getFamilyId()` : utilise `FAMILY_ID_HARDCODED` si défini

### Technique
- Version : `1.14` — SW cache : `ricard-ai-v14`

---

## [1.13] — 2026-05-08 · Design System Punk Comics Fluo (Mitchell)

### Ajouté
- Tokens CSS `:root` complets (couleurs, typo, ombres, radius)
- Polices Google : `Permanent Marker` (display) + `Share Tech Mono` (body)
- Palette : jaune acide `#E5FF00`, orange `#FF6B00`, cyan `#00F0FF`, fuchsia `#FF0099`
- Ombres dures "comics" : `5px 5px 0px #111111`
- Border-radius asymétriques : `--pc-radius-1`, `--pc-radius-2`, `--pc-radius-3`
- Design System documenté dans `design_system/` (tokens, prompts AI, manifest assets)
- Animations `steps()` sur les boutons et interactions

### Modifié
- Tous les composants majeurs mis à jour : ProfileSelector, ChatHeader, Settings, PinEntry, ModelPicker, Sidebar, boutons, cards…
- `body` : `font-family: var(--pc-font-body)`, `background: var(--pc-color-paper)`
- Responsive mobile : `font-size: 18px`, `min-height/width: 44px` sur les boutons

### Technique
- Version : `1.13` — SW cache : `ricard-ai-v13`

---

## [1.12] — 2026-05-07 · Augmentation des tailles de police

### Modifié
- Tailles de police augmentées sur PC et mobile dans tous les composants
- Meilleure lisibilité générale

### Technique
- Version : `1.12`

---

## [1.11] — 2026-05-06 · Fix ModelSlot + Compare mobile

### Corrigé
- Scroll cassé dans la liste de modèles en mode comparaison (recherche partielle)
- Mode comparaison inaccessible sur mobile : retiré le guard `!isMobile`
- `CompareModal` redesigné plein écran sur mobile
- `ModelSlot` : dropdown remplacé par liste inline expansible avec scroll iOS

### Technique
- Version : `1.11`

---

## [1.10] — 2026-05-05 · Ergonomie mobile & persistance

### Ajouté
- Support iPhone notch/safe area : `env(safe-area-inset-top/bottom)` sur ChatHeader et ProfileSelector
- Unités `dvh` pour la hauteur viewport mobile
- Persistance immédiate de la clé API : sauvegarde séparée `apikey_backup` à chaque frappe

### Corrigé
- Boutons burger et config cachés sous la barre de statut iOS
- Interface trop petite sur téléphone
- Clé API perdue sur iOS après rotation/reload

### Technique
- Version : `1.10`

---

## [1.9] — 2026-05-04 · Modèles par défaut live OpenRouter

### Ajouté
- Liste de modèles live depuis l'API OpenRouter (mise à jour automatique)
- Cache partagé de la liste des modèles (TTL 1h)
- Modèles par défaut configurables par onglet dans les Réglages
- Indicateur de statut chargement modèles dans Settings

### Technique
- Version : `1.9`

---

## [1.8] — 2026-05-03 · Compare modal avec recherche

### Ajouté
- `CompareModal` : comparaison de deux modèles sur la même question
- Recherche de modèles dans le picker de comparaison
- Live models depuis OpenRouter dans le picker

---

## [1.7] — 2026-04-30 · Refonte majeure (base stable)

### Ajouté
- Voice input (Web Speech API)
- Mode sombre + toggle
- Compression LZ-String pour localStorage
- Messagerie famille (onglet Famille)
- Mode comparaison de modèles
- Recherche full-text dans les conversations
- Épinglage de conversations
- Mode socratique (Zya, Zélie)
- Limites quotidiennes par profil
- Mémoire / instructions personnalisées par profil
- Digest hebdomadaire dans le Dashboard
- Résumé automatique des longues conversations
- Code PIN admin (Papa/Maman)

---

## [1.0–1.6] — 2026-04 · Versions initiales

- Architecture React 18 + Babel standalone (single HTML file)
- 4 profils famille avec budgets mensuels
- Intégration OpenRouter API (streaming SSE)
- Firebase Firestore sync (conversations)
- Service Worker PWA
- Onglets Chat, Code, Design, Zya, Zélie, Famille
- Dashboard avec stats de coût
- Export/Import JSON

---

*Ricard AI — Fait avec ❤️ pour la famille*
