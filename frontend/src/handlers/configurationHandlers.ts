/**
 * Handlers pour le flow de configuration guidée
 * À importer dans ChatPanel.tsx
 */

import { nanoid } from "nanoid";
import { configurationStore } from "../stores/configurationStore";
import { chatStore } from "../stores/chatStore";

export const startConfigurationFlow = async (scenarioId: number) => {
  // Définir le scénario courant dans le store
  configurationStore.state.currentScenarioId = scenarioId;
  
  await configurationStore.loadConfigurations(scenarioId);
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: `🎯 Parfait ! Développons ensemble le scénario.

Pour commencer, souhaitez-vous créer une nouvelle configuration ou utiliser une existante ?`,
    createdAt: new Date()
  });
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: "config_selection",
    createdAt: new Date()
  });
};

export const handleConfigurationReady = async (configId: number) => {
  await configurationStore.selectConfiguration(configId);
  
  await Promise.all([
    configurationStore.loadAllObjectifs(),
    configurationStore.suggestObjectifs()
  ]);
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: `✅ Configuration prête ! Définissons maintenant vos objectifs (maximum 2).

Je vous propose des objectifs pertinents basés sur votre scénario...`,
    createdAt: new Date()
  });
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: "objectif_selection",
    createdAt: new Date()
  });
};

export const handleObjectifToggle = async (objectif: any) => {
  const isSelected = configurationStore.state.selectedObjectifs.some(
    (o: any) => o.label === objectif.label
  );
  
  if (isSelected) {
    await configurationStore.removeObjectif(objectif.id);
  } else {
    try {
      await configurationStore.addObjectif(objectif);
      
      if (configurationStore.state.selectedObjectifs.length === 1) {
        await Promise.all([
          configurationStore.loadAllCibles(),
          configurationStore.suggestCibles()
        ]);
        
        chatStore.addMessage({
          id: nanoid(),
          author: "assistant",
          content: `👍 Excellent choix ! Passons maintenant aux cibles (maximum 3).

Je vous propose des personas adaptés à vos objectifs...`,
          createdAt: new Date()
        });
        
        chatStore.addMessage({
          id: nanoid(),
          author: "assistant",
          content: "cible_selection",
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Erreur ajout objectif:", error);
    }
  }
};

export const handleCibleToggle = async (cible: any) => {
  const isSelected = configurationStore.state.selectedCibles.some(
    (c: any) => c.label === cible.label
  );
  
  if (isSelected) {
    await configurationStore.removeCible(cible.id);
  } else {
    try {
      await configurationStore.addCible(cible);
      
      if (configurationStore.state.canCreatePlan) {
        chatStore.addMessage({
          id: nanoid(),
          author: "assistant",
          content: `✅ Configuration complète !

Vous avez défini :
• ${configurationStore.state.selectedObjectifs.length} objectif(s)
• ${configurationStore.state.selectedCibles.length} cible(s)

Vous pouvez maintenant générer un plan de contenu avec 5 articles personnalisés.`,
          createdAt: new Date()
        });
        
        chatStore.addMessage({
          id: nanoid(),
          author: "assistant",
          content: "plan_generation",
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Erreur ajout cible:", error);
    }
  }
};

export const handleGeneratePlan = async () => {
  const generatingId = nanoid();
  chatStore.addMessage({
    id: generatingId,
    author: "assistant",
    content: "generating_plan",
    createdAt: new Date()
  });
  
  try {
    const result = await configurationStore.generatePlan();
    
    chatStore.removeMessage(generatingId);
    
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: `🎉 Félicitations Justine ! Votre plan de contenu est prêt !

J'ai généré ${result.articles.length} articles stratégiques adaptés à vos objectifs et cibles.

Vous pouvez maintenant :
• Consulter les détails du plan dans la configuration
• Modifier les articles selon vos besoins
• Générer du contenu pour chaque article`,
      createdAt: new Date()
    });
  } catch (error) {
    chatStore.removeMessage(generatingId);
    chatStore.addMessage({
      id: nanoid(),
      author: "assistant",
      content: `❌ Erreur lors de la génération du plan : ${(error as Error).message}`,
      createdAt: new Date()
    });
  }
};
