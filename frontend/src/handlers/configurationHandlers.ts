/**
 * Handlers pour le flow de configuration guidée
 * À importer dans ChatPanel.tsx
 */

import { nanoid } from "nanoid";
import { configurationStore } from "../stores/configurationStore";
import { chatStore } from "../stores/chatStore";
import { progressStore } from "../stores/progressStore";

export const startConfigurationFlow = async (scenarioId: number) => {
  // Réinitialiser la progression
  progressStore.reset();
  progressStore.setStep(0); // Étape configuration
  
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
    id: "config_selection",
    author: "assistant",
    content: "config_selection",
    createdAt: new Date()
  });
};

export const handleConfigurationReady = async (configId: number) => {
  await configurationStore.selectConfiguration(configId);
  
  // Mettre à jour la progression
  progressStore.setConfigCompleted(true);
  progressStore.setStep(1); // Étape objectifs
  
  // Clear du chat et message de succès
  const successId = chatStore.addSuccessMessage(
    "🎉 Parfait Justine ! Votre configuration est prête. Passons aux objectifs !"
  );
  chatStore.clearMessages([successId]);
  
  chatStore.addMessage({
    id: "objectif_flow",
    author: "assistant",
    content: "objectif_flow",
    createdAt: new Date()
  });
};

export const handleNextToCibles = async () => {
  // Mettre à jour la progression
  progressStore.setObjectifsCount(configurationStore.state.selectedObjectifs.length);
  progressStore.setStep(2); // Étape cibles
  
  // Clear du chat et message de succès
  const successId = chatStore.addSuccessMessage(
    "👏 Excellent choix ! Vos objectifs sont bien définis. Place aux cibles !"
  );
  chatStore.clearMessages([successId]);
  
  chatStore.addMessage({
    id: "cible_flow",
    author: "assistant",
    content: "cible_flow",
    createdAt: new Date()
  });
};


export const handleGeneratePlan = async () => {
  // Mettre à jour la progression
  progressStore.setCiblesCount(configurationStore.state.selectedCibles.length);
  
  // Clear du chat et message de succès
  const successId = chatStore.addSuccessMessage(
    "🚀 Bravo ! Votre stratégie prend forme. Générons votre plan maintenant !"
  );
  chatStore.clearMessages([successId]);
  
  // Afficher spinner de génération
  chatStore.addMessage({
    id: "generating_plan",
    author: "assistant",
    content: "⏳ Génération de votre plan marketing en cours...",
    createdAt: new Date()
  });
  
  try {
    const result = await configurationStore.generatePlan();
    
    // Mettre à jour la progression
    progressStore.setPlanGenerated(true);
    
    // Clear et afficher le récapitulatif
    chatStore.clearMessages([]);
    
    chatStore.addMessage({
      id: "plan_summary",
      author: "assistant",
      content: "plan_summary",
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

export const handleNewStrategy = () => {
  // Réinitialiser tout pour une nouvelle stratégie
  progressStore.reset();
  chatStore.resetChat();
  configurationStore.state.currentScenarioId = null;
  configurationStore.state.currentConfigId = null;
};
