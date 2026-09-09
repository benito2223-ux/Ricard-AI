# Brief de passation — Ricard AI × Z.AI (GLM) — pour Claude

## Contexte
Ricard AI = PWA familiale mono-fichier (`index.html` ~6 000 lignes, React 18 + Babel standalone, pas de build).
- Repo : https://github.com/benito2223-ux/Ricard-AI (branche `main`)
- Clone local : `C:\Users\Admin\Documents\Michel AI\Ricard-AI`
- Live : https://ricard-ai.surge.sh (déploiement = `npx surge . ricard-ai.surge.sh` depuis le repo)
- SW cache : `sw.js` → constante `CACHE` à bump à chaque release (`ricard-ai-v41` actuellement)
- Version app : `APP_VERSION` dans `index.html` (1.41 actuellement)
- Tout est persisté en localStorage (préfixe `ricard_ai_`, compressé LZ) + sync Firebase optionnelle.

## Objectif initial (fait en v1.40, commit 5b52824)
Basculer le fournisseur IA par défaut d'OpenRouter vers Z.AI (GLM), OpenRouter restant dispo en option.

Ce qui a été fait :
- Bloc `PROVIDERS` dans `index.html` (~ligne 429) : `zai` (défaut, `DEFAULT_PROVIDER`) et `openrouter`.
  Chaque provider expose `chatUrl()`, `imageUrl()`, `keyUrl`, `keyPlaceholder`, `extraHeaders`.
- Catalogue figé `ZAI_MODELS` (11 modèles GLM, dont 3 gratuits : glm-4.7-flash, glm-4.5-flash, glm-4.6v-flash ;
  défaut chat/code/design = `glm-4.7`) + `ZAI_IMAGE_MODELS` (cogview-4, glm-image).
- `DEFAULT_MODELS_BY_PROVIDER` + `sanitizeDefaultModels()` + `sanitizeModelForProvider()` : remappage automatique
  des conversations/défauts existants vers un modèle valide du fournisseur actif (rien ne casse à la bascule).
- `loadSettings()` : nouveau champ `provider`. Détection auto : clé `sk-or-…` → OpenRouter, sinon → Z.AI
  (`guessProviderFromKey()`).
- Tous les appels routés via `getActiveProvider()` : `streamChat()`, `generateImage()`, `extractFamilyMemory()`
  (utilise `glm-4.7-flash` gratuit sur Z.AI), résumé WhatsApp, FlashcardsModal, condensation ChatHeader, CompareModal.
- Settings : sélecteur ⚡ Z.AI / 🌐 OpenRouter ; le champ clé + lien changent selon le fournisseur.
- `provider` ajouté à `SHARED_SETTINGS_KEYS` (sync Firebase famille).
- `useLiveModels()` / ModelPicker / ImageModelPickerModal : sur Z.AI, catalogue figé (pas de listing public),
  pas de bouton « catalogue live » (OpenRouter seulement).
- CHANGELOG.md : entrée [1.40] complète.

## Problème CORS (fix v1.41, commit 8adb0f7)
`api.z.ai` ne renvoie AUCUN header CORS sur le preflight OPTIONS (le POST, lui, en renvoie) → tout fetch
navigateur échoue avec « TypeError: Failed to fetch » → l'app affichait « Connexion impossible. Vérifiez votre clé API ».
Ce n'était PAS un problème de clé.

Fix : proxy Cloudflare Worker, déployé, live :
- URL : `https://ricard-zai-proxy.ricard-ai.workers.dev`
- Code : `worker/index.js` + `worker/wrangler.toml` (compte Cloudflare de Benjamin, login wrangler OK sur cette machine)
- Routage : `POST /zai/api/paas/v4/<chemin>` → `https://api.z.ai/api/paas/v4/<chemin>` (Authorization relayer tel quel,
  streaming SSE préservé, aucun stockage).
- CORS : origines autorisées = `https://ricard-ai.surge.sh` + `http://localhost:<port>` (regex LOCAL_RE).
- Les `PROVIDERS.zai.chatUrl/imageUrl` de `index.html` pointent vers ce proxy.
- Vérifié en navigateur : la requête traverse le proxy et Z.AI répond (avec une clé bidon → 401 « Authentication Failed »,
  preuve que la chaîne réseau est bonne).

