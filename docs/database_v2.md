# Base de données V2

## Structure

```
Scenario (1) ──→ (N) Configuration
                      ↓
                      ├─ (N-N) Objectifs
                      ├─ (N-N) Cibles
                      └─ (1-N) Plans
                               └─ (1-N) Articles
```

## Tables créées
- `configurations` - Versions/variantes de scénarios
- `configuration_objectifs` - Pivot Configuration ↔ Objectifs
- `configuration_cibles` - Pivot Configuration ↔ Cibles
- `articles` - Articles liés aux plans

## Tables supprimées
- ❌ `ressources`
- ❌ `scenario_ressources`
- ❌ `scenario_objectifs` (remplacée)
- ❌ `scenario_cibles` (remplacée)

## Modifications
- `plans` : `scenario_id` → `configuration_id`
- `messages` : ajout de `configuration_id`

## Données initiales
- 8 scénarios
- 1 configuration par défaut par scénario
- 8 objectifs
- 8 cibles
