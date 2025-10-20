# Plan d'implémentation - POC Assistant IA Marketing

**Date de création** : 20 octobre 2025  
**Complétude actuelle** : ~35-40%  
**Temps estimé restant** : 1,5 à 2 jours

---

## 📋 État des lieux

### ✅ Déjà en place
- Infrastructure Podman Compose (frontend, backend, db)
- Modèle de données complet (8 tables + 3 tables de liaison)
- Migrations Alembic fonctionnelles
- Script de seed avec dataset.json
- Routes CRUD basiques (GET/POST scenarios, GET scenario/{id})
- Structure frontend SolidJS avec composants de base
- Scheduler de purge automatique
- Tests unitaires basiques

### ❌ À implémenter
- Intégration OpenAI complète (ChatService, PlanService)
- Routes API manquantes (chat, objectifs, cibles, ressources, plan, exports)
- API client frontend
- Composants UI manquants (PlanTable, ActionButtonGroup, page détail)
- Tests d'intégration
- Documentation utilisateur (README)

---

## 🎯 Phase 1 : Backend - Intégration OpenAI (4-5h)

### 1.1 Module AI - Client OpenAI
**Fichier** : `backend/app/ai/__init__.py`

```python
# Créer la structure :
# - openai_client.py : wrapper client OpenAI
# - prompts.py : templates de prompts système
# - schemas.py : schémas Pydantic pour validation réponses
```

**Tâches** :
- [ ] Créer `backend/app/ai/openai_client.py`
  - Classe `OpenAIClient` avec méthode `chat_completion()`
  - Gestion timeout et retry
  - Gestion des erreurs (APIError, RateLimitError, Timeout)
  - Logging structuré des appels
  - Fallback en cas d'échec

- [ ] Créer `backend/app/ai/prompts.py`
  - Prompt système principal (assistant marketing JSON)
  - Templates contextuels (création scénario, ajout cible, génération plan)
  - Fonction `build_context()` pour résumer scénario

- [ ] Créer `backend/app/ai/schemas.py`
  - `ChatResponseSchema` (message_markdown, actions[], entities_to_create[], errors[])
  - `ActionSchema` (id, label, type, payload)
  - `PlanGenerationSchema` (resume, items[])
  - Validation avec Pydantic

**Tests** :
- [ ] `tests/test_openai_client.py` : mock des appels API
- [ ] `tests/test_prompts.py` : validation des templates

---

### 1.2 Service Chat
**Fichier** : `backend/app/services/chat_service.py`

**Tâches** :
- [ ] Créer `ChatService` avec méthodes :
  - `process_message(scenario_id, user_message)` → réponse + actions
  - `process_action(scenario_id, action_type, payload)` → réponse + état
  - `get_conversation_history(scenario_id, limit=10)` → messages récents
  - `save_message(scenario_id, auteur, contenu, role_action)` → Message
  - `compute_available_actions(scenario)` → liste d'actions contextuelles

- [ ] Implémenter logique d'orchestration :
  - Récupérer historique conversation
  - Construire contexte (scénario + entités + historique)
  - Appeler OpenAI avec prompt approprié
  - Parser et valider réponse JSON
  - Sauvegarder message assistant avec TTL
  - Retourner réponse + boutons d'action

- [ ] Gérer les intentions :
  - `create_scenario` : création nouveau scénario
  - `add_objective` : ajout objectif
  - `add_target` : ajout cible
  - `add_resource` : ajout ressource
  - `generate_plan` : génération plan marketing
  - `suggest_targets` : propositions de cibles
  - `search_inspiration` : recherche simulée

**Tests** :
- [ ] `tests/test_chat_service.py` : scénarios complets avec mocks

---

### 1.3 Service Plan Marketing
**Fichier** : `backend/app/services/plan_service.py`

