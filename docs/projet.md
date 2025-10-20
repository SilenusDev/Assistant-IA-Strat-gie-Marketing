# Cahier des spécifications – POC Assistant IA Marketing (Windsurf)

## 1. Vision et objectifs
- Démontrer en trois jours un assistant conversationnel capable de guider un marketeur dans la construction d’un scénario marketing, de générer automatiquement un plan de diffusion multi-format et de conserver la connaissance dans une base relationnelle.
- Offrir une expérience chat-first fluide, enrichie de boutons contextuels permettant d’orchestrer rapidement la création et la mise à jour des scénarios.
- Supporter un flux de travail complet : découverte des scénarios, co-construction (objectifs, cibles, ressources), génération du plan, visualisation et export.
- Livrer une architecture conteneurisée Podman Compose exploitable directement dans Windsurf (IDE et environnement de développement).

## 2. Périmètre fonctionnel
- Créer, sélectionner et éditer un scénario marketing via le chat ou une vue dédiée.
- Ajouter objectifs, cibles et ressources à un scénario grâce à des suggestions guidées par l’IA.
- Générer automatiquement un plan marketing (formats, messages, canaux, fréquence) stocké dans la base et affiché côté front.
- Simuler des recherches en ligne : le chatbot suggère des résultats et options d’action sans scrapper de sites tiers.
- Consulter et éditer un scénario dans une vue dédiée (sidebar et page détaillée).
- Exporter un scénario structuré en JSON ou CSV.
- Purger automatiquement l’historique des conversations au-delà de sept jours.

## 3. Personae et user stories
- Persona principale : responsable marketing B2B qui prépare une stratégie de diffusion de contenus.
- US1 – Découverte : parcourir la liste des scénarios existants pour choisir celui à enrichir.
- US2 – Création : créer un scénario (nom, thématique) depuis le chat pour démarrer un projet.
- US3 – Objectifs : ajouter ou sélectionner un objectif marketing afin d’orienter le plan.
- US4 – Cible : accepter une proposition de cible et l’enregistrer sur le scénario en un clic.
- US5 – Ressources : consigner les contenus disponibles pour nourrir le plan.
- US6 – Plan : obtenir et visualiser un plan de diffusion multi-format généré automatiquement.
- US7 – Consultation : voir l’état complet d’un scénario (objectifs, cibles, ressources, plan) dans la zone dédiée.
- US8 – Export : exporter un scénario en JSON ou CSV pour partage/exploitation.
- US9 – Continuité : conserver les échanges récents durant sept jours puis les purger.

## 4. Parcours utilisateur clé
1. Accueil chat : message de bienvenue et boutons d’entrée (Créer un scénario, Travailler sur un scénario existant, Voir mes scénarios).
2. Sélection ou création : formulaire minimal (nom, thématique) ou sélection d’un scénario listé dans la sidebar.
3. Guidage par boutons : propositions contextuelles (Ajouter un objectif, Définir une cible, Ajouter une ressource, Générer un plan).
4. Validation IA : chaque action déclenche une requête backend → GPT → stockage → affichage du résultat (texte + prochains boutons).
5. Visualisation : la sidebar affiche les métadonnées du scénario et un bouton « Voir détail » ouvre un panneau ou une page dédiée avec toutes les composantes.
6. Synthèse : le bouton « Générer plan marketing » compile les informations et présente un résumé plus un tableau de diffusion.
7. Export ou reprise : export JSON/CSV ou transition vers un autre scénario.

## 5. Interface utilisateur (SolidJS + Tailwind via CDN)
- Page unique responsive :
  - Colonne principale (environ 70 %) : historique de chat, bulles différenciées, champ de saisie, groupe de boutons contextuels.
  - Sidebar (environ 30 %) : recherche et liste des scénarios (nom, thématique, badge d’état), panneau du scénario sélectionné (objectifs, cibles, ressources), bouton « Ouvrir détail ».
- Page détail scénario (drawer ou route `/scenarios/:id`) :
  - Sections Objectifs, Cibles, Ressources, Plan de diffusion (tableau).
  - Boutons d’action contextuelle réutilisés (exemple : « Ajouter une cible depuis le chat » préremplit le chat).
