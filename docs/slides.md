# Présentation POC - Assistant IA Stratégie Marketing

**10 minutes | Équipe technique + Jury académique**

---

## Slide 1 : POC Assistant IA - Stratégie Marketing

- **Problème** : 4-6h/semaine pour définir stratégies marketing
- **Solution** : Assistant conversationnel pour co-construire scénarios
- **POC** : 3 jours de développement
- **Client** : INVOX - Agence Demand Generation B2B

---

## Slide 2 : Le Besoin - Justine (Responsable Marketing)

- Définition sujets/angles : **4-6h/semaine**
- Pas de vision complète des dispositifs
- Besoin d'aide sur formats, angles et diffusion

> "J'ai besoin d'un outil où je pose mon contexte et il me guide"

---

## Slide 3 : Solution - Assistant Stratégie Marketing

**Flow en 4 étapes**
1. Création configuration (nom + thématique)
2. Définition objectifs (max 2) - **IA propose**
3. Définition cibles (max 3) - **IA propose**
4. **Génération automatique plan de diffusion** (5 articles)

---

## Slide 4 : Interface Hybride

- Chat conversationnel + boutons contextuels
- Suggestions IA + validation utilisateur
- Accompagnement à chaque étape
- Sauvegarde progressive

---

## Slide 5 : Stack Technique

**Architecture Docker**
- Frontend : SolidJS + TailwindCSS
- Backend : Flask + OpenAI API
- Base de données : MariaDB

**Modèle** : Scénarios → Configurations → Objectifs/Cibles → Plans → Articles

---

## Slide 6 : Mode Agentique IA

**Flow génération**
1. Action utilisateur → Backend récupère contexte
2. Construction prompt contextualisé
3. Appel OpenAI (GPT-4o-mini)
4. Parsing JSON + validation
5. Enregistrement + affichage

**Exemple prompt** : "Génère 5 articles pour scénario '{nom}' avec objectifs {X} et cibles {Y}"

---

## Slide 7 : Impact & ROI

**Gains**
- 15-20h/mois gagnées
- 19 500€/an valorisés
- Suppression tâches détestées
- Vision complète dispositifs marketing

---

## Slide 8 : Roadmap

**POC (3 jours)** ✅
- Génération plan + chat + export

**MVP (4 semaines)**
- Analyse corpus + exports Notion

**v1 (2 semaines)**
- Budget + calendrier + connecteurs

---

## Slide 9 : Risques & Limitations

**Risques**
- Adoption équipe (Formation intensive)
- Qualité IA (Tests + validation)
- Coûts API (Monitoring)

**Limitations POC**
- Pas d'authentification
- Flow linéaire simplifié

---

## Slide 10 : Conclusion

**Objectifs atteints**
- ✅ POC fonctionnel en 3 jours
- ✅ Validation besoin utilisateur
- ✅ Architecture scalable

**Prochaines étapes**
- Démo avec Justine
- Décision Go/No-Go
- Phase MVP si validation

---

**Merci !**

Questions ?