**Tâches** :
- [ ] Créer `PlanService` avec méthodes :
  - `generate_plan(scenario_id)` → Plan
  - `parse_plan_from_gpt(gpt_response, scenario_id)` → Plan + PlanItems
  - `get_latest_plan(scenario_id)` → Plan | None
  - `regenerate_plan(scenario_id)` → Plan

- [ ] Implémenter logique de génération :
  - Vérifier que scénario a objectifs + cibles + ressources
  - Construire prompt de génération (contexte complet)
  - Appeler OpenAI pour générer plan structuré
  - Parser réponse JSON (resume + items[])
  - Créer entrées Plan et PlanItems en DB
  - Mettre à jour statut scénario → "ready"

- [ ] Validation :
  - Minimum 3 items dans le plan
  - Champs obligatoires : format, message, canal
  - Formats valides : article, video, webinar, infographie, email, post social

**Tests** :
- [ ] `tests/test_plan_service.py` : génération et parsing

---

### 1.4 Service Recherche
**Fichier** : `backend/app/services/search_service.py`

**Tâches** :
- [ ] Créer `SearchService` avec méthodes :
  - `simulate_search(scenario_id, query)` → list[SearchResult]
  - `save_search(scenario_id, query, results)` → Recherche

- [ ] Implémenter simulation :
  - Appeler OpenAI pour générer 3 résultats fictifs pertinents
  - Format : {titre, extrait, recommandation_action, source}
  - Sauvegarder dans table `recherches`
  - Retourner avec boutons d'action ("Utiliser cette inspiration")

**Tests** :
- [ ] `tests/test_search_service.py`

---

### 1.5 Routes API manquantes
**Fichier** : `backend/app/routes/chat.py` (nouveau)

**Tâches** :
- [ ] Créer `backend/app/routes/chat.py`
  - `POST /api/chat` : message ou action → réponse + boutons
  - Payload : `{scenario_id?, message?, action?}`
  - Réponse : `{message, actions[], scenario_state?, error?}`

- [ ] Étendre `backend/app/routes/scenarios.py`
  - `POST /api/scenarios/{id}/objectifs` : ajouter objectif
  - `POST /api/scenarios/{id}/cibles` : ajouter cible
  - `POST /api/scenarios/{id}/ressources` : ajouter ressource
  - `POST /api/scenarios/{id}/plan` : générer/régénérer plan
  - `POST /api/scenarios/{id}/cibles/suggestions` : suggestions IA
  - `GET /api/scenarios/{id}/export/json` : export JSON
  - `GET /api/scenarios/{id}/export/csv` : export CSV
  - `POST /api/search` : recherche simulée

- [ ] Créer schémas Marshmallow manquants :
  - `ChatRequestSchema`, `ChatResponseSchema`
  - `ObjectifCreateSchema`, `CibleCreateSchema`, `RessourceCreateSchema`
  - `ActionSchema`

- [ ] Ajouter gestion d'erreurs :
  - 422 pour validation invalide
  - 404 si scénario introuvable
  - 502 si OpenAI indisponible (avec fallback)

**Tests** :
- [ ] `tests/test_chat_routes.py` : endpoints chat
- [ ] `tests/test_scenario_routes.py` : nouveaux endpoints

---

### 1.6 Exports JSON/CSV
**Fichier** : `backend/app/services/export_service.py`

**Tâches** :
- [ ] Créer `ExportService` avec méthodes :
  - `export_to_json(scenario_id)` → dict
  - `export_to_csv(scenario_id)` → StringIO

- [ ] Format JSON :
  ```json
  {
    "scenario": {...},
    "objectifs": [...],
    "cibles": [...],
    "ressources": [...],
    "plan": {
      "resume": "...",
      "items": [...]
    }
  }
  ```

- [ ] Format CSV :
  - Colonnes : Format, Message, Canal, Fréquence, KPI
  - En-tête avec nom scénario et date génération

**Tests** :
- [ ] `tests/test_export_service.py`

---

