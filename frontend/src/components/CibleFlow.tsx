import { Show, createSignal, onMount } from "solid-js";
import { CibleSelector } from "./CibleSelector";
import { CreateCibleModal } from "./CreateCibleModal";
import { LoadingMessage } from "./LoadingMessage";
import { configurationStore } from "../stores/configurationStore";

interface CibleFlowProps {
  onGeneratePlan: () => void;
}

export function CibleFlow(props: CibleFlowProps) {
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [isPersisting, setIsPersisting] = createSignal(false);

  onMount(async () => {
    // Charger les cibles existantes et les suggestions IA automatiquement
    await Promise.all([
      configurationStore.loadAllCibles(),
      configurationStore.suggestCibles()
    ]);
  });

  const handleToggle = async (cible: any) => {
    const isSelected = configurationStore.state.selectedCibles.some(
      (c: any) => c.label === cible.label
    );

    if (isSelected) {
      await configurationStore.removeCible(cible.id);
    } else {
      try {
        await configurationStore.addCible(cible);
      } catch (error) {
        console.error("Erreur ajout cible:", error);
      }
    }
  };

  const handleGeneratePlan = async () => {
    setIsPersisting(true);
    try {
      // Persister les suggestions IA sélectionnées qui n'ont pas encore d'ID
      const selectedSuggestionsWithoutId = configurationStore.state.selectedCibles.filter(
        cible => !cible.id
      );
      
      for (const cible of selectedSuggestionsWithoutId) {
        await configurationStore.createAndAddCible({
          label: cible.label,
          persona: cible.persona,
          segment: cible.segment
        });
      }
      
      // Générer le plan
      props.onGeneratePlan();
    } catch (error) {
      console.error("Erreur persistance cibles:", error);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleCreateNew = async (data: { label: string; persona?: string; segment?: string }) => {
    try {
      await configurationStore.createAndAddCible(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erreur création cible:", error);
    }
  };

  return (
    <div class="space-y-4">
      <Show
        when={!configurationStore.state.isLoading}
        fallback={
          <LoadingMessage message="Chargement des cibles..." />
        }
      >
        <CibleSelector
          suggestedCibles={configurationStore.state.suggestedCibles}
          allCibles={configurationStore.state.allCibles}
          selectedCibles={configurationStore.state.selectedCibles}
          onToggle={handleToggle}
          onCreateNew={() => setShowCreateModal(true)}
          onGeneratePlan={handleGeneratePlan}
          maxReached={configurationStore.state.selectedCibles.length >= 3}
        />
      </Show>

      <CreateCibleModal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNew}
      />
    </div>
  );
}
