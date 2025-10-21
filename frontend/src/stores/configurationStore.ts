import { createStore } from "solid-js/store";
import type { Configuration, ConfigurationDetail } from "../types";
import { request } from "../api/client";

interface Objectif {
  id: number;
  label: string;
  description?: string;
}

interface Cible {
  id: number;
  label: string;
  persona?: string;
  segment?: string;
}

interface ConfigurationStoreState {
  selectedConfiguration: ConfigurationDetail | null;
  currentScenarioId: number | null;
  currentConfigId: number | null;
  configurations: Configuration[];
  
  // Objectifs
  allObjectifs: Objectif[];
  suggestedObjectifs: Objectif[];
  selectedObjectifs: Objectif[];
  
  // Cibles
  allCibles: Cible[];
  suggestedCibles: Cible[];
  selectedCibles: Cible[];
  
  // État
  canCreatePlan: boolean;
  isLoading: boolean;
}

const [state, setState] = createStore<ConfigurationStoreState>({
  selectedConfiguration: null,
  currentScenarioId: null,
  currentConfigId: null,
  configurations: [],
  allObjectifs: [],
  suggestedObjectifs: [],
  selectedObjectifs: [],
  allCibles: [],
  suggestedCibles: [],
  selectedCibles: [],
  canCreatePlan: false,
  isLoading: false
});

// ============================================
// CONFIGURATIONS
// ============================================

async function loadConfigurations(scenarioId: number) {
  setState({ isLoading: true });
  try {
    const response = await request(`/api/scenarios/${scenarioId}/configurations`);
    setState({ configurations: response, currentScenarioId: scenarioId });
  } catch (error) {
    console.error("Erreur chargement configurations:", error);
  } finally {
    setState({ isLoading: false });
  }
}

async function createConfiguration(scenarioId: number, nom: string) {
  setState({ isLoading: true });
  try {
    const response = await request(`/api/scenarios/${scenarioId}/configurations`, {
      method: "POST",
      body: JSON.stringify({ nom })
    });
    setState({ 
      currentConfigId: response.id,
      configurations: [...state.configurations, response]
    });
    return response;
  } catch (error) {
    console.error("Erreur création configuration:", error);
    throw error;
  } finally {
    setState({ isLoading: false });
  }
}

async function selectConfiguration(configId: number) {
  setState({ isLoading: true, currentConfigId: configId });
  try {
    const response = await request(`/api/configurations/${configId}`);
    setState({ 
      selectedConfiguration: response,
      selectedObjectifs: response.objectifs || [],
      selectedCibles: response.cibles || []
    });
    await checkCanCreatePlan();
  } catch (error) {
    console.error("Erreur sélection configuration:", error);
  } finally {
    setState({ isLoading: false });
  }
}

// ============================================
// OBJECTIFS
// ============================================

async function loadAllObjectifs() {
  try {
    const response = await request("/api/objectifs");
    setState({ allObjectifs: response.objectifs || [] });
  } catch (error) {
    console.error("Erreur chargement objectifs:", error);
  }
}

async function suggestObjectifs() {
  if (!state.currentConfigId) return;
  
  setState({ isLoading: true });
  try {
    const response = await request(
      `/api/configurations/${state.currentConfigId}/suggest-objectifs`,
      { method: "POST" }
    );
    setState({ suggestedObjectifs: response.objectifs || [] });
  } catch (error) {
    console.error("Erreur suggestion objectifs:", error);
  } finally {
    setState({ isLoading: false });
  }
}

async function addObjectif(objectif: Objectif) {
  if (!state.currentConfigId) return;
  if (state.selectedObjectifs.length >= 2) {
    throw new Error("Maximum 2 objectifs autorisés");
  }
  
  setState({ isLoading: true });
  try {
    await request(`/api/configurations/${state.currentConfigId}/objectifs`, {
      method: "POST",
      body: JSON.stringify({
        label: objectif.label,
        description: objectif.description
      })
    });
    
    setState({ 
      selectedObjectifs: [...state.selectedObjectifs, objectif]
    });
    await checkCanCreatePlan();
  } catch (error) {
    console.error("Erreur ajout objectif:", error);
    throw error;
  } finally {
    setState({ isLoading: false });
  }
}

async function removeObjectif(objectifId: number) {
  if (!state.currentConfigId) return;
  
  try {
    await request(
      `/api/configurations/${state.currentConfigId}/objectifs/${objectifId}`,
      { method: "DELETE" }
    );
    
    setState({ 
      selectedObjectifs: state.selectedObjectifs.filter(o => o.id !== objectifId)
    });
    await checkCanCreatePlan();
  } catch (error) {
    console.error("Erreur suppression objectif:", error);
    throw error;
  }
}