- Composants clés : `ChatMessage`, `ChatComposer`, `ActionButtonGroup`, `ScenarioList`, `ScenarioDetailPanel`, `PlanTable`.
- Gestion d’état via stores SolidJS pour synchroniser chat et sidebar.
- Accessibilité : navigation clavier, aria-label sur les boutons, contraste conforme.
- Animations légères Tailwind pour l’arrivée des messages et la mise à jour d’un scénario.

## 6. Comportement des boutons de chat
- Chaque bouton représente une intention envoyée au backend avec le contexte du scénario (identifiant, entités déjà créées).
- Exemple : bouton « Proposer des cibles » → POST `/scenarios/{id}/cibles/suggestions` → le backend interroge GPT → renvoie trois propositions (label, description, insight) → affichage dans le chat avec boutons « Ajouter ».
- Lorsque l’utilisateur valide, le frontend POST `/scenarios/{id}/cibles` ; le backend enregistre la cible, met à jour la relation et renvoie l’état du scénario actualisé.
- Les boutons disponibles sont fournis dans la réponse du backend (`actions`), ce qui permet d’ajuster la logique sans toucher au front.

## 7. Architecture technique (Podman Compose)
- Services :
  - `frontend` : image Node 20, build SolidJS, expose 3000.
  - `backend` : image Python 3.11 (Flask + Gunicorn), expose 5000.
  - `db` : image MariaDB 10.11, expose 3306 (réseau interne).
- `podman-compose.yml` :
  - Réseau dédié `assistant-net`.
  - Volume `mariadb_data` pour la persistance.
  - Variables d’environnement via `.env` (non commité).
- Bonnes pratiques dans Windsurf :
  - Scripts `make up`, `make down`, `make logs`.
  - Utilisation du terminal intégré pour builder et lancer `podman-compose up`.

## 8. Modèle de données relationnel
- Tables principales :
  - `scenarios` : id (PK, auto), nom (varchar 150), thematique (varchar 150), description (text), statut (enum draft|ready), created_at, updated_at.
  - `objectifs` : id, label (varchar 120), description (text).
  - `cibles` : id, label (varchar 120), persona (text), segment (varchar 120).
  - `ressources` : id, type (enum article|video|webinar|cas_client|autre), titre (varchar 150), url (varchar 255), note (text).
  - `plans` : id, scenario_id (FK), resume (text), generated_at (datetime).
  - `plan_items` : id, plan_id (FK), format (varchar 60), message (text), canal (varchar 60), frequence (varchar 60), kpi (varchar 80).
  - `messages` : id, scenario_id (FK nullable), auteur (enum user|assistant|system), contenu (text), role_action (varchar 60), created_at, ttl.
  - `recherches` : id, scenario_id (FK), requete (varchar 180), resultat (text), created_at.
- Tables de liaison :
  - `scenario_objectifs` : scenario_id, objectif_id, priorite (tinyint), clé primaire composite.
  - `scenario_cibles` : scenario_id, cible_id, maturite (enum awareness|consideration|decision), clé primaire composite.
  - `scenario_ressources` : scenario_id, ressource_id, usage (varchar 120), clé primaire composite.
- Index recommandés :
  - `messages (scenario_id, created_at)`.
  - `plans (scenario_id)` et `plan_items (plan_id)`.
  - Index sur `scenarios (thematique)` pour la recherche.
- Seed initial depuis `dataset.json` : script de peuplement exécuté au démarrage si la base est vide.
- Purge automatique : tâche planifiée supprimant les messages dont `ttl < NOW()` (ttl fixé à `created_at + INTERVAL 7 DAY`).

## 9. Backend Flask
- Architecture :
  - Application factory (`app/__init__.py`).
  - Modules `routes`, `services`, `models`, `schemas`, `ai`.
  - SQLAlchemy + Alembic pour migrations.
  - Schémas de validation avec Pydantic ou Marshmallow.
- Services internes :
  - `ScenarioService` : CRUD scénarios, hydratation des entités liées.
  - `ChatService` : orchestration du dialogue, gestion des boutons, résumé d’historique.
  - `PlanService` : transformation des réponses GPT en entrées `plans` et `plan_items`.
  - `SearchService` : simulation de recherche et stockage.