## 🎨 Phase 2 : Frontend - Fonctionnalités complètes (3-4h)

### 2.1 API Client
**Fichier** : `frontend/src/api/client.ts`

**Tâches** :
- [ ] Créer wrapper API centralisé
  ```typescript
  export const apiClient = {
    scenarios: {
      list: () => Promise<Scenario[]>,
      get: (id: number) => Promise<ScenarioDetail>,
      create: (data) => Promise<Scenario>,
    },
    chat: {
      sendMessage: (scenarioId, message) => Promise<ChatResponse>,
      triggerAction: (scenarioId, action) => Promise<ChatResponse>,
    },
    plan: {
      generate: (scenarioId) => Promise<Plan>,
    },
    export: {
      toJSON: (scenarioId) => Promise<Blob>,
      toCSV: (scenarioId) => Promise<Blob>,
    }
  }
  ```

- [ ] Gestion d'erreurs :
  - Intercepteur pour erreurs réseau
  - Retry automatique (3 tentatives)
  - Timeout 30s
  - Messages d'erreur utilisateur

- [ ] Configuration :
  - Base URL depuis `import.meta.env.VITE_API_BASE_URL`
  - Headers JSON par défaut

**Tests** :
- [ ] `src/api/client.test.ts` : mock fetch

---

### 2.2 Stores SolidJS complets
**Fichier** : `frontend/src/stores/chatStore.ts`

**Tâches** :
- [ ] Compléter `chatStore` :
  - `sendMessage(text)` : envoyer message utilisateur
  - `triggerAction(action)` : déclencher action bouton
  - `setScenario(scenarioId)` : changer contexte
  - `clearHistory()` : réinitialiser
  - État : messages[], actions[], isThinking, error

- [ ] Implémenter logique :
  - Ajouter message utilisateur localement
  - Appeler API `/chat`
  - Ajouter réponse assistant
  - Mettre à jour boutons disponibles
  - Gérer état "typing"

**Fichier** : `frontend/src/stores/scenarioStore.ts`

**Tâches** :
- [ ] Compléter `scenarioStore` :
  - `refreshScenarios()` : recharger liste
  - `selectScenario(id)` : sélectionner et charger détails
  - `createScenario(data)` : créer nouveau
  - `generatePlan(id)` : déclencher génération
  - État : scenarios[], selectedScenario, loading, error

---

### 2.3 Composants manquants

**Fichier** : `frontend/src/components/ActionButtonGroup.tsx`

**Tâches** :
- [ ] Créer composant pour boutons contextuels
  - Props : actions[], onActionClick
  - Style : badges colorés selon type d'action
  - Icônes (optionnel avec Lucide)

**Fichier** : `frontend/src/components/PlanTable.tsx`

**Tâches** :
- [ ] Créer tableau de plan marketing
  - Colonnes : Format, Message, Canal, Fréquence, KPI
  - Pagination si > 10 items
  - Export CSV/JSON (boutons en haut)
  - Style : tableau Tailwind responsive

**Fichier** : `frontend/src/components/ScenarioDetailPanel.tsx`

**Tâches** :
- [ ] Créer panneau/drawer détail scénario
  - Sections : Objectifs, Cibles, Ressources, Plan
  - Badges pour statut (draft/ready)
  - Boutons d'action contextuels
  - Timeline messages récents (optionnel)
  - Bouton fermer/retour

**Fichier** : `frontend/src/components/ExportButtons.tsx`

**Tâches** :
- [ ] Créer boutons d'export
  - Export JSON : téléchargement fichier
  - Export CSV : téléchargement fichier
  - Gestion du loading
  - Notifications succès/erreur

---

### 2.4 Routing et navigation

**Fichier** : `frontend/src/App.tsx`

**Tâches** :
- [ ] Ajouter router SolidJS
  ```typescript
  <Router>
    <Route path="/" component={MainLayout} />
    <Route path="/scenarios/:id" component={ScenarioDetailPage} />
  </Router>
  ```

