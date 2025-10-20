# POC Assistant IA Marketing

> **Proof of Concept** - Assistant conversationnel pour co-construire des scénarios marketing B2B

## 🚀 Démarrage rapide

### Prérequis
- Docker ou Podman
- Docker Compose
- Clé API OpenAI

### Installation

**1. Cloner et configurer**
```bash
cd POC
cp .env.example .env
# Éditer .env et ajouter :
# OPENAI_API_KEY=votre_clé
# DB_HOST=db
```

**2. Démarrer tous les services**
```bash
docker-compose up -d
```

**3. Accéder à l'application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- Base de données : localhost:3306

✅ **La base de données est automatiquement peuplée avec 8 scénarios B2B au démarrage**

## 📋 Commandes utiles

```bash
docker-compose up -d          # Démarrer
docker-compose down           # Arrêter
docker-compose down -v        # Arrêter + supprimer les données
docker-compose logs backend   # Voir les logs backend
docker-compose restart backend # Redémarrer le backend
```

## 🎯 Fonctionnalités

✅ **Chat conversationnel** avec IA (OpenAI GPT-4)  
✅ **Création de scénarios** marketing B2B  
✅ **Gestion d'objectifs, cibles et ressources**  
✅ **Génération automatique** de plans de diffusion  
✅ **Export** JSON et CSV  
✅ **8 scénarios pré-chargés** pour la démo  

## 🏗️ Architecture

### Stack technique
- **Frontend** : SolidJS + Vite + TailwindCSS (port 3000)
- **Backend** : Flask + SQLAlchemy + OpenAI (port 5000)
- **Base de données** : MariaDB 10.11 (port 3306)

### Structure de la base
- `scenarios` : Scénarios marketing
- `objectifs`, `cibles`, `ressources` : Entités réutilisables
- `plans` + `plan_items` : Plans générés par l'IA
- `messages` : Historique conversationnel (TTL 7 jours)
- `scenario_status` : Table de référence pour les statuts

📖 **Documentation complète** : `/docs/db.md`

## 🔧 Développement

### Hot reload
Le code backend est monté en volume, les modifications sont prises en compte après redémarrage :
```bash
docker-compose restart backend
```

### Accès à la base de données
```bash
docker exec -it ai-marketing-assistant-db mysql -uassistant -passistant_pass assistantdb
```

### Réinitialiser la base
```bash
docker-compose down -v && docker-compose up -d
```

## ⚠️ Note importante

**Ceci est un POC de démonstration, pas un projet production.**

Principes POC respectés :
- Code simple et direct
- Pas de sur-ingénierie
- Focus sur la démonstration fonctionnelle
- "Make it work, not perfect"

## 📝 Variables d'environnement

Fichier `.env` requis :
```bash
# Projet
PROJECT_NAME=ai-marketing-assistant

# OpenAI (OBLIGATOIRE)
OPENAI_API_KEY=sk-...

# Base de données
DB_HOST=db
DB_PORT=3306
DB_USER=assistant
DB_PASS=assistant_pass
DB_NAME=assistantdb

# Flask
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🐛 Dépannage

**Le backend ne démarre pas** : Vérifiez que `OPENAI_API_KEY` est défini dans `.env`

**Erreur de connexion DB** : Attendez 10-15 secondes que MariaDB soit prêt, puis `docker-compose restart backend`

**Port déjà utilisé** : Modifiez les ports dans `docker-compose.yml`

**Données manquantes** : Recréez la base avec `docker-compose down -v && docker-compose up -d`