- Endpoints :
  - `GET /health` : état backend et connectivité DB.
  - `GET /scenarios` : pagination, filtre par thématique.
  - `POST /scenarios` : création `{nom, thematique, description?}`.
  - `GET /scenarios/{id}` : scénario enrichi (objectifs, cibles, ressources, plan courant).
  - `POST /scenarios/{id}/objectifs`, `/cibles`, `/ressources` : ajout d’entités.
  - `POST /scenarios/{id}/plan` : génération ou régénération du plan.
  - `POST /scenarios/{id}/cibles/suggestions` : propositions (action bouton).
  - `POST /chat` : message ou action → réponse IA + boutons + état scénario.
  - `GET /scenarios/{id}/export/json` et `/scenarios/{id}/export/csv`.
- Gestion des erreurs :
  - 422 pour validation invalide.
  - 404 si scénario introuvable.
  - 502 si service OpenAI indisponible (avec fallback message).
- Sécurité minimale :
  - CORS limité à l’URL frontend.
  - Rate limiting simple (exemple 30 requêtes/minute).
  - Logs structurés JSON.

## 10. Intégration OpenAI
- Variables d’environnement : `OPENAI_API_KEY`, `OPENAI_MODEL` (`gpt-4o-mini` recommandé), `OPENAI_TIMEOUT`.
- Prompt type :
  - Message système : “Tu es un assistant marketing qui renvoie des réponses en JSON strict respectant le schéma transmis.”
  - Contexte : résumé du scénario, liste des entités existantes, intention déclenchée.
  - Contraintes : toujours renvoyer `message_markdown`, `actions[]`, `entities_to_create[]`, `errors[]`.
- Validation :
  - Parser la réponse JSON via Pydantic. En cas d’échec, renvoyer un message de secours au front.
- Stockage :
  - Sauvegarder la réponse brute pour audit (optionnel, table `messages`).

## 11. Simulation de recherche en ligne
- Endpoint interne `POST /search` déclenché par l’action « Rechercher des inspirations ».
- Payload : `{scenario_id, requete}`.
- Réponse : liste de trois résultats `{titre, extrait, recommandation_action, source}`.
- Stockage dans `recherches` pour relecture ultérieure dans la page détaillée.
- Les boutons « Utiliser cette inspiration » déclenchent la création d’une ressource, cible ou objectif selon le type suggéré.

## 12. Frontend SolidJS
- State management :
  - `useScenarioStore` : liste, scénario courant, chargement.
  - `useChatStore` : messages, boutons disponibles, statut “typing”.
- Appels API : wrapper `apiClient` centralisant base URL, headers et gestion d’erreur.
- Gestion du chat :
  - Composer avec saisie texte et raccourcis clavier (Entrée pour envoyer, Maj+Entrée pour retour ligne).
  - Messages alignés à droite (utilisateur) et gauche (assistant), time-stamp léger.
- Sidebar :
  - Barre de recherche (filtre par nom ou thématique).
  - Liste triée par `updated_at` décroissant.
  - Vignette du scénario sélectionné avec badges (objectifs/cibles/ressources).
- Page détail :
  - Table `plan_items` paginée si plus de dix éléments.
  - Timeline récente des messages liés au scénario.
  - Boutons d’action contextuels en haut de page.
- Tests front :
  - `vitest` + `@solidjs/testing-library` pour les composants critiques.
  - Tests d’intégration légers (Playwright) pour le parcours clé.

## 13. Données d’initialisation
- `dataset.json` (fourni) : cinq scénarios B2B avec objectifs, cibles et ressources.
- Script `backend/scripts/seed.py` :
  - Vérifie si `scenarios` est vide.
  - Insère scénarios, objectifs, cibles, ressources et relations.
  - Peut être lancé via `podman exec backend python -m scripts.seed`.

## 14. Non-fonctionnel
- Performance : réponse backend inférieure à deux secondes hors appel GPT ; afficher un loader côté front pendant l’attente.
- Disponibilité : POC monoposte, redémarrage des conteneurs inférieur à trente secondes.
- Observabilité :
  - Logging JSON (niveau info) pour les requêtes HTTP et les appels IA.
  - Compteurs simples (nombre de plans générés) exposés via `/health`.
- Sécurité :
  - Pas d’authentification (hypothèse POC) ; ajouter une bannière mentionnant l’usage interne.
  - Ne jamais exposer la clé OpenAI au frontend ; toutes les requêtes passent par le backend.
- Maintenance :
  - Scripts `make format` (Black + Ruff), `make test`.
  - README décrivant l’installation sous Windsurf et les commandes utiles.