- [ ] Créer `MainLayout` : chat + sidebar actuel
- [ ] Créer `ScenarioDetailPage` : page détail complète

**Alternative** : Drawer/Modal au lieu de route séparée

---

### 2.5 Améliorations UX

**Tâches** :
- [ ] Ajouter notifications toast (succès/erreur)
- [ ] Loader pendant appels API
- [ ] Animation arrivée messages (fade-in)
- [ ] Scroll auto vers dernier message
- [ ] Indicateur "Assistant écrit..." avec animation
- [ ] Gestion erreurs réseau (retry, offline)
- [ ] Raccourcis clavier (Entrée envoyer, Maj+Entrée nouvelle ligne)
- [ ] Accessibilité : aria-labels, navigation clavier

---

## 🧪 Phase 3 : Tests et qualité (2-3h)

### 3.1 Tests backend

**Tâches** :
- [ ] Tests unitaires services :
  - `tests/test_chat_service.py` : orchestration complète
  - `tests/test_plan_service.py` : génération et parsing
  - `tests/test_export_service.py` : formats JSON/CSV

- [ ] Tests d'intégration :
  - `tests/integration/test_chat_flow.py` : parcours complet
    - Créer scénario → ajouter cible → générer plan
  - `tests/integration/test_openai_integration.py` : appels réels (optionnel)

- [ ] Tests purge :
  - `tests/test_maintenance.py` : insertion messages anciens + purge

- [ ] Coverage :
  - Objectif : > 70% sur services critiques
  - Commande : `pytest --cov=app --cov-report=html`

---

### 3.2 Tests frontend

**Tâches** :
- [ ] Tests composants Vitest :
  - `src/components/ChatPanel.test.tsx`
  - `src/components/PlanTable.test.tsx`
  - `src/stores/chatStore.test.ts`

- [ ] Tests E2E Playwright (optionnel mais recommandé) :
  - `e2e/scenario-creation.spec.ts` : créer scénario via chat
  - `e2e/plan-generation.spec.ts` : générer et visualiser plan
  - `e2e/export.spec.ts` : exporter JSON/CSV

- [ ] Commandes :
  ```bash
  npm test                    # Vitest
  npx playwright test         # E2E
  ```

---

### 3.3 Qualité code

**Tâches** :
- [ ] Backend :
  - `make format` : Black + Ruff
  - `make lint` : vérifier conformité
  - Ajouter docstrings manquantes
  - Type hints complets

- [ ] Frontend :
  - `npm run format` : Prettier
  - `npm run lint` : ESLint
  - Corriger warnings TypeScript

- [ ] Logging structuré JSON :
  - Remplacer `print()` par `logging.info()`
  - Format JSON avec timestamp, level, message, context

- [ ] Rate limiting :
  - Ajouter Flask-Limiter
  - Limite : 30 req/min par IP sur `/api/chat`

---

## 📚 Phase 4 : Documentation et déploiement (1-2h)

### 4.1 README principal

**Fichier** : `README.md`

**Contenu** :
```markdown
# POC Assistant IA Marketing

## Description
Assistant conversationnel IA pour co-construire des scénarios marketing B2B.

## Prérequis
- Podman / Docker
- Clé API OpenAI

## Installation rapide
1. Cloner le dépôt
2. Copier `.env.example` → `.env`
3. Renseigner `OPENAI_API_KEY`
4. `make dev`
5. Accéder à http://localhost:3000

## Commandes utiles
- `make dev` : démarrer tous les services
- `make down` : arrêter
- `make logs` : voir les logs
- `make seed-db` : peupler la base
- `make test` : lancer les tests

## Architecture
- Frontend : SolidJS + Vite + Tailwind
- Backend : Flask + SQLAlchemy + OpenAI
- Base : MariaDB 10.11

## Fonctionnalités
- Chat conversationnel avec IA
- Création et gestion de scénarios marketing
- Génération automatique de plans de diffusion
- Export JSON/CSV
- Purge automatique des messages (7 jours)

## Tests
- Backend : `pytest`
- Frontend : `npm test`

## Licence
Usage interne uniquement (POC)
```

