# Changelog — Ricard AI

Toutes les modifications notables de ce projet sont documentées ici.  
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.46] — 2026-09-09 · Ergonomie mobile : densité, barres allégées, menu (+) réparé

### Corrigé
- **🚨 Le menu (+) de la barre de saisie était tronqué sur mobile** : il s'ouvrait en
  `position:absolute` à l'intérieur du conteneur de saisie, qui est en `overflow:hidden` — une partie
  des options était donc littéralement coupée et invisible.
  - **Fix** : le menu devient une **feuille remontant du bas** (`position:fixed`, pleine largeur,
    overlay de fermeture, cibles tactiles de 50px). Plus rien ne peut le couper.

### Modifié
- **Conversations plus denses sur mobile** (profils adultes) : police 17→15,5px, interligne 1,65→1,5,
  marge interne des bulles 13/17→10/13px, écart entre messages 12→8px, largeur utile 88→92%.
  Mesuré sur une vraie conversation : **−21,5 % de hauteur à faire défiler** (10072→7903px).
  Les profils enfants (Zya, Zélie) gardent la mise en page aérée d'origine pour la lisibilité.
- **Barre du haut allégée sur mobile** : le sélecteur de modèle y faisait doublon avec celui de la
  barre de saisie, et ⚡ Comparer saturait la ligne (~470px de contenu pour 375px d'écran).
  Les deux sont désormais dans le menu (+). Résultat : `☰ · titre · + · ⚙️`.
- **La barre du haut se rétracte quand on descend** dans une conversation et revient dès qu'on
  remonte (mobile uniquement) : 63px d'écran rendus à la lecture (`useHideOnScroll`).
- **Statistiques par message (tk · $) masquées sur mobile adulte** — bruit visuel en longue
  conversation ; le total reste affiché dans le compteur de dépenses.

### Technique
- Version : `1.46` — SW cache : `ricard-ai-v46`
- Rendu desktop inchangé (vérifié : police 16px, interligne 1,65, padding 20/24, header complet).

---

## [1.45] — 2026-09-09 · Fix sync famille qui écrasait la clé API entre appareils

### Corrigé
- **🚨 Un appareil de la famille pouvait repousser sa clé API périmée sur les autres, sans même
  y toucher.** La synchro Firebase envoyait TOUJOURS l'intégralité des champs partagés
  (`SHARED_SETTINGS_KEYS`) dès qu'un seul réglage changeait localement — donc un appareil qui
  modifiait juste un budget ou un modèle par défaut repoussait au passage sa clé API (potentiellement
  périmée si elle n'avait pas encore reçu la dernière mise à jour) et écrasait celle d'un autre
  appareil, même sans reload. C'était la cause du "la clé change toute seule" observé en debug.
  - **Fix** : chaque appareil ne pousse désormais que les champs **réellement modifiés localement**
    depuis la dernière synchro connue (`lastSyncedShared`, diff champ par champ). Un appareil qui n'a
    jamais retouché `apiKey` ne peut plus l'inclure dans son push, donc plus jamais l'écraser ailleurs.
  - Résultat concret : changer la clé API sur un appareil se propage désormais fiablement à tous les
    autres, même s'ils sont restés ouverts avec l'ancienne valeur en mémoire.

### Technique
- Version : `1.45` — SW cache : `ricard-ai-v45`

---

## [1.44] — 2026-09-09 · Retry automatique sur rate-limit Z.AI

### Ajouté
- **Retry silencieux (jusqu'à 3 tentatives, backoff 1.5s/3s) sur les erreurs de rate-limit/surcharge
  temporaire Z.AI** (HTTP 429, codes d'erreur `1302`/`1305` — voir docs.z.ai/devpack/usage-policy).
  Le plan GLM Coding (surtout le palier Lite) a une concurrence limitée ; utiliser un autre outil sur
  la même clé en parallèle (ex: un harnais de code Z.AI) peut saturer ce quota et faire échouer une
  requête ponctuelle. L'app retente désormais automatiquement au lieu d'afficher une erreur immédiate.
  - `isRateLimitedResp()` détecte le cas ; appliqué au chemin desktop (SSE streaming) et mobile (JSON).
  - Les vraies erreurs (mauvaise clé, modèle invalide...) ne sont pas retentées, affichées immédiatement.

### Technique
- Version : `1.44` — SW cache : `ricard-ai-v44`

---

## [1.43] — 2026-09-09 · Fix persistance du réglage GLM Coding Plan

### Corrigé
- **🚨 La case « GLM Coding Plan » se décochait à chaque rechargement de page.** `loadSettings()`
  reconstruit l'objet settings au démarrage à partir d'une liste blanche de champs (voir v1.42) — le
  nouveau champ `zaiCodingPlan` n'y avait pas été ajouté, donc il était bien sauvegardé en localStorage
  mais silencieusement jeté à chaque reload. L'app repartait alors sur l'endpoint pay-as-you-go avec
  une clé Coding Plan, provoquant selon le moment "Insufficient balance", "overloaded" ou "token expired
  or incorrect" — tous des symptômes du même mismatch endpoint/clé, pas des erreurs de compte.
  - **Fix** : `zaiCodingPlan` ajouté au retour de `loadSettings()`. Vérifié : coché → save → reload → reste coché.

### Technique
- Version : `1.43` — SW cache : `ricard-ai-v43`

---

## [1.42] — 2026-09-09 · Fix "Insufficient balance" GLM Coding Plan

### Corrigé
- **🚨 Clé « GLM Coding Plan » rejetée avec « Insufficient balance or no resource package »** : l'app appelait
  systématiquement l'endpoint pay-as-you-go Z.AI (`/api/paas/v4/chat/completions`). Les clés créées pour un
  abonnement GLM Coding Plan ne fonctionnent que sur `/api/coding/paas/v4/chat/completions` — ce n'était pas
  un problème de clé invalide ou de solde.
  - **Fix** : nouvelle case à cocher dans Réglages → Fournisseur IA — « J'ai un abonnement GLM Coding Plan » —
    qui bascule l'URL vers l'endpoint coding. Réglage `zaiCodingPlan` synchronisé Firebase (famille).

### Technique
- Version : `1.42` — SW cache : `ricard-ai-v42`

---

## [1.40] — 2026-09-08 · Z.AI (GLM) par défaut, OpenRouter en option

### Ajouté
- **⚡ Z.AI (GLM) devient le fournisseur IA par défaut** : l'app appelle désormais `https://api.z.ai/api/paas/v4/chat/completions` (API compatible OpenAI) avec une clé Z.AI. OpenRouter reste disponible en un clic dans les Réglages (bouton ⚡ Z.AI / 🌐 OpenRouter).
- **Catalogue GLM intégré** (11 modèles) dans le sélecteur et les modèles par défaut :
  - Gratuits : `glm-4.7-flash`, `glm-4.5-flash`, `glm-4.6v-flash` (vision)
  - Pas cher : `glm-5.3-flash`, `glm-4.5-air`, `glm-4.7` (défaut), `glm-4.6`
  - Performant : `glm-5.2`, `glm-5.3` · Vision : `glm-4.6v`, `glm-4.5v`
- **Illustrations Z.AI** : CogView-4 (défaut) et GLM-Image via `images/generations` Z.AI. Le catalogue DALL·E/Flux/SDXL reste proposé quand OpenRouter est actif.
- **Détection automatique du fournisseur selon la clé** : une clé `sk-or-v1-…` bascule l'app sur OpenRouter ; tout autre format → Z.AI. Migration invisible pour les appareils existants.
- **Réglage `provider` synchronisé via Firebase** sur tous les appareils de la famille.

### Technique
- Couche `PROVIDERS` (URLs, headers `HTTP-Referer`/`X-Title` OpenRouter uniquement, liens de clés) routée dans tous les appels : chat streaming, comparaison, condensation, résumé WhatsApp, fiches de révision, mémoire familiale auto, génération d'images.
- `sanitizeModelForProvider()` remappe automatiquement les modèles par défaut et les conversations existantes vers un modèle valide du fournisseur actif (aucune conversation cassée).
- La mémoire familiale auto utilise `glm-4.7-flash` (gratuit) sur Z.AI au lieu de `gpt-4o-mini`.
- Version : `1.40` — SW cache : `ricard-ai-v40`

---

## [1.39] — 2026-07-03 · Liste des modèles OpenRouter à jour par défaut

### Corrigé
- **🚨 Liste de modèles figée dans le code** : le sélecteur de modèle (`ModelPicker`) affichait par défaut une liste de 18 modèles écrite en dur (`const MODELS`), non maintenue depuis un moment (encore Claude Sonnet 4.5/4.6, GPT-4o, Gemini 2.5 Pro...). Le vrai catalogue OpenRouter à jour n'était accessible qu'en cliquant manuellement sur un bouton "🌐 Tous les modèles" — la plupart des utilisateurs ne le savaient pas et restaient sur la liste périmée.
  - **Fix** : le `ModelPicker` récupère désormais automatiquement le catalogue OpenRouter en direct (`fetch https://openrouter.ai/api/v1/models`) dès l'ouverture, sans action requise.
  - **Repli** : la liste figée `MODELS` ne sert plus que de secours si l'appel réseau échoue (message d'erreur affiché + mention explicite « repli — OpenRouter injoignable » en bas de la fenêtre).
  - Le bouton "← Sélection" reste disponible pour revenir volontairement à la liste restreinte/curatée si besoin (ex: repères de prix simplifiés par catégorie).
  - Bouton renommé selon le contexte : "🔄 Actualiser" (mode live), "🔄 Réessayer" (après un échec réseau), "🌐 Tous les modèles" (retour manuel au live depuis la sélection curatée).
- Testé en local : ouverture du picker → 343 modèles OpenRouter chargés automatiquement, aucune erreur console.

### Technique
- Version : `1.39` — SW cache : `ricard-ai-v39`

---

## [1.38] — 2026-07-03 · Agenda familial partagé (Google Calendar)

### Ajouté
- **📅 Agenda familial** : nouvel onglet dans Famille → 📅 Agenda, connecté à un agenda Google Calendar unique partagé entre tous les membres de la famille (déplacements pro Papa, RDV Maman, soirées, travaux maison, motocross, gala de danse, entraînements gym...).
  - **8 catégories** avec emoji + couleur Google Calendar dédiée : 🧳 Déplacement pro, 🏥 Rendez-vous, 🍻 Soirée/sortie, 🔨 Travaux maison, 🏍️ Motocross, 💃 Danse/gala, 🤸 Gym, 📌 Autre
  - **Rattachement à un profil** optionnel (Papa/Maman/Zya/Zélie/toute la famille) — avatar affiché sur chaque événement
  - **Événements récurrents hebdomadaires** (entraînements) via case à cocher
  - **Connexion OAuth Google** (Google Identity Services, déjà chargé dans l'app) — scope limité à `calendar.events` + `calendar.readonly`, reconnexion silencieuse tentée au chargement si la session Google est encore active
  - **Lecture pour tous les profils** (les filles voient leur planning gym/danse), **écriture réservée aux parents** (ajout/suppression)
  - Les événements créés apparaissent nativement dans l'app Calendrier de chaque téléphone (notifications fiables iOS/Android, contrairement à des rappels internes à la PWA)
  - **Réglages → 📅 Agenda familial** : champs pour coller l'ID client OAuth + l'ID de l'agenda partagé (config synchronisée famille via Firebase)

### Technique
- Architecture : un seul agenda Google partagé (pas de fusion multi-comptes) — plus simple et fiable
- Nouvelles fonctions : `gInitAuth`, `gRequestToken`, `gEnsureToken`, `gcalListEvents`, `gcalCreateEvent`, `gcalDeleteEvent`, `buildAgendaEventPayload`
- Nouveau composant `AgendaView`, nouvelle constante `AGENDA_CATEGORIES`
- `googleCalendar` ajouté aux settings + `SHARED_SETTINGS_KEYS`
- Testé en local : compilation OK, montage OK, navigation Famille→Agenda et Réglages→Agenda familial vérifiées sans erreur console (état non configuré, avant configuration OAuth réelle)
- Version : `1.38` — SW cache : `ricard-ai-v38`

---

## [1.37] — 2026-07-03 · Mémoire familiale automatique

### Ajouté
- **🧠 Mémoire familiale** : Ricard retient désormais automatiquement les faits durables évoqués en conversation (préférences, événements, contexte de vie, difficultés récurrentes) et les réutilise pour personnaliser ses réponses dans les échanges suivants.
  - **Capture automatique** : après chaque 3ᵉ échange d'une conversation, un modèle léger (`gpt-4o-mini`) extrait 0 à 2 faits nouveaux (JSON, dédupliqué contre les faits déjà connus). Silencieux, non bloquant, activable/désactivable dans Réglages.
  - **Capture manuelle** : le bouton 📌 « Mémoriser » sur un message écrit désormais dans ce même store structuré (au lieu du bloc de texte `profileContext`), chaque souvenir devient individuellement supprimable.
  - **Mémoire par profil** : Papa, Maman, Zya et Zélie ont chacun leur propre mémoire (max 80 entrées, purge FIFO des plus anciennes).
  - **Injection au prompt** : les souvenirs actifs sont ajoutés au system prompt sous `[MÉMOIRE FAMILIALE]` à chaque message.
  - **Réglages → 🧠 Mémoire familiale** : liste consultable/éditable par profil, toggle marche/arrêt de la capture auto, section « 📝 Instructions personnalisées » conservée séparément pour les consignes statiques.
  - **Famille → Suivi (parents)** : carte dédiée montrant les 5 derniers souvenirs de Zya et Zélie — cohérent avec la philosophie de supervision déjà en place (conversations, humeur du jour).
  - Synchronisé entre appareils via Firebase (`familyMemories`, `memoryAutoCapture` ajoutés à `SHARED_SETTINGS_KEYS`).

### Technique
- Nouvelles actions reducer : `ADD_FAMILY_MEMORIES`, `DELETE_FAMILY_MEMORY`
- Nouvelle fonction `extractFamilyMemory()` — extraction JSON via `extractJsonObj()` existant, réutilise le pattern de `summarizeAndShareWA`
- Version : `1.37` — SW cache : `ricard-ai-v37`
- Testé en local : compilation Babel OK, montage React OK, sections Réglages + Suivi vérifiées sans erreur console

---

## [1.36.1] — 2026-07-03 · Hotfix critique : page blanche (Babel CDN)

### Corrigé
- **🚨 Page blanche sur toute la prod** : le CDN `unpkg.com/@babel/standalone/babel.min.js` (sans version figée) a été mis à jour côté unpkg vers **Babel Standalone 8.0.3**, une version majeure incompatible avec le mode d'exécution automatique `<script type="text/babel">` utilisé par l'app. Résultat : le script principal (JSX) n'était plus jamais transformé ni exécuté, silencieusement (aucune erreur console, `#root` restait vide).
  - Cause : dépendance externe non versionnée (`@babel/standalone` sans tag de version → résout vers "latest")
  - Fix : version figée sur `@babel/standalone@7` (dernière v7 stable, `7.29.7` au moment du fix)
  - Diagnostic : confirmé en local — `Babel.version` renvoyait `8.0.3`, `APP_VERSION` n'était jamais défini (le script ne s'exécutait pas), `#root` avait 0 enfant malgré React/ReactDOM correctement chargés
- Aucune régression : ni React (`react@18`) ni React-DOM (`react-dom@18`) n'étaient affectés, seul Babel Standalone était en cause

### Technique
- Version : `1.36.1` — SW cache : `ricard-ai-v36-1`
- Recommandation : figer aussi `react@18` / `react-dom@18` sur une version mineure précise (`react@18.3.1`) pour éviter une régression similaire si une future v19 casse la compatibilité

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