## 15. Plan de réalisation (jour 1 à 3)
- Jour 1 : setup Podman, configuration MariaDB, migrations initiales, seed JSON, endpoints CRUD scénario.
- Jour 2 : intégration OpenAI, logique chat et boutons, génération de plan, purge automatique, tests backend.
- Jour 3 : développement UI SolidJS (chat, sidebar, page détail), intégration API, export JSON/CSV, tests front et répétition de la démo.

## 16. Tests et validation
- Backend :
  - Tests unitaires `pytest` sur les services (ScenarioService, ChatService, PlanService).
  - Tests d’intégration sur `/chat` et `/scenarios/{id}/plan`.
  - Test de purge (insertion de messages anciens puis exécution de la tâche).
- Frontend :
  - Tests composants pour l’affichage des boutons et du plan.
  - Scénarios Playwright (création scénario → ajout cible → génération plan).
- Démo interne :
  - Script pas-à-pas listant les actions à effectuer en live (lancer chat, créer scénario, générer plan, exporter).

## 17. Extensions futures
- Authentification multi-utilisateur (Keycloak ou Auth0).
- Historisation long terme des plans et comparaisons.
- Dashboard de performance (KPIs par scénario).
- Connecteurs d’export (Notion, Google Sheets, HubSpot).
- Prompt tuning par thématique ou par entreprise.

## 18. Checklist de mise en route (Windsurf)
- Cloner le dépôt dans Windsurf et ouvrir le workspace.
- Copier `.env.example` vers `.env`, renseigner `OPENAI_API_KEY`, `DB_USER`, `DB_PASS`.
- Lancer `make dev` (ou `podman-compose up --build`) depuis le terminal intégré.
- Accéder au frontend sur `http://localhost:3000`.
- Vérifier le backend via `curl http://localhost:5000/health`.
- Exécuter `pytest` et `npm test` avant la démo.

## 19. Plan de mise en place détaillé
- **Préparation (½ journée)**
  - Valider les accès (clé OpenAI, Podman, base locale).
  - Créer le dépôt Windsurf ou synchroniser la branche dédiée.
  - Lister les dépendances (Python, Node, outils de tests) et vérifier les versions.
- **Infrastructure (Jour 1 matin)**
  - Générer la structure des dossiers `frontend`, `backend`, `db`.
  - Écrire `podman-compose.yml`, `.env.example`, scripts `Makefile`.
  - Mettre en place MariaDB : migrations initiales (`alembic init`, premiers modèles).
  - Importer `dataset.json` via script de seed.
- **Backend MVP (Jour 1 après-midi)**
  - Implémenter l’application factory Flask, configuration `SQLAlchemy`.
  - Créer endpoints CRUD basiques pour `scenarios`.
  - Ajouter tests unitaires initiaux (`pytest`) et pipeline `make test`.
- **Logique conversationnelle (Jour 2 matin)**
  - Implémenter `ChatService`, intégration OpenAI (prompts, parsing, gestion des erreurs).
  - Ajouter routes d’action (`/scenarios/{id}/objectifs`, `/cibles`, `/ressources`).
  - Enregistrer les messages et planifier la purge (APScheduler ou cron Podman).
- **Plan marketing & exports (Jour 2 après-midi)**
  - Créer `PlanService` + tables `plans` et `plan_items`.
  - Mettre en place `/scenarios/{id}/plan`, `/export/json`, `/export/csv`.
  - Couvrir par des tests d’intégration (réponses JSON complètes).
- **Frontend structure (Jour 3 matin)**
  - Initialiser SolidJS (Vite) avec Tailwind CDN.
  - Construire la page principale : layout, stores, appels API.
  - Mettre en place le composant chat (historique, composer, boutons).
- **Frontend scénarios & plan (Jour 3 après-midi)**
  - Développer la sidebar (liste, filtre, carte scénario).
  - Créer la page/drawer détail (`ScenarioDetailPanel`, `PlanTable`).
  - Intégrer les exports et les retours d’erreur (toasts).
  - Ajouter tests (Vitest) et scénarios Playwright prioritaires.
- **Stabilisation & démo (fin Jour 3)**
  - Exécution complète de la checklist (tests, lint, build).
  - Préparer un script de démonstration scénarisé (steps, prompts).
  - Capturer captures/notes pour le livrable final.
