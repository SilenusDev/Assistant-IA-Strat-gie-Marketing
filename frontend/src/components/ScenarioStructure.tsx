import { For, Show, createSignal, createResource } from "solid-js";
import { FileText, X, Settings, Eye, Target, Users } from "lucide-solid";
import { scenarioStore } from "../stores/scenarioStore";
import { configurationStore } from "../stores/configurationStore";
import { listConfigurations, fetchConfigurationDetail, createConfiguration } from "../api/client";
import { ProgressIndicator } from "./ProgressIndicator";
import { ConfigurationModal } from "./ConfigurationModal";
import { startConfigurationFlow } from "../handlers/configurationHandlers";
import type { Configuration } from "../types";

export function ScenarioStructure() {
  const scenario = () => scenarioStore.state.selectedScenario;
  const selectedConfig = () => configurationStore.state.selectedConfiguration;
  const [isDragOver, setIsDragOver] = createSignal(false);
  const [showCreateForm, setShowCreateForm] = createSignal(false);
  const [newConfigName, setNewConfigName] = createSignal("");
  const [isCreating, setIsCreating] = createSignal(false);
  const [showConfigModal, setShowConfigModal] = createSignal(false);
  const [modalConfig, setModalConfig] = createSignal<any>(null);

  // Charger les configurations du scénario
  const [configurations] = createResource(
    () => scenario()?.id,
    async (scenarioId) => {
      if (!scenarioId) return [];
      return await listConfigurations(scenarioId);
    }
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const scenarioId = e.dataTransfer?.getData("scenarioId");
    if (scenarioId) {
      const id = parseInt(scenarioId);
      scenarioStore.selectScenario(id);
      configurationStore.setSelectedConfiguration(null);
      
      // 🎯 DÉCLENCHEMENT DE L'ACCOMPAGNEMENT IA
      await startConfigurationFlow(id);
    }
  };

  const handleSelectConfiguration = async (configId: number) => {
    try {
      const detail = await fetchConfigurationDetail(configId);
      configurationStore.setSelectedConfiguration(detail);
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
    }
  };

  const handleCreateConfiguration = async (e: Event) => {
    e.preventDefault();
    if (!scenario() || !newConfigName().trim()) return;

    setIsCreating(true);
    try {
      await createConfiguration(scenario()!.id, { nom: newConfigName() });
      setNewConfigName("");
      setShowCreateForm(false);
      // Recharger les configurations et le scénario
      configurations.refetch();
      scenarioStore.refreshScenarios();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <aside class="flex h-full flex-col gap-4">
      <div class="border-b border-slate-800 pb-3">
        <h2 class="text-lg font-semibold text-slate-100">Scénario en cours</h2>
        <p class="text-xs text-slate-400 mt-1">Glissez un scénario pour l'éditer</p>
      </div>

      <Show
        when={scenario()}
        fallback={
          <div
            class="flex-1 flex items-center justify-center text-center p-6 rounded-xl border-2 border-dashed transition-all"
            classList={{
              "border-slate-700 bg-slate-900/20": !isDragOver(),
              "border-primary bg-primary/10 scale-[1.02]": isDragOver()
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div class="space-y-3">
              <FileText size={48} class="text-slate-600 mx-auto" />
              <p class="text-sm text-slate-400 font-medium">
                Glissez un scénario existant
              </p>
              <p class="text-xs text-slate-500">
                depuis la liste de droite
              </p>
            </div>
          </div>
        }
      >
        {(currentScenario) => (
          <div class="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Bouton Retirer */}
            <button
              onClick={() => {
                scenarioStore.setSelectedScenario(null);
                configurationStore.setSelectedConfiguration(null);
              }}
              class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
            >
              <X size={16} />
              Retirer de l'édition
            </button>

            {/* Carte scénario simplifiée */}
            <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div class="flex items-start gap-2">
                <FileText size={20} class="text-primary mt-0.5" />
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-white">{currentScenario().nom}</h3>
                  <p class="text-xs text-slate-400 mt-1">{currentScenario().thematique}</p>
                </div>
              </div>
            </section>

            {/* Gestion des configurations */}
            <Show
              when={!selectedConfig()}
              fallback={
                <div class="space-y-4">
                  {/* Bouton retour */}
                  <button
                    onClick={() => configurationStore.setSelectedConfiguration(null)}
                    class="text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    ← Retour aux configurations
                  </button>

                  {/* Progression */}
                  <ProgressIndicator configuration={selectedConfig()!} />

                  {/* Objectifs */}
                  <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <div class="flex items-center gap-2 mb-3">
                      <Target size={16} class="text-blue-400" />
                      <h4 class="text-sm font-semibold text-slate-100">Objectifs</h4>
                      <span class="text-xs text-slate-500">
                        ({selectedConfig()!.objectifs?.length || 0})
                      </span>
                    </div>
                    <Show
                      when={selectedConfig()!.objectifs && selectedConfig()!.objectifs.length > 0}
                      fallback={<p class="text-xs text-slate-500 italic">Aucun objectif défini</p>}
                    >
                      <ul class="space-y-2">
                        <For each={selectedConfig()!.objectifs}>
                          {(objectif) => (
                            <li class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                              <p class="text-sm font-medium text-slate-200">{objectif.label}</p>
                              <Show when={objectif.description}>
                                <p class="text-xs text-slate-400 mt-1">{objectif.description}</p>
                              </Show>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </section>

                  {/* Cibles */}
                  <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                    <div class="flex items-center gap-2 mb-3">
                      <Users size={16} class="text-purple-400" />
                      <h4 class="text-sm font-semibold text-slate-100">Cibles</h4>
                      <span class="text-xs text-slate-500">
                        ({selectedConfig()!.cibles?.length || 0})
                      </span>
                    </div>
                    <Show
                      when={selectedConfig()!.cibles && selectedConfig()!.cibles.length > 0}
                      fallback={<p class="text-xs text-slate-500 italic">Aucune cible définie</p>}
                    >
                      <ul class="space-y-2">
                        <For each={selectedConfig()!.cibles}>
                          {(cible) => (
                            <li class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                              <p class="text-sm font-medium text-slate-200">{cible.label}</p>
                              <Show when={cible.persona}>
                                <p class="text-xs text-slate-400 mt-1">Persona: {cible.persona}</p>
                              </Show>
                              <Show when={cible.segment}>
                                <p class="text-xs text-slate-400">Segment: {cible.segment}</p>
                              </Show>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </section>
                </div>
              }
            >
              {/* Liste des configurations ou bouton créer */}
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-slate-100">Configurations</h4>

                <Show
                  when={configurations() && configurations()!.length > 0}
                  fallback={
                    <p class="text-xs text-slate-500 italic">Aucune configuration</p>
                  }
                >
                  <div class="space-y-2">
                    <For each={configurations()}>
                      {(config: Configuration) => (
                        <div class="rounded-lg border border-slate-700 bg-slate-800/40 p-3 hover:border-primary/50 transition">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <Settings size={16} class="text-slate-400" />
                              <span class="text-sm text-slate-200">{config.nom}</span>
                            </div>
                            <div class="flex gap-2">
                              <button
                                onClick={async () => {
                                  const detail = await fetchConfigurationDetail(config.id);
                                  setModalConfig(detail);
                                  setShowConfigModal(true);
                                }}
                                class="p-1 rounded hover:bg-slate-700 transition"
                                title="Voir les détails"
                              >
                                <Eye size={16} class="text-slate-400" />
                              </button>
                              <button
                                onClick={() => handleSelectConfiguration(config.id)}
                                class="px-3 py-1 text-xs rounded bg-primary/20 text-primary hover:bg-primary/30 transition"
                              >
                                Sélectionner
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>

                {/* Formulaire de création */}
                <Show
                  when={showCreateForm()}
                  fallback={
                    <button
                      onClick={() => setShowCreateForm(true)}
                      class="w-full px-4 py-2 rounded-lg border-2 border-dashed border-slate-700 text-slate-400 hover:border-primary hover:text-primary transition text-sm"
                    >
                      + Nouvelle configuration
                    </button>
                  }
                >
                  <form onSubmit={handleCreateConfiguration} class="space-y-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                    <input
                      type="text"
                      value={newConfigName()}
                      onInput={(e) => setNewConfigName(e.currentTarget.value)}
                      placeholder="Nom de la configuration"
                      class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                      disabled={isCreating()}
                    />
                    <div class="flex gap-2">
                      <button
                        type="submit"
                        disabled={isCreating() || !newConfigName().trim()}
                        class="flex-1 px-3 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {isCreating() ? "Création..." : "Créer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewConfigName("");
                        }}
                        class="px-3 py-2 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </Show>
              </div>
            </Show>
          </div>
        )}
      </Show>

      {/* Modale de détails de configuration */}
      <ConfigurationModal
        isOpen={showConfigModal()}
        onClose={() => {
          setShowConfigModal(false);
          setModalConfig(null);
        }}
        configuration={modalConfig()}
        onUpdate={async () => {
          // Recharger la configuration dans la modale
          if (modalConfig()) {
            const updated = await fetchConfigurationDetail(modalConfig().id);
            setModalConfig(updated);
          }
          // Recharger la liste des configurations
          configurations.refetch();
        }}
      />
    </aside>
  );
}
