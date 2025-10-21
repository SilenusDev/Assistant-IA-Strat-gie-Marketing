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
  // Retirer le message de sélection de config
  chatStore.removeMessage("config_selection");
  
  await configurationStore.selectConfiguration(configId);
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: `✅ Configuration prête ! Définissons maintenant vos objectifs (maximum 2).

Je vous propose des objectifs pertinents basés sur votre scénario...`,
    createdAt: new Date()
  });
  
  chatStore.addMessage({
    id: "objectif_flow",
    author: "assistant",
    content: "objectif_flow",
    createdAt: new Date()
  });
};

export const handleNextToCibles = async () => {
  // Retirer le flow objectifs
  chatStore.removeMessage("objectif_flow");
  
  chatStore.addMessage({
    id: nanoid(),
    author: "assistant",
    content: `👍 Excellent choix ! Passons maintenant aux cibles (maximum 3).

Je vous propose des personas adaptés à vos objectifs...`,
    createdAt: new Date()
  });
  
  chatStore.addMessage({
    id: "cible_flow",
    author: "assistant",
    content: "cible_flow",
    createdAt: new Date()
  });
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