## ⚠️ Problème ACTUEL (à traiter)
Avec une vraie clé Z.AI, l'app affiche désormais :
**« Insufficient balance or no resource package. Please recharge »**

= la requête atteint Z.AI et est authentifiée, mais Z.AI refuse de servir le modèle. Deux hypothèses, par probabilité :

1. **Clé « GLM Coding Plan » utilisée sur le mauvais endpoint.** Les clés créées pour le Coding Plan (abonnement
   ~3–10 $/mois) ne fonctionnent QUE sur `https://api.z.ai/api/coding/paas/v4/chat/completions`, pas sur
   `/api/paas/v4` (endpoint pay-as-you-go). Si Benjamin a un Coding Plan, c'est la cause la plus probable.
   → Piste : ajouter un 2e endpoint « coding » au provider `zai` (toggle dans Réglages ou fallback automatique :
   si erreur « Insufficient balance » sur `/paas/v4`, retenter sur `/api/coding/paas/v4`). Le proxy Worker relaie
   déjà n'importe quel chemin sous `/zai/...`, donc rien à changer côté Worker.
2. **Compte pay-as-you-go sans crédit.** Recharger sur z.ai, OU basculer les modèles par défaut sur les gratuits
   (`glm-4.7-flash`, `glm-4.5-flash`, `glm-4.6v-flash`) qui devraient passer sans solde. Test rapide : dans
   l'app, changer le modèle de la conversation vers « GLM-4.7 Flash » (gratuit) et renvoyer un message.
   → Amélioration utile : message d'erreur parlant + lien de recharge, et/ou repli automatique sur un modèle
   gratuit quand l'erreur est « Insufficient balance ».

À vérifier d'abord (avec la vraie clé, demander à Benjamin) :
```bash
# pay-as-you-go endpoint
curl -s -X POST 'https://ricard-zai-proxy.ricard-ai.workers.dev/zai/api/paas/v4/chat/completions' \
  -H 'Authorization: Bearer <CLE>' -H 'Content-Type: application/json' \
  -d '{"model":"glm-4.7-flash","messages":[{"role":"user","content":"hi"}]}'
# coding endpoint
curl -s -X POST 'https://ricard-zai-proxy.ricard-ai.workers.dev/zai/api/coding/paas/v4/chat/completions' \
  -H 'Authorization: Bearer <CLE>' -H 'Content-Type: application/json' \
  -d '{"model":"glm-4.7","messages":[{"role":"user","content":"hi"}]}'
```
Celui qui répond 200 indique le bon chemin. Modèles dispo selon le plan : Coding Plan → glm-4.6/4.7/5.x selon
le plan ; endpoint général → tout le catalogue (payant) + gratuits.

## Divers / nettoyage
- `worker/.wrangler/cache/wrangler-account.json` a été commité par erreur (pas un secret, juste un account id,
  mais à gitignorer : ajouter `worker/.wrangler/` dans `.gitignore` et `git rm --cached`).
- `CNAME` (contient `ricard-ai.surge.sh`) est désormais commité — c'est voulu.
- Le catalogue Z.AI est figé dans le code (`ZAI_MODELS`) : Z.AI n'a pas d'endpoint public de listing ; à maintenir
  à la main (prix sur https://docs.z.ai/guides/overview/pricing.md). glm-4.7-flash et glm-4.6v-flash sont gratuity,
  glm-5.3-flash très bon marché — candidats défauts enfants.
- Modèles par défaut enfants (zya/zelie) = `glm-4.7-flash` (gratuit) — volontaire.
- Memoire familiale auto = `glm-4.7-flash` sur Z.AI, `gpt-4o-mini` sur OpenRouter.

## Commandes utiles
```bash
cd "C:\Users\Admin\Documents\Michel AI\Ricard-AI"
npx surge . ricard-ai.surge.sh          # déploiement
cd worker && npx wrangler deploy        # déploiement proxy
python -m http.server 8765              # test local (http://localhost:8765/index.html)
```
Release = bump `APP_VERSION` (index.html) + `CACHE` (sw.js) + entrée CHANGELOG, puis surge.
