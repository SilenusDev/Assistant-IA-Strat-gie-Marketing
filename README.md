# 🤖 POC Assistant IA - Stratégie Marketing

> **Proof of Concept** - Assistant conversationnel pour co-construire des scénarios marketing B2B avec génération automatique de plans de diffusion

[![Status](https://img.shields.io/badge/status-POC-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 📖 Documentation

- **📄 [Livrable 1 : Analyse des besoins](http://localhost:3000/docs/livrable-1-analyse-besoins-A4.html)** - Analyse détaillée des besoins utilisateurs
- **📋 [Livrable 2 : Cahier des charges](http://localhost:3000/docs/livrable-2-cahier-des-charges-A4.html)** - Spécifications techniques complètes
- **🎯 [Présentation POC (Slides)](http://localhost:3000/docs/presentation.html)** - Présentation interactive du projet

💡 **Accès rapide** : Menu "Documentation" dans l'application (en haut à droite)

## 🚀 Démarrage rapide

### Prérequis
- Docker ou Podman
- Docker Compose ou Podman Compose
- Clé API OpenAI

### Installation

**1. Cloner et configurer**
```bash
cd POC
cp .env.example .env
# Éditer .env et ajouter votre clé OpenAI :
# OPENAI_API_KEY=sk-...
```

**2. Démarrer tous les services**

**Avec Docker :**
```bash
docker-compose up -d --build
```

**Avec Podman :**
```bash
podman-compose up -d --build
# ou
make dev
```

**3. Accéder à l'application**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Base de données** : localhost:3306

✅ **La base de données est automatiquement initialisée et peuplée avec des scénarios B2B au démarrage**

## 📋 Commandes utiles

### Avec Docker Compose
```bash
docker-compose up -d --build    # Démarrer et builder
docker-compose down             # Arrêter
docker-compose down -v          # Arrêter + supprimer les volumes
docker-compose logs -f backend  # Voir les logs backend
docker-compose restart backend  # Redémarrer le backend
```

### Avec Podman Compose (ou Makefile)
```bash
make dev           # Démarrer tous les services
make down          # Arrêter tous les services
make logs          # Voir les logs en temps réel
make backend-shell # Ouvrir un shell dans le backend
make frontend-shell # Ouvrir un shell dans le frontend
make test          # Lancer les tests
```

## 🎯 Fonctionnalités

### 💬 Flow d'accompagnement conversationnel
1. **Création/Sélection de configuration** - L'utilisateur choisit ou crée une configuration marketing
2. **Définition des objectifs** (max 2) - IA propose + liste existante + création manuelle
3. **Définition des cibles** (max 3) - IA propose + liste existante + création manuelle
4. **Génération de plan** - L'IA génère automatiquement un plan avec 5 articles de diffusion
5. **Export et gestion** - Export JSON/CSV, visualisation des plans

### ✨ Fonctionnalités principales
✅ **Chat conversationnel hybride** - Agent IA + composants interactifs (cartes cliquables)  
✅ **Gestion de scénarios** - CRUD complet sur les scénarios marketing B2B  
✅ **Gestion d'objectifs et cibles** - Tables globales réutilisables  
✅ **Génération automatique de plans** - IA génère des plans de diffusion contextualisés  
✅ **Sauvegarde progressive** - Chaque choix est sauvegardé immédiatement  
✅ **Export** - JSON et CSV  
✅ **Nettoyage automatique** - TTL 7 jours sur l'historique des messages  

### 🎨 Interface utilisateur
- **Design moderne** - TailwindCSS + Lucide Icons
- **Responsive** - Adapté mobile et desktop
- **Sidebar dynamique** - Liste des scénarios avec statuts
- **Structure visuelle** - Arborescence configuration → objectifs → cibles
- **Feedback temps réel** - Loading states et animations  

## 🏗️ Architecture

### Stack technique
- **Frontend** : SolidJS 1.8 + Vite 5 + TailwindCSS + Lucide Icons (port 3000)
- **Backend** : Flask 3.0 + SQLAlchemy 2.0 + OpenAI API (port 5000)
- **Base de données** : MariaDB 10.11 (port 3306)

### Structure de la base de données

**Modèle relationnel :**
- `scenarios` : Scénarios marketing (1 scénario → N configurations)
- `configurations` : Configurations marketing avec liens vers objectifs/cibles
- `objectifs` : Table globale réutilisable (liaison via `configuration_objectifs`, max 2 par config)
- `cibles` : Table globale réutilisable (liaison via `configuration_cibles`, max 3 par config)
- `plans` : Plans de diffusion (1 configuration → 1 plan)
- `plan_items` : Articles de diffusion (1 plan → N articles)
- `messages` : Historique conversationnel avec TTL 7 jours
- `scenario_status` : Table de référence pour les statuts

📖 **Documentation complète** : `/docs/db.md`

### API Endpoints
- `GET/POST /api/scenarios` - Gestion des scénarios
- `GET/POST /api/configurations` - Gestion des configurations
- `GET/POST /api/objectifs` - Gestion des objectifs
- `GET/POST /api/cibles` - Gestion des cibles
- `POST /api/chat` - Interface conversationnelle avec l'IA
- `GET /api/health` - Health check

## 🔧 Développement

### Hot reload
Les volumes sont montés pour le développement :
- **Frontend** : Hot reload automatique (Vite)
- **Backend** : Redémarrage requis après modification

```bash
# Redémarrer le backend après modification
docker-compose restart backend
# ou avec Podman
podman-compose restart backend
```

### Accès à la base de données
```bash
# Avec Docker
docker exec -it ai-marketing-assistant-db mysql -uassistant -passistant_pass assistantdb

# Avec Podman
podman exec -it ai-marketing-assistant-db mysql -uassistant -passistant_pass assistantdb
```

### Tests
```bash
# Lancer tous les tests
make test

# Tests backend uniquement
podman-compose exec backend pytest

# Tests frontend uniquement
podman-compose exec frontend npm test
```

### Réinitialiser la base
```bash
docker-compose down -v && docker-compose up -d --build
# ou
podman-compose down -v && make dev
```

## 📊 Résultats & Impact

### Gains attendus
- ⏱️ **15-20h/mois** gagnées sur la définition de stratégies marketing
- 💰 **19 500€/an** valorisés en temps économisé
- ✅ **Suppression des tâches détestées** (définition sujets/angles)
- 🎯 **Vision complète** des dispositifs marketing

### Métriques POC
- ⚡ **3 jours** de développement
- 🎨 **11 slides** de présentation interactive
- 📄 **2 livrables** complets (analyse + cahier des charges)
- 🤖 **GPT-4o-mini** pour la génération de contenu

## ⚠️ Note importante

**Ceci est un POC de démonstration, pas un projet production.**

### Principes POC respectés
- ✅ Code simple et direct
- ✅ Pas de sur-ingénierie
- ✅ Focus sur la démonstration fonctionnelle
- ✅ "Make it work, not perfect"

### Limitations POC
- ❌ Pas d'authentification utilisateur
- ❌ Flow linéaire simplifié (pas de retour arrière)
- ❌ Pas de reprise de session (si interruption, recommencer)
- ❌ TTL messages limité à 7 jours

## 📝 Variables d'environnement

Fichier `.env` requis (copier depuis `.env.example`) :

```bash
# Projet
PROJECT_NAME=ai-marketing-assistant

# OpenAI (OBLIGATOIRE - sans cette clé, le backend ne démarrera pas)
OPENAI_API_KEY=sk-...

# Base de données (valeurs par défaut)
DB_HOST=db
DB_PORT=3306
DB_USER=assistant
DB_PASS=assistant_pass
DB_NAME=assistantdb

# Flask (optionnel pour le développement)
FLASK_ENV=development
FLASK_DEBUG=1
```

⚠️ **Important** : Seule `OPENAI_API_KEY` est obligatoire. Les autres variables ont des valeurs par défaut.

## 🐛 Dépannage

### Problèmes courants

**Le backend ne démarre pas**
```bash
# Vérifier que OPENAI_API_KEY est défini
grep OPENAI_API_KEY .env

# Voir les logs du backend
docker-compose logs backend
```

**Erreur de connexion à la base de données**
```bash
# MariaDB met 10-15 secondes à démarrer
# Attendre puis redémarrer le backend
docker-compose restart backend
```

**Port déjà utilisé (3000, 5000 ou 3306)**
- Modifier les ports dans `docker-compose.yml`
- Ou arrêter le service qui utilise le port

**Données manquantes ou corrompues**
```bash
# Réinitialiser complètement la base
docker-compose down -v
docker-compose up -d --build
```

**Problèmes de permissions (Podman)**
```bash
# Vérifier les permissions des volumes
ls -la backend/ frontend/ db/
```

### Logs utiles
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```
