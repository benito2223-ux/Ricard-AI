# 🤖 Ricard AI — L'IA de la famille

> Assistant IA multi-profils pour toute la famille, installable comme app (PWA), conçu pour les parents et les enfants.

**🌐 Live :** [ricard-ai.surge.sh](https://ricard-ai.surge.sh)  
**📱 PWA :** Installable sur iPhone, Android & desktop  
**🔒 Version :** 1.16

---

## ✨ Fonctionnalités

### 👨‍👩‍👧 Multi-profils famille
- 4 profils : **Papa**, **Maman**, **Zya** (13 ans), **Zélie** (9 ans)
- Conversations, budgets et historiques séparés par profil
- Sélecteur de profil punk avec stats budget mensuel

### 🤖 IA puissante (OpenRouter)
- Accès à **200+ modèles** : Claude, GPT-4o, Gemini, Llama, Mistral…
- Streaming SSE sur desktop, JSON sur mobile/iOS
- Mode comparaison ⚡ : deux modèles en parallèle sur la même question
- Condensation automatique des longues conversations

### 👧 Onglets personnalisés enfants
- **Zya → Nova** : IA dédiée 13 ans, modes Devoirs / Fun, mode Socratique
- **Zélie → Pixel** : IA dédiée 9 ans, modes Jeu / Devoirs, suggestions adaptées
- Filtre de contenu pour enfants intégré

### 🔐 Sécurité famille (Sprint 1 · v1.14)
- **Code portail famille** : écran de verrouillage punk au lancement sur tout nouvel appareil
- **Code PIN par profil** : Papa/Maman protègent tous les profils, les filles leur profil uniquement
- **Auto-lock** sur inactivité (5 → 60 min configurable)
- Firebase hardcodé dans le fichier = zéro config sur les nouveaux appareils

### 👨‍👩‍👧 Contrôle parental (Sprint 2 · v1.15)
- **Plages horaires** : Zya et Zélie bloquées hors créneau défini par les parents
- **Alertes budget** : toast automatique à 80% et 100% du budget mensuel
- **Messages du jour** : compteur visible sur chaque carte profil
- **Message de bienvenue** : animation punk à chaque connexion
- **Changer de profil** : bouton avatar dans le header desktop

### 🎮 Gamification (Sprint 3 · v1.16)
- **Streaks** 🔥 : compteur de jours consécutifs par profil
- **Rangs XP** ⭐ : 5 niveaux (🌱 Graine → 🚀 Maître) basés sur les messages envoyés
- **Toasts milestones** : félicitations automatiques aux paliers de streak et level-up de rang
- **Objectif du jour** 🎯 : parents définissent un objectif visible en bannière dans les onglets enfants
- **Dashboard famille** 📊 : cards profil avec streaks, rangs, barres XP, classement semaine

### 🎨 Illustrations IA (Sprint 4 · v1.17)
- **Bouton 🎨** dans chaque chat : active le mode illustration
- **5 modèles d'images** : DALL·E 3, DALL·E 2, Flux 1.1 Pro, Flux Schnell, SDXL
- **Génération inline** : l'image apparaît directement dans la conversation
- **Actions** : télécharger ⬇, copier URL 🔗, ouvrir en plein écran 🔍
- **Sélecteur de modèle** image à la volée dans l'input
- **Configurable** dans Réglages → 🎨 Illustrations

### ☁️ Sync & Sauvegarde
- **Firebase Firestore** : sync automatique entre appareils (conversations + messages famille)
- **Family ID** : identifiant unique famille pour isoler les données
- **Export/Import JSON** : sauvegarde manuelle complète
- Fallback `localStorage` si Firebase non configuré

### 🎨 Design System Punk Comics Fluo
- Inspiré du film *Les Mitchell contre les Machines*
- Polices : **Permanent Marker** (titres) + **Share Tech Mono** (corps)
- Palette : jaune acide, orange marqueur, cyan néon, noir encre
- Ombres dures "comics", border-radius asymétriques, animations `steps()`

### 🛠️ Autres fonctionnalités
- **Mode sombre** 🌙 toggle
- **Recherche** 🔍 full-text dans toutes les conversations
- **Artefacts** : preview HTML/SVG inline + export
- **Voice input** 🎤 (Web Speech API)
- **Text-to-speech** 🔊
- **Résumé automatique** 🗜 des longues conversations
- **Mode socratique** 🎓 pour guider sans donner la réponse directement
- **Limites quotidiennes** et **budgets mensuels** par profil
- **Épinglage** de conversations importantes

---

## 🚀 Installation & Configuration

### 1. Cloner et déployer
```bash
git clone https://github.com/benito2223-ux/Ricard-AI.git
cd Ricard-AI
# Déposer sur Surge, Netlify, GitHub Pages ou ouvrir index.html directement
surge --domain mon-domaine.surge.sh
```

### 2. Clé API OpenRouter
1. Créer un compte sur [openrouter.ai](https://openrouter.ai)
2. Générer une clé API dans [openrouter.ai/keys](https://openrouter.ai/keys)
3. Dans l'app : ⚙️ Réglages → Clé API

### 3. Firebase (optionnel — sync multi-appareils)

**Option A — Hardcodée (recommandé pour la famille)**  
Éditer `index.html` ligne ~145 :
```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "xxx.firebaseapp.com",
  projectId: "xxx",
  storageBucket: "xxx.appspot.com",
  messagingSenderId: "123456",
  appId: "1:123:web:abc"
};

const FAMILY_ID_HARDCODED = "votre-uuid-famille"; // uuidgenerator.net
```
Puis re-déployer. Tous les appareils se configurent automatiquement.

**Option B — Manuelle**  
⚙️ Réglages → ☁️ Sync & Sauvegarde → coller la config Firebase.

**Règles Firestore minimales :**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Sécurité famille
⚙️ Réglages → 🔐 Sécurité :
- **Code portail** : 4 chiffres → bloque les nouveaux appareils jusqu'à saisie
- **Codes profil** : 4 chiffres par membre → PIN demandé à la sélection
- **Auto-lock** : verrouillage automatique après inactivité

### 5. Contrôle parental
⚙️ Réglages :
- **⏰ Plages horaires** : définir les créneaux d'accès pour Zya et Zélie
- **🎯 Objectifs du jour** : message visible en bannière dans leurs onglets
- **💰 Budget mensuel** : montant max par profil
- **⏱ Limites quotidiennes** : nombre max de messages par jour

---

## 🗂️ Architecture

```
index.html          # App complète (React 18 + Babel standalone, ~3500 lignes)
sw.js               # Service Worker minimal — PWA installable
manifest.json       # PWA manifest
icon.svg            # Icône app
```

### Stack technique
| Couche | Technologie |
|--------|-------------|
| UI | React 18 (CDN Babel standalone) |
| État | `useReducer` + `useContext` |
| Storage | `localStorage` + LZ-String compression |
| Cloud | Firebase Firestore compat SDK |
| IA | OpenRouter API (SSE streaming) |
| Voix | Web Speech API |
| PWA | Service Worker + manifest |
| Style | CSS-in-JS (inline styles) + CSS `:root` tokens |

### Design Tokens (extrait)
```css
--pc-color-yellow: #E5FF00;   /* Jaune acide */
--pc-color-orange: #FF6B00;   /* Orange marqueur */
--pc-color-cyan:   #00F0FF;   /* Cyan néon */
--pc-color-black:  #111111;   /* Noir encre */
--pc-font-display: 'Permanent Marker', cursive;
--pc-font-body:    'Share Tech Mono', monospace;
--pc-shadow:       5px 5px 0px #111111;
```

---

## 🗺️ Roadmap

| Sprint | Statut | Contenu |
|--------|--------|---------|
| Sprint 1 | ✅ v1.14 | Sécurité : portail famille, codes PIN, auto-lock, Firebase hardcodé |
| Sprint 2 | ✅ v1.15 | Contrôle parental : plages horaires, alertes budget, bienvenue, stats |
| Sprint 3 | ✅ v1.16 | Gamification : streaks, rangs XP, objectifs du jour, dashboard famille |
| Sprint 4 | ✅ v1.17 | Illustrations IA : génération d'images, 5 modèles, visualisation inline |
| Sprint 5 | 🔜 | — |

---

## 📝 Licence

Usage personnel / familial — non destiné à la distribution commerciale.

---

*Fait avec ❤️ et beaucoup de café ☕ · Ricard AI v1.17*
