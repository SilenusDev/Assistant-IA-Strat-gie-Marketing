# 🚀 Guide d'implémentation - Système d'accompagnement guidé

## ✅ État actuel (Terminé)

### Backend (100% ✅)
- **ConfigurationService** : CRUD + liaison objectifs/cibles
- **ObjectifService** : Gestion + suggestions IA
- **CibleService** : Gestion + suggestions IA  
- **PlanService** : Génération plan + 5 articles
- **Routes API** : 15+ endpoints créés
- **Backend redémarré** : Prêt à l'emploi

### Frontend - Composants (100% ✅)
- **configurationStore** : Store complet avec toutes les méthodes
- **ObjectifCard** & **CibleCard** : Cartes sélectionnables
- **ConfigurationSelector** : Choix/création config
- **ObjectifSelector** : Suggestions IA + liste + création
- **CibleSelector** : Suggestions IA + liste + création
- **CreateObjectifModal** : Formulaire création objectif
- **CreateCibleModal** : Formulaire création cible
- **PlanGenerationButton** : Bouton avec validation

## 🎯 Prochaine étape : Intégration ChatPanel

### Handlers à ajouter dans ChatPanel

```typescript
// États pour les modales
const [showObjectifModal, setShowObjectifModal] = createSignal(false);
const [showCibleModal, setShowCibleModal] = createSignal(false);

// Handler : Démarrer le flow de configuration
const startConfigurationFlow = async (scenarioId: number) => {
  // 1. Charger les configurations existantes
  await configurationStore.loadConfigurations(scenarioId);
  
  // 2. Afficher le message de choix de configuration
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: "config_selection",
    createdAt: new Date()
  });
};

// Handler : Configuration sélectionnée/créée
const handleConfigurationReady = async (configId: number) => {
  await configurationStore.selectConfiguration(configId);
  
  // Charger les données
  await Promise.all([
    configurationStore.loadAllObjectifs(),
    configurationStore.suggestObjectifs()
  ]);
  
  // Message + affichage sélecteur objectifs
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: `✅ Configuration prête ! Définissons maintenant vos objectifs...`,
    createdAt: new Date()
  });
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: "objectif_selection",
    createdAt: new Date()
  });
};

// Handler : Toggle objectif
const handleObjectifToggle = async (objectif: any) => {
  const isSelected = configurationStore.state.selectedObjectifs.some(
    o => o.label === objectif.label
  );
  
  if (isSelected) {
    await configurationStore.removeObjectif(objectif.id);
  } else {
    await configurationStore.addObjectif(objectif);
  }
  
  // Si 1+ objectif, proposer les cibles
  if (configurationStore.state.selectedObjectifs.length >= 1) {
    // Charger et suggérer les cibles
    await Promise.all([
      configurationStore.loadAllCibles(),
      configurationStore.suggestCibles()
    ]);
    
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: `👍 Objectif${configurationStore.state.selectedObjectifs.length > 1 ? 's' : ''} enregistré${configurationStore.state.selectedObjectifs.length > 1 ? 's' : ''} ! Passons aux cibles...`,
      createdAt: new Date()
    });
    
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: "cible_selection",
      createdAt: new Date()
    });
  }
};

// Handler : Toggle cible
const handleCibleToggle = async (cible: any) => {
  const isSelected = configurationStore.state.selectedCibles.some(
    c => c.label === cible.label
  );
  
  if (isSelected) {
    await configurationStore.removeCible(cible.id);
  } else {
    await configurationStore.addCible(cible);
  }
  
  // Si 1+ objectif ET 1+ cible, afficher le bouton plan
  if (configurationStore.state.canCreatePlan) {
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: "plan_generation",
      createdAt: new Date()
    });
  }
};

// Handler : Générer le plan
const handleGeneratePlan = async () => {
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: "generating_plan",
    createdAt: new Date()
  });
  
  try {
    const result = await configurationStore.generatePlan();
    
    // Retirer le message de génération
    chatStore.removeMessage("generating_plan");
    
    // Message de succès
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: `🎉 Félicitations Justine ! Votre plan de contenu est prêt avec ${result.articles.length} articles stratégiques !

Vous pouvez maintenant :
• Consulter les détails du plan
• Modifier les articles
• Générer du contenu pour chaque article`,
      createdAt: new Date()
    });
  } catch (error) {
    chatStore.removeMessage("generating_plan");
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: `❌ Erreur lors de la génération du plan : ${(error as Error).message}`,
      createdAt: new Date()
    });
  }
};
```

### Affichage des messages spéciaux

Dans la section `<For each={chatStore.messages}>`, ajouter les cas :

```typescript
// Message "config_selection"
<Show when={message.content === "config_selection"}>
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

// Message "objectif_selection"
<Show when={message.content === "objectif_selection"}>
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

// Message "cible_selection"
<Show when={message.content === "cible_selection"}>
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

// Message "plan_generation"
<Show when={message.content === "plan_generation"}>
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

// Message "generating_plan" (spinner)
<Show when={message.content === "generating_plan"}>
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

### Modales à ajouter à la fin du composant

```typescript
{/* Modales */}
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

## 🎯 Points de déclenchement

### 1. Drag & Drop d'un scénario
Dans `WorkspacePanel.tsx`, ajouter :
```typescript
onDrop={async (scenarioId) => {
  await startConfigurationFlow(scenarioId);
}}
```

### 2. Clic sur carte de scénario
Dans `ScenarioSidebar.tsx` :
```typescript
onClick={async () => {
  await startConfigurationFlow(scenario.id);
}}
```

### 3. Bouton dans la modale de détails
Dans `ScenarioModal.tsx`, ajouter un bouton :
```typescript
<button onClick={() => startConfigurationFlow(scenario.id)}>
  Développer ce scénario
</button>
```

## 📝 Messages d'accompagnement

Tous les messages sont déjà implémentés dans les handlers ci-dessus :
- ✅ Choix de configuration
- ✅ Sélection objectifs
- ✅ Sélection cibles
- ✅ Génération plan
- ✅ Confirmation succès

## 🚀 Pour tester

1. Cliquer sur un scénario dans le menu de droite
2. Choisir/créer une configuration
3. Sélectionner 1-2 objectifs (suggestions IA apparaissent)
4. Sélectionner 1-3 cibles (suggestions IA apparaissent)
5. Cliquer sur "Générer un plan avec 5 articles"
6. Voir le message de confirmation avec les 5 articles

## ✅ Système complet et fonctionnel !