---

### 4.2 Documentation technique

**Fichier** : `docs/architecture.md`

**Contenu** :
- Diagramme architecture (services, flux de données)
- Schéma base de données
- Flow conversation utilisateur
- Exemples de prompts OpenAI

**Fichier** : `docs/api.md`

**Contenu** :
- Documentation endpoints (format OpenAPI/Swagger optionnel)
- Exemples de requêtes/réponses
- Codes d'erreur

---

### 4.3 Script de démonstration

**Fichier** : `docs/demo-script.md`

**Contenu** :
```markdown
# Script de démonstration POC

## Préparation (5 min avant)
1. `make dev` : démarrer services
2. Vérifier http://localhost:3000
3. `make seed-db` : peupler données initiales
4. Ouvrir navigateur en mode présentation

## Démo (10 min)
1. **Accueil** (1 min)
   - Présenter l'interface (chat + sidebar)
   - Montrer liste des scénarios existants

2. **Création scénario** (2 min)
   - "Créer un scénario pour le lancement d'un nouveau produit SaaS"
   - Montrer réponse IA + boutons contextuels

3. **Ajout cible** (2 min)
   - Cliquer "Proposer des cibles"
   - Sélectionner une cible suggérée
   - Voir mise à jour sidebar

4. **Génération plan** (3 min)
   - Cliquer "Générer plan marketing"
   - Attendre génération (loader)
   - Présenter tableau de diffusion

5. **Export** (1 min)
   - Exporter en JSON
   - Montrer fichier téléchargé

6. **Page détail** (1 min)
   - Ouvrir vue détaillée du scénario
   - Montrer toutes les composantes

## Points clés à mentionner
- IA contextuelle (comprend l'historique)
- Base relationnelle (persistance)
- Purge automatique (RGPD-friendly)
- Architecture scalable (conteneurs)
```

---

### 4.4 Fichier .env.example

**Fichier** : `.env.example`

