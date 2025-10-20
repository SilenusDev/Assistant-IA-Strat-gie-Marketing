# Structure de la base de données

## Vue d'ensemble

Base de données relationnelle MariaDB pour gérer les scénarios marketing, leurs composantes et l'historique conversationnel.

---

## Tables principales

### `scenarios`
Scénarios marketing créés par les utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `nom` | VARCHAR(150) | Nom du scénario |
| `thematique` | VARCHAR(150) | Thématique principale |
| `description` | TEXT | Description optionnelle |
| `statut` | ENUM | `draft` ou `ready` |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Index** : `thematique`

---

### `objectifs`
Objectifs marketing réutilisables.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `label` | VARCHAR(120) UNIQUE | Libellé de l'objectif |
| `description` | TEXT | Description détaillée |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Exemples** : "Améliorer la notoriété", "Générer des leads qualifiés"

---

### `cibles`
Cibles/personas marketing réutilisables.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `label` | VARCHAR(120) UNIQUE | Libellé de la cible |
| `persona` | TEXT | Description du persona |
| `segment` | VARCHAR(120) | Segment d'entreprise |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Exemples** : "CMO SaaS B2B", "Directeur Marketing PME"

---

### `ressources`
Ressources marketing existantes.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `type` | ENUM | `article`, `video`, `webinar`, `cas_client`, `autre` |
| `titre` | VARCHAR(150) | Titre de la ressource |
| `url` | VARCHAR(255) | URL optionnelle |
| `note` | TEXT | Note d'usage |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

---

### `plans`
Plans marketing générés par l'IA.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `scenario_id` | INT (FK) | Scénario associé |
| `resume` | TEXT | Résumé stratégique |
| `generated_at` | DATETIME | Date de génération |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Index** : `scenario_id`

---

### `plan_items`
Actions concrètes d'un plan marketing.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `plan_id` | INT (FK) | Plan associé |
| `format` | VARCHAR(60) | Format du contenu |
| `message` | TEXT | Description de l'action |
| `canal` | VARCHAR(60) | Canal de diffusion |
| `frequence` | VARCHAR(60) | Fréquence de publication |
| `kpi` | VARCHAR(80) | KPI à suivre |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Index** : `plan_id`

**Exemples de formats** : article, video, email, post_social, infographie

---

### `messages`
Historique des conversations (purge automatique après 7 jours).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `scenario_id` | INT (FK, nullable) | Scénario associé |
| `auteur` | ENUM | `user`, `assistant`, `system` |
| `contenu` | TEXT | Contenu du message |
| `role_action` | VARCHAR(60) | Action/intention associée |
| `ttl` | DATETIME | Date d'expiration (7 jours) |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

**Index** : `(scenario_id, created_at)`

**Purge** : Messages supprimés automatiquement quand `ttl < NOW()`

---

### `recherches`
Historique des recherches simulées.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT (PK, AUTO) | Identifiant unique |
| `scenario_id` | INT (FK) | Scénario associé |
| `requete` | VARCHAR(180) | Requête de recherche |
| `resultat` | TEXT | Résultats (JSON) |
| `created_at` | DATETIME | Date de création |
| `updated_at` | DATETIME | Date de modification |

---

## Tables de liaison (Many-to-Many)

### `scenario_objectifs`
Lie les scénarios aux objectifs.

| Colonne | Type | Description |
|---------|------|-------------|
| `scenario_id` | INT (PK, FK) | Scénario |
| `objectif_id` | INT (PK, FK) | Objectif |
| `priorite` | SMALLINT | Priorité (optionnel) |

**Contrainte** : UNIQUE(`scenario_id`, `objectif_id`)

---

### `scenario_cibles`
Lie les scénarios aux cibles.

| Colonne | Type | Description |
|---------|------|-------------|
| `scenario_id` | INT (PK, FK) | Scénario |
| `cible_id` | INT (PK, FK) | Cible |
| `maturite` | ENUM | `awareness`, `consideration`, `decision` |

**Contrainte** : UNIQUE(`scenario_id`, `cible_id`)

---

### `scenario_ressources`
Lie les scénarios aux ressources.

| Colonne | Type | Description |
|---------|------|-------------|
| `scenario_id` | INT (PK, FK) | Scénario |
| `ressource_id` | INT (PK, FK) | Ressource |
| `usage` | VARCHAR(120) | Usage prévu |

**Contrainte** : UNIQUE(`scenario_id`, `ressource_id`)

---

## Relations

```
scenarios (1) ──< (N) scenario_objectifs >── (N) objectifs
scenarios (1) ──< (N) scenario_cibles >── (N) cibles
scenarios (1) ──< (N) scenario_ressources >── (N) ressources
scenarios (1) ──< (N) plans
plans (1) ──< (N) plan_items
scenarios (1) ──< (N) messages
scenarios (1) ──< (N) recherches
```

---

## Diagramme simplifié

```
┌─────────────┐
│  scenarios  │
└──────┬──────┘
       │
       ├──< scenario_objectifs >──< objectifs
       ├──< scenario_cibles >──< cibles
       ├──< scenario_ressources >──< ressources
       │
       ├──< plans ──< plan_items
       ├──< messages
       └──< recherches
```

---

## Données initiales (seed)

Le fichier `dataset.json` contient 8 scénarios B2B avec :
- Objectifs variés (notoriété, leads, conversion)
- Cibles (CMO, Directeur Marketing, etc.)
- Ressources existantes (articles, vidéos, newsletters)

**Commande** : `make seed-db`

---

## Maintenance

### Purge automatique
- **Fréquence** : Tous les jours à 2h du matin (UTC)
- **Cible** : Messages où `ttl < NOW()`
- **Scheduler** : APScheduler (backend)

### Migrations
- **Outil** : Alembic
- **Fichiers** : `backend/migrations/versions/`
- **Commande** : `flask db upgrade`

---

## Notes techniques

- **Charset** : UTF-8 (utf8mb4)
- **Engine** : InnoDB
- **Timezone** : UTC pour tous les timestamps
- **Cascade** : DELETE CASCADE sur `plan_items` quand le plan est supprimé
