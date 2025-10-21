import { Show, createSignal, onMount } from "solid-js";
import { Loader2 } from "lucide-solid";
import { ObjectifSelector } from "./ObjectifSelector";
import { CreateObjectifModal } from "./CreateObjectifModal";
import { configurationStore } from "../stores/configurationStore";

interface ObjectifFlowProps {
  onNextStep: () => void;
}

export function ObjectifFlow(props: ObjectifFlowProps) {
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [isPersisting, setIsPersisting] = createSignal(false);

  onMount(async () => {
    // Charger les objectifs existants et les suggestions IA automatiquement
    await Promise.all([
      configurationStore.loadAllObjectifs(),
      configurationStore.suggestObjectifs()
    ]);
  });

  const handleToggle = async (objectif: any) => {
    const isSelected = configurationStore.state.selectedObjectifs.some(
      (o: any) => o.label === objectif.label
    );

    if (isSelected) {
      await configurationStore.removeObjectif(objectif.id);
    } else {
      try {
        await configurationStore.addObjectif(objectif);
      } catch (error) {
        console.error("Erreur ajout objectif:", error);
      }
    }
  };

  const handleNextStep = async () => {
    setIsPersisting(true);
    try {
      // Persister les suggestions IA sélectionnées qui n'ont pas encore d'ID
      const selectedSuggestionsWithoutId = configurationStore.state.selectedObjectifs.filter(
        obj => !obj.id
      );
      
      for (const objectif of selectedSuggestionsWithoutId) {
        await configurationStore.createAndAddObjectif({
          label: objectif.label,
          description: objectif.description
        });
      }
      
      // Passer à l'étape suivante
      props.onNextStep();
    } catch (error) {
      console.error("Erreur persistance objectifs:", error);
    } finally {
      setIsPersisting(false);
    }
  };

  const handleCreateNew = async (data: { label: string; description?: string }) => {
    try {
      await configurationStore.createAndAddObjectif(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erreur création objectif:", error);
    }
  };

  return (
    <div class="space-y-4">
      <Show
        when={!configurationStore.state.isLoading}
        fallback={
          <div class="flex items-center justify-center gap-3 p-6">
            <Loader2 size={24} class="animate-spin text-primary" />
            <p class="text-sm text-slate-400">Chargement des objectifs...</p>
          </div>
        }
      >
        <ObjectifSelector
          suggestedObjectifs={configurationStore.state.suggestedObjectifs}
          allObjectifs={configurationStore.state.allObjectifs}
          selectedObjectifs={configurationStore.state.selectedObjectifs}
          onToggle={handleToggle}
          onCreateNew={() => setShowCreateModal(true)}
          onNextStep={handleNextStep}
          maxReached={configurationStore.state.selectedObjectifs.length >= 2}
        />
      </Show>

      <CreateObjectifModal
        isOpen={showCreateModal()}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateNew}
      />
    </div>
  );
}
