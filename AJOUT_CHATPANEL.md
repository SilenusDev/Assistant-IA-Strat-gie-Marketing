# Code à ajouter dans ChatPanel.tsx

## Après la ligne `when={message.content === "config_selection"}`

Ajouter JUSTE APRÈS `fallback={` :

```tsx
>
  <div class="mr-auto text-left w-full">
    <ConfigurationSelector
      configurations={configurationStore.state.configurations}
      onSelect={handleConfigurationReady}
      onCreateNew={async (nom) => {
        const config = await configurationStore.createConfiguration(
          configurationStore.state.currentScenarioId!,
          nom
        );
        await handleConfigurationReady(config.id);
      }}
    />
  </div>
</Show>
```

## Après la ligne `when={message.content === "objectif_selection"}`

Ajouter :

```tsx
>
  <div class="mr-auto text-left w-full">
    <ObjectifSelector
      suggestedObjectifs={configurationStore.state.suggestedObjectifs}
      allObjectifs={configurationStore.state.allObjectifs}
      selectedObjectifs={configurationStore.state.selectedObjectifs}
      onToggle={handleObjectifToggle}
      onCreateNew={() => setShowObjectifModal(true)}
      maxReached={configurationStore.state.selectedObjectifs.length >= 2}
    />
  </div>
</Show>
```

## Après la ligne `when={message.content === "cible_selection"}`

Ajouter :

```tsx
>
  <div class="mr-auto text-left w-full">
    <CibleSelector
      suggestedCibles={configurationStore.state.suggestedCibles}
      allCibles={configurationStore.state.allCibles}
      selectedCibles={configurationStore.state.selectedCibles}
      onToggle={handleCibleToggle}
      onCreateNew={() => setShowCibleModal(true)}
      maxReached={configurationStore.state.selectedCibles.length >= 3}
    />
  </div>
</Show>
```

## Après la ligne `when={message.content === "plan_generation"}`

Ajouter :

```tsx
>
  <div class="mr-auto text-left w-full">
    <PlanGenerationButton
      canGenerate={configurationStore.state.canCreatePlan}
      isGenerating={configurationStore.state.isLoading}
      onGenerate={handleGeneratePlan}
      objectifsCount={configurationStore.state.selectedObjectifs.length}
      ciblesCount={configurationStore.state.selectedCibles.length}
    />
  </div>
</Show>
```

## Après la ligne `when={message.content === "generating_plan"}`

Ajouter :

```tsx
>
  <div class="mr-auto text-left max-w-xl">
    <div class="inline-block rounded-xl px-4 py-3 text-sm shadow-md bg-slate-800 text-slate-100">
      <div class="flex items-center gap-3">
        <Loader2 size={20} class="animate-spin text-primary" />
        <p>Génération de votre plan de contenu avec 5 articles personnalisés...</p>
      </div>
    </div>
  </div>
</Show>
```

## À la fin du fichier, AVANT le dernier `</div>` et `);`

Ajouter les modales :

```tsx
      {/* Modales de création */}
      <CreateObjectifModal
        isOpen={showObjectifModal()}
        onClose={() => setShowObjectifModal(false)}
        onCreate={async (data) => {
          await configurationStore.createAndAddObjectif(data);
          setShowObjectifModal(false);
        }}
      />

      <CreateCibleModal
        isOpen={showCibleModal()}
        onClose={() => setShowCibleModal(false)}
        onCreate={async (data) => {
          await configurationStore.createAndAddCible(data);
          setShowCibleModal(false);
        }}
      />
```

## Importer les handlers en haut du fichier

Ajouter après les autres imports :

```tsx
import {
  startConfigurationFlow,
  handleConfigurationReady,
  handleObjectifToggle,
  handleCibleToggle,
  handleGeneratePlan
} from "../handlers/configurationHandlers";
```

---

# ⚠️ C'est beaucoup de code !

**Je peux soit :**
1. ✅ Vous guider ligne par ligne (plus sûr)
2. ✅ Créer un nouveau fichier ChatPanel complet
3. ✅ Faire les modifications une par une

**Que préférez-vous ?** 🤔