**Contenu** :
```bash
# Projet
PROJECT_NAME=ai-marketing-assistant

# Base de données
DB_HOST=db
DB_PORT=3306
DB_USER=assistant
DB_PASS=assistant_pass
DB_NAME=assistantdb

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Configuration
FLASK_ENV=development
PURGE_TTL_DAYS=7
PURGE_JOB_HOUR=2
SCHEDULER_TIMEZONE=UTC
CORS_ALLOW_ORIGINS=*

# Frontend
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🐛 Phase 5 : Debug et stabilisation (2-3h)

### 5.1 Tests bout-en-bout

**Tâches** :
- [ ] Lancer `make dev` sur environnement propre
- [ ] Vérifier migrations : `podman exec backend flask db upgrade`
- [ ] Seed database : `make seed-db`
- [ ] Tester parcours complet manuellement :
  1. Créer scénario via chat
  2. Ajouter objectif
  3. Ajouter cible (suggestions)
  4. Ajouter ressource
  5. Générer plan
  6. Visualiser plan
  7. Exporter JSON et CSV
  8. Vérifier purge (modifier TTL pour test)

---

### 5.2 Corrections bugs

**Checklist** :
- [ ] Gestion erreurs OpenAI (timeout, rate limit)
- [ ] Validation données frontend (champs vides)
- [ ] Responsive mobile (sidebar collapse)
- [ ] Performance (lazy loading messages)
- [ ] Fuites mémoires (cleanup useEffect)
- [ ] CORS configuré correctement
- [ ] Encodage UTF-8 (caractères français)

---

### 5.3 Optimisations

**Tâches** :
- [ ] Index DB manquants :
  - `CREATE INDEX idx_messages_scenario_created ON messages(scenario_id, created_at)`
  - `CREATE INDEX idx_scenarios_thematique ON scenarios(thematique)`

- [ ] Cache requêtes fréquentes (optionnel)
- [ ] Compression réponses API (gzip)
- [ ] Minification frontend (`vite build`)

---

## 📊 Checklist finale avant démo

### Backend
- [ ] Toutes les routes API fonctionnelles
- [ ] Tests passent (> 70% coverage)
- [ ] Logs structurés JSON
- [ ] Gestion erreurs robuste
- [ ] OpenAI intégré avec fallback
- [ ] Seed database fonctionne
- [ ] Migrations à jour

### Frontend
- [ ] Tous les composants implémentés
- [ ] API client fonctionnel
- [ ] Stores synchronisés
- [ ] UX fluide (loaders, erreurs)
- [ ] Responsive
- [ ] Tests composants passent
- [ ] Build production OK

### Infrastructure
- [ ] `make dev` démarre tous les services
- [ ] Healthcheck backend OK
- [ ] Connexion DB stable
- [ ] Volumes persistants
- [ ] Logs accessibles

### Documentation
- [ ] README complet
- [ ] .env.example à jour
- [ ] Script de démo préparé
- [ ] Architecture documentée

---

## 🚀 Ordre d'exécution recommandé

### Jour 1 (6-7h)
**Matin** :
1. Module AI (openai_client, prompts, schemas) - 2h
2. ChatService - 2h

**Après-midi** :
3. PlanService - 1,5h
4. Routes chat + extensions scenarios - 1,5h

### Jour 2 (6-7h)
**Matin** :
5. API client frontend - 1h
6. Compléter stores - 1h
7. Composants manquants (PlanTable, ActionButtonGroup) - 2h

**Après-midi** :
8. Page détail scénario - 1,5h
9. Exports JSON/CSV - 1h
10. Améliorations UX - 1h

### Jour 3 (4-5h)
**Matin** :
11. Tests backend - 2h
12. Tests frontend - 1h

**Après-midi** :
13. Documentation (README, demo script) - 1h
14. Debug et stabilisation - 1,5h
15. Répétition démo - 0,5h

---

## 📈 Métriques de succès

- [ ] Parcours complet fonctionnel (création → plan → export)
- [ ] Temps réponse API < 2s (hors OpenAI)
- [ ] Temps génération plan < 10s
- [ ] 0 erreur console frontend
- [ ] Tests backend > 70% coverage
- [ ] Build production sans warnings
- [ ] Démo fluide < 10 min

---

## 🔧 Dépendances à ajouter

### Backend
```txt
# Ajouter à requirements.txt
Flask-Limiter==3.5.0
```

### Frontend
```json
// Ajouter à package.json (optionnel)
"lucide-solid": "^0.263.1",  // Icônes
"@solidjs/router": "^0.13.0"  // Déjà présent
```

---

## 💡 Améliorations futures (post-POC)

- [ ] Authentification multi-utilisateur
- [ ] Historisation versions de plans
- [ ] Dashboard analytics (KPIs)
- [ ] Export vers outils tiers (Notion, HubSpot)
- [ ] Prompt tuning par industrie
- [ ] Mode collaboratif (WebSocket)
- [ ] Recherche en ligne réelle (Serper API)
- [ ] Templates de scénarios prédéfinis
- [ ] Suggestions automatiques proactives
- [ ] Comparaison de plans (A/B)

---

## 📞 Support et ressources

- **Documentation OpenAI** : https://platform.openai.com/docs
- **SolidJS** : https://www.solidjs.com/docs
- **Flask** : https://flask.palletsprojects.com/
- **SQLAlchemy** : https://docs.sqlalchemy.org/

---

**Note** : Ce plan est optimiste mais réaliste pour un développeur expérimenté. Ajuster les estimations selon l'équipe et les imprévus.