async function createAndAddObjectif(data: { label: string; description?: string }) {
  // Créer l'objectif global
  const response = await request("/api/objectifs", {
    method: "POST",
    body: JSON.stringify(data)
  });
  
  // L'ajouter à la configuration
  await addObjectif(response);
  
  // Rafraîchir la liste globale
  await loadAllObjectifs();
}

// ============================================
// CIBLES
// ============================================

async function loadAllCibles() {
  try {
    const response = await request("/api/cibles");
    setState({ allCibles: response.cibles || [] });
  } catch (error) {
    console.error("Erreur chargement cibles:", error);
  }
}

async function suggestCibles() {
  if (!state.currentConfigId) return;
  
  setState({ isLoading: true });
  try {
    const response = await request(
      `/api/configurations/${state.currentConfigId}/suggest-cibles`,
      { method: "POST" }
    );
    setState({ suggestedCibles: response.cibles || [] });
  } catch (error) {
    console.error("Erreur suggestion cibles:", error);
  } finally {
    setState({ isLoading: false });
  }
}

async function addCible(cible: Cible) {
  if (!state.currentConfigId) return;
  if (state.selectedCibles.length >= 3) {
    throw new Error("Maximum 3 cibles autorisées");
  }
  
  setState({ isLoading: true });
  try {
    await request(`/api/configurations/${state.currentConfigId}/cibles`, {
      method: "POST",
      body: JSON.stringify({
        label: cible.label,
        persona: cible.persona,
        segment: cible.segment
      })
    });
    
    setState({ 
      selectedCibles: [...state.selectedCibles, cible]
    });
    await checkCanCreatePlan();
  } catch (error) {
    console.error("Erreur ajout cible:", error);
    throw error;
  } finally {
    setState({ isLoading: false });
  }
}

async function removeCible(cibleId: number) {
  if (!state.currentConfigId) return;
  
  try {
    await request(
      `/api/configurations/${state.currentConfigId}/cibles/${cibleId}`,
      { method: "DELETE" }
    );
    
    setState({ 
      selectedCibles: state.selectedCibles.filter(c => c.id !== cibleId)
    });
    await checkCanCreatePlan();
  } catch (error) {
    console.error("Erreur suppression cible:", error);
    throw error;
  }
}

async function createAndAddCible(data: { label: string; persona?: string; segment?: string }) {
  // Créer la cible globale
  const response = await request("/api/cibles", {
    method: "POST",
    body: JSON.stringify(data)
  });
  
  // L'ajouter à la configuration
  await addCible(response);
  
  // Rafraîchir la liste globale
  await loadAllCibles();
}

// ============================================
// PLAN
// ============================================

async function checkCanCreatePlan() {
  if (!state.currentConfigId) return;
  
  try {
    const response = await request(
      `/api/configurations/${state.currentConfigId}/can-create-plan`
    );
    setState({ canCreatePlan: response.can_create_plan });
  } catch (error) {
    console.error("Erreur vérification plan:", error);
  }
}

async function generatePlan() {
  if (!state.currentConfigId) return;
  
  setState({ isLoading: true });
  try {
    const response = await request(
      `/api/configurations/${state.currentConfigId}/generate-plan`,
      { method: "POST" }
    );
    return response;
  } catch (error) {
    console.error("Erreur génération plan:", error);
    throw error;
  } finally {
    setState({ isLoading: false });
  }
}

// ============================================
// RESET
// ============================================

function reset() {
  setState({
    selectedConfiguration: null,
    currentScenarioId: null,
    currentConfigId: null,
    configurations: [],
    allObjectifs: [],
    suggestedObjectifs: [],
    selectedObjectifs: [],
    allCibles: [],
    suggestedCibles: [],
    selectedCibles: [],
    canCreatePlan: false,
    isLoading: false
  });
}

function setSelectedConfiguration(config: ConfigurationDetail | null) {
  setState({ selectedConfiguration: config });
}

export const configurationStore = {
  state,
  
  // Configurations
  loadConfigurations,
  createConfiguration,
  selectConfiguration,
  
  // Objectifs
  loadAllObjectifs,
  suggestObjectifs,
  addObjectif,
  removeObjectif,
  createAndAddObjectif,
  
  // Cibles
  loadAllCibles,
  suggestCibles,
  addCible,
  removeCible,
  createAndAddCible,
  
  // Plan
  checkCanCreatePlan,
  generatePlan,
  
  // Utilitaires
  reset,
  setSelectedConfiguration
};
