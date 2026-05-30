# Changelog — Ricard AI

Toutes les modifications notables de ce projet sont documentées ici.  
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.36] — 2026-05-30 · Revue de code + corrections de bugs

### Corrigé
- **Mode socratique non câblé** : la variable `socratic` calculée dans ZyaTab/ZelieTab (auto en mode Devoirs/Étude) n'était jamais transmise à `sendMessage` — c'était du code mort. Le mode socratique automatique annoncé en v1.34 **ne fonctionnait pas** (il dépendait encore de l'ancien toggle dans Réglages).
  - `socratic` est maintenant propagé : onglet enfant → `InputArea` → `sendMessage`
  - `sendMessage` accepte un paramètre `socratic` ; s'il est fourni (onglets enfants) il prime, sinon repli sur `state.settings.socraticMode`
  - Résultat : Nova est socratique en mode Devoirs (Zya), Pixel en mode Devoirs (Zélie), désactivé en Fun/Jeu
- **Doublon `<Dashboard />`** dans `Layout` : le composant Dashboard était rendu deux fois quand il était ouvert (deux overlays superposés) — doublon supprimé

### Technique
- Validation : compilation Babel du script complet vérifiée sans erreur (`BABEL_OK`)
- Note : le toggle « Mode socratique » dans Réglages est désormais ignoré pour les onglets enfants (comportement automatique) — il pourra être retiré dans une prochaine version
- Version : `1.36` — SW cache : `ricard-ai-v36`

---

## [1.35] — 2026-05-13 · Mic toujours visible + actions messages simplifiées pour les enfants

### Corrigé
- **Micro Zélie (Android)** : le bouton mic était masqué si `voiceSupported === false` — désormais toujours affiché sur mobile ; si la reconnaissance vocale n'est pas disponible, une alerte invite à utiliser Chrome
- **Actions messages enfants** : sur mobile, `onMouseEnter` déclenchait au tap → toutes les actions adultes (PDF, .md, récap WhatsApp, mémoire, régénérer) s'affichaient et débordaient de l'écran
  - Les profils Zya/Zélie n'affichent plus que le bouton **Copier** sur le tap d'un message
  - Les adultes (Michel/Sandra) conservent la suite complète d'actions

### Modifié
- **Menu (+) enfants** : option "🎨 Générer une illustration" masquée pour Zya et Zélie (adultes uniquement)

### Technique
- Version : `1.35` — SW cache : `ricard-ai-v35`

---

## [1.34] — 2026-05-13 · Nouvelle conv visible + modèle caché + socratique auto

### Ajouté
- **Bouton + Nouvelle conversation** toujours visible dans les onglets Zya et Zélie (cercle coloré en haut à droite) — résout le problème d'accessibilité Android où le bouton n'apparaissait pas

### Modifié
- **Sélecteur de modèle** masqué dans la zone de texte des profils enfants (Zya/Zélie) — réduit les clics accidentels
- **Mode Socratique automatique** : plus de bouton toggle
  - Zya : activé automatiquement en mode « Étude », désactivé en « Fun »
  - Zélie : activé automatiquement en mode « Devoirs », désactivé en « Fun » / « Jeu »

### Technique
- Version : `1.34` — SW cache : `ricard-ai-v34`

---

## [1.33] — 2026-05-13 · Fix définitif iPhone 16 safe-area

### Corrigé
- **Safe-area iPhone 16 (3e tentative — définitive)** : approche triple couche
  1. Classe CSS `.ios-top-spacer { height: env(safe-area-inset-top, 0px) }` insérée comme premier enfant du Layout mobile — méthode recommandée par Apple
  2. `paddingTop` fixe à `80px` pour `ProfileSelector` et `PersonalizedSplash` sur mobile (évite la dépendance à `env()` qui peut retourner 0)
  3. `paddingBottom` réduit à `max(24px, env(safe-area-inset-bottom) + 8px)`

### Technique
- Version : `1.33` — SW cache : `ricard-ai-v33`

---

## [1.32] — 2026-05-13 · Fix sélection de profil + safe-area v2

### Corrigé
- **Boucle de connexion "Changer de profil"** (fix définitif) : suppression complète de l'auto-login dans `ProfileSelector` — la composante est désormais un sélecteur pur sans `useEffect`
  - Le flux d'entrée passe exclusivement par `PersonalizedSplash`
  - `ProfileSelector` s'affiche quand aucun profil par défaut n'est configuré, ou après `onChangeProfile()`
  - `<PinEntry />` ajouté aux côtés de `ProfileSelector` (absent précédemment → PIN inutilisable)
- **Safe-area iPhone 16 (2e tentative)** : `max(60px, calc(env(safe-area-inset-top, 0px) + 16px))`

### Technique
- Version : `1.32` — SW cache : `ricard-ai-v32`

---

## [1.31] — 2026-05-13 · Fix navigation profil + safe-area v1

### Corrigé
- **Boucle "Changer de profil"** (1re tentative) : prop `skipAutoLogin` ajoutée à `ProfileSelector` pour court-circuiter le `useEffect` d'auto-login
- **Safe-area iPhone 16 (1re tentative)** : `calc(env(safe-area-inset-top, 44px) + 32px)` pour les zones sensibles

### Technique
- Version : `1.31` — SW cache : `ricard-ai-v31`

---

## [1.30] — 2026-05-13 · Humeur du jour + fixes UX critiques

### Ajouté
- **🌡️ Humeur du jour** pour Zya et Zélie : sélecteur 5 émojis affiché chaque matin (🤩 Génial · 😊 Bien · 😐 Bof · 😔 Pas top · 😤 Grognon)
  - Stocké par date en localStorage (`mood_{pid}_{date}`)
  - Disparaît une fois choisi, revient le lendemain automatiquement
  - L'humeur choisie s'affiche en mini-emoji dans l'en-tête (à côté du streak)
- **Injection humeur dans le system prompt** : Nova et Pixel adaptent leur ton si l'humeur est basse (plus doux, plus encourageants)
- **Vue humeurs dans Famille → Suivi** : Papa/Maman voient en temps réel l'humeur du jour de chaque enfant
- Composant `MoodPicker` + helpers `getMoodToday()` / `setMoodToday()` / constante `MOODS`

### Modifié
- **Avatar splash agrandi** : 140 → 180px mobile, 180 → 220px desktop
- **Bouton Profil supprimé** du menu latéral mobile (la sélection se fait dans Réglages → 📱 Cet appareil)
- **En-têtes ZyaTab/ZelieTab compacts** sur mobile : icônes seules, labels texte visibles uniquement sur desktop
- **Fix critique InputArea** : `paddingBottom: max(10px, env(safe-area-inset-bottom) + 6px)` — zone de texte toujours accessible sur iPhone
- **Zone vide scrollable** sur les onglets enfants : `overflowY:auto` + `justifyContent:flex-start` — plus de débordement sur petits écrans

### Technique
- Version : `1.30` — SW cache : `ricard-ai-v30`

---

## [1.29] — 2026-05-13 · Splash personnalisé au démarrage

### Ajouté
- **Composant `PersonalizedSplash`** : page d'accueil plein écran affichée si un profil par défaut est configuré sur l'appareil
  - Fond dégradé aux couleurs du profil (haut 50% + bas 30%)
  - Grand avatar centré (140px mobile / 180px desktop) avec badge rang en surimpression
  - Nom en Permanent Marker 52–66px avec ombre colorée
  - Badges streak 🔥 et rang si actifs
  - Bloc objectif du jour si défini
  - Barre budget mensuel
  - Message de blocage horaire si hors plage
  - Bouton "C'est parti 🚀" punk avec couleur du profil + animation hover
  - Lien "Changer de profil" discret en bas
- **`App()` mis à jour** : lit `ricard_default_profile` au démarrage, affiche `PersonalizedSplash` si trouvé, sinon `ProfileSelector`
- **`forceSelector` state** dans `App` pour permettre le changement de profil depuis le splash

### Technique
- Version : `1.29` — SW cache : `ricard-ai-v29`

---

## [1.28] — 2026-05-13 · Profil par défaut par appareil + InputArea redesign mobile

### Ajouté
- **Option "Profil par défaut"** dans Réglages → 📱 Cet appareil : chaque device choisit son profil (stocké en localStorage hors `SHARED_SETTINGS_KEYS`, donc non synchronisé entre appareils)
- **Auto-login au démarrage** : `ProfileSelector` lit `ricard_default_profile` et dispatch `SET_PROFILE` automatiquement via `useEffect` sur mount
- **Bouton 📷 Appareil photo** sur mobile : `capture="environment"` sur un input caché dédié (`cameraRef`), réutilise `handleFiles`
- **Menu (+) sur mobile** : remplace les boutons classiques par un bouton circulaire `+` qui ouvre un menu positionné au-dessus avec : 📷 Prendre une photo · 📎 Joindre un fichier · 🎨 Générer une illustration
- Badge rouge sur le `+` si des pièces jointes sont déjà attachées

### Modifié
- `InputArea` : sur mobile, seuls 🎤 Mic + (+) Menu sont visibles — InputArea plus aérée
- `Settings` : nouvelle section 📱 Cet appareil avec dropdown profil par défaut
- `ProfileSelector` : `useEffect` d'auto-login monté après tous les hooks

### Technique
- Version : `1.28` — SW cache : `ricard-ai-v28`

---

## [1.27] — 2026-05-12 · Corrections layout mobile & avatars compacts

### Modifié
- **Cartes Zya/Zélie compactes** dans `ProfileSelector` sur mobile : avatar 56px, font 18px, une seule rangée de badges (âge + streak + rang)
- **ProfileSelector scrollable** : `overflowY:'auto'` + `justifyContent: isMobile ? 'flex-start' : 'center'` + `paddingBottom:32px`
- Toutes les cartes profil visibles sans scroll forcé même sur petit écran

### Technique
- Version : `1.27` — SW cache : `ricard-ai-v27`

---

## [1.26] — 2026-05-12 · PWA fullscreen + icônes natives iOS/Android

### Ajouté
- **Script Python `make_icons.py`** : génère icon-192.png, icon-512.png, icon-180.png, icon-167.png, icon-152.png, favicon.png depuis `Logo_Ricard_AI.png` avec Pillow (crop carré centré + resize LANCZOS)
- **`apple-touch-icon`** 180px dans `<head>` pour iOS
- **`apple-touch-icon`** 152px (iPad) et 167px (iPad Pro) dans `<head>`
- **`<link rel="icon">`** pointant sur favicon.png (48px)

### Modifié
- `manifest.json` : chaque icône a désormais **deux entrées séparées** `purpose:"any"` et `purpose:"maskable"` (fini le combined `"any maskable"` rejeté par certains parseurs)
- Résout le bug "l'app ne s'affiche plus en plein écran / barre d'adresse visible après réinstallation"

### Technique
- Version : `1.26` — SW cache : `ricard-ai-v26`

---

## [1.25] — 2026-05-12 · Avatars photo par profil

### Ajouté
- **Script Python `resize_avatars.py`** : crop carré + resize 200×200 + JPEG quality 82 → ~17 KB par avatar (source 2.5 MB PNG)
- **Avatars photo** intégrés : Avatar_Benjamin.jpg, Avatar_Chloe.jpg, Avatar_Zya.jpg, Avatar_Zelie.jpg
- Champ `avatar` dans chaque entrée `PROFILES` (`Avatar_Prenom.jpg`)
- Composant `ProfileAvatar` : priorité à l'image `<img>` si `profile.avatar` défini, fallback sur le cercle coloré initiale

### Technique
- Version : `1.25` — SW cache : `ricard-ai-v25`

---

## [1.24] — 2026-05-12 · Sprint 6 — 7 fonctionnalités avancées

### Ajouté
- **📌 Mémoire persistante** : bouton dans les actions de message pour sauvegarder un résumé dans `profileContext` (Réglages → Mémoire). Modal de confirmation avec aperçu.
- **👁️ Vue parents** dans FamilyTab : onglet "Suivi" (admin uniquement) — lecture seule des conversations récentes de Zya et Zélie avec `<details>` dépliables
- **🔊 TTS toujours visible pour Zélie** : bouton lecture audio rose en bas de chaque bulle assistant, sans survol requis
- **📇 Flashcards Zya** : bouton "📇 Fiches" en mode Étude (si messages > 0) — appel OpenRouter JSON, modal flip-cards interactives avec animation CSS `@keyframes flip-in`
- **🎉 Confetti milestones** : animation CSS 70 particules (`@keyframes confetti-fall`) auto-dismiss 4,5s, déclenchée par `SHOW_CONFETTI` / `HIDE_CONFETTI`
- **📋 Résumé WhatsApp** : bouton dans les actions de message — appel OpenRouter non-streamé, 3 bullets copiés dans le presse-papier
- **📄 Export PDF** : `window.open` + `document.write` + `window.print()` — mise en page propre avec styles inline, pas de librairie externe

### Modifié
- `buildState` : `tab` par défaut = `pid` pour Zya/Zélie (route directe vers leur agent)
- `getVisibleTabs` : filtre l'onglet `chat` pour les profils enfants (doublon avec Nova/Pixel)
- `ChatThread` : actions hover enrichies (📌 Mémoire · 📄 PDF · 📋 WA) ; return wrappé dans `<>...</>` (correction page blanche)
- `FamilyTab` : troisième onglet "👁️ Suivi"

### Technique
- Version : `1.24` — SW cache : `ricard-ai-v24`

---

## [1.19] — 2026-05-11 · Suggestions ZelieTab complètes & suppression onglet Chat enfants

### Ajouté
- **Suggestions mode Jeu** pour Zélie : 6 propositions adaptées à 9 ans (histoires, devinettes, contes, dessin de mots, animaux, quiz)
- **Suggestions mode Devoirs** pour Zélie : 6 propositions scolaires CE2/CM (texte, maths, géographie, explication simple, rédaction, pourquoi)

### Modifié
- `getVisibleTabs(pid)` : masque l'onglet `chat` pour `zya` et `zelie` — doublon avec Nova/Pixel
- `buildState` : `tab` initial = `pid` pour les profils enfants (arrive directement sur leur agent)

### Technique
- Version : `1.19` — SW cache : `ricard-ai-v19`

---

## [1.18] — 2026-05-11 · Sprint 5 — Refonte UX Mobile & Sync Firebase complète

### Ajouté
- **Drawer latéral mobile** 📱 : remplace la bottom nav bar — burger ☰ ouvre un panneau glissant depuis la gauche
  - Header profil avec avatar, nom, streak 🔥, rang ⭐
  - Navigation tabs filtrée selon le profil actif
  - Historique des conversations avec bouton "+ Nouveau" et info date/coût
  - Bouton "Changer de profil" en bas du drawer
  - Bouton Recherche et Réglages
  - Affichage du budget mensuel restant
  - Backdrop semi-transparent avec fermeture au tap
- **`getVisibleTabs(pid)`** : filtre les onglets Zya et Zélie — masqués sur les profils parents
- **`OPEN_DRAWER` / `CLOSE_DRAWER`** : reducer actions + état `showMobileDrawer`
- **Firebase sync complète** ☁️ : synchronisation de 11 clés de réglages famille entre appareils
  - `SHARED_SETTINGS_KEYS` : apiKey, modèles, budgets, limites, plages horaires, objectifs, PIN…
  - `cloudSaveConfig()` / `cloudWatchConfig()` : push/watch en temps réel
  - Anti-boucle via signatures JSON (`lastPushedCfg` / `lastReceivedCfg`)
  - Toast "☁️ Réglages famille synchronisés !" au premier chargement sur un nouvel appareil
- **Catalogue image OpenRouter complet** : picker de modèle image depuis l'API live (flag `imageGen` via `architecture.modality`)
- **Suppression conversations** : bouton ✕ hover-reveal dans le sidebar avec confirmation 2 étapes

### Modifié
- `Layout` : suppression du `paddingBottom: 56px`, `<MobileNav>` → `<MobileDrawer>`
- `ChatHeader` burger : `SET_PROFILE null` → `OPEN_DRAWER` (ne déconnecte plus !)
- `Sidebar` desktop : utilise `getVisibleTabs(state.profile)`

### Technique
- Version : `1.18` — SW cache : `ricard-ai-v18`

---

## [1.17] — 2026-05-11 · Sprint 4 — Génération & Visualisation d'Images

### Ajouté
- **Constante `IMAGE_MODELS`** : 5 modèles préconfigurés — DALL·E 3, DALL·E 2, Flux 1.1 Pro, Flux Schnell, SDXL
- **Fonction `generateImage()`** : appel OpenRouter `/api/v1/images/generations` (POST JSON)
- **Champ `defaultImageModel`** dans `loadSettings()` (défaut : `openai/dall-e-3`)
- **Composant `ImageMsgContent`** : affichage inline de l'image générée avec :
  - Spinner pendant la génération
  - Rendu de l'image avec border punk comics
  - Prompt révisé si disponible (DALL·E 3 auto-améliore le prompt)
  - Boutons : ⬇ Télécharger · 🔗 Copier URL · 🔍 Ouvrir dans un onglet
- **Bouton 🎨 dans l'InputArea** : toggle mode illustration/texte
  - Bannière violette quand activé
  - Placeholder adapté au mode
  - Bouton d'envoi change d'aspect (violet + icône 🎨)
  - Sélecteur de modèle image inline (remplace le modèle texte en mode image)
  - Indicateur de génération en cours
- **Action reducer `UPDATE_IMAGE_MSG`** : met à jour le message placeholder avec l'URL de l'image
- **Section Réglages 🎨 Illustrations** : choix du modèle par défaut avec description
- **Masquage des boutons Joindre/Micro** en mode image (non pertinents)

### Technique
- Version : `1.17` — SW cache : `ricard-ai-v17`

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
