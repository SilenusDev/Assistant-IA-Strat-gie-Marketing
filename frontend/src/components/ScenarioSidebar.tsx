import { For, Show, createSignal } from "solid-js";
import { GripVertical } from "lucide-solid";

import { scenarioStore } from "../stores/scenarioStore";
import { ScenarioModal } from "./ScenarioModal";
import { fetchScenarioDetail, deleteScenario } from "../api/client";
import type { ScenarioDetail } from "../types";

export function ScenarioSidebar() {
  const [showCreate, setShowCreate] = createSignal(false);
  const [nom, setNom] = createSignal("");
  const [thematique, setThematique] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  
  const [modalOpen, setModalOpen] = createSignal(false);
  const [modalScenario, setModalScenario] = createSignal<ScenarioDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = createSignal(false);

  const detail = () => scenarioStore.state.selectedScenario;

  const handleCardClick = async (scenarioId: number) => {
    setIsLoadingDetail(true);
    try {
      const fullScenario = await fetchScenarioDetail(scenarioId);
      setModalScenario(fullScenario);
      setModalOpen(true);
    } catch (err) {
      console.error("Erreur lors du chargement du scénario:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteScenario(id);
      await scenarioStore.refreshScenarios();
      setModalOpen(false);
      setModalScenario(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  };

  return (
    <aside class="flex h-full flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-100">Scénarios</h2>
        <button
          class="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
          onClick={() => setShowCreate((value) => !value)}
        >
          {showCreate() ? "Fermer" : "Créer"}
        </button>
      </div>
      <Show when={showCreate()}>
        <form
          class="space-y-2 rounded-lg border border-slate-800 bg-slate-900 p-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);
            setError(null);
            try {
              await scenarioStore.createScenario({
                nom: nom(),
                thematique: thematique(),
                description: description() || undefined
              });
              setNom("");
              setThematique("");
              setDescription("");
              setShowCreate(false);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div class="space-y-2">
            <input
              type="text"
              value={nom()}
              onInput={(event) => setNom(event.currentTarget.value)}
              placeholder="Nom du scénario"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-primary focus:outline-none"
              required
            />
            <input
              type="text"
              value={thematique()}
              onInput={(event) => setThematique(event.currentTarget.value)}
              placeholder="Thématique"
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-primary focus:outline-none"
              required
            />
            <textarea
              value={description()}
              onInput={(event) => setDescription(event.currentTarget.value)}
              placeholder="Description (optionnel)"
              rows={3}
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-primary focus:outline-none"
            />
          </div>
          <Show when={error()}>
            {(message) => <p class="text-xs text-red-400">{message}</p>}
          </Show>
          <button
            type="submit"
            class="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
            disabled={isSubmitting()}
          >
            Créer
          </button>
        </form>
      </Show>
      <div class="flex-1 space-y-2 overflow-y-auto">
        <For each={scenarioStore.state.scenarios}>
          {(scenario) => (
            <button
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer!.effectAllowed = "move";
                e.dataTransfer!.setData("scenarioId", scenario.id.toString());
              }}
              class="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-left text-sm text-slate-200 transition hover:border-primary hover:bg-slate-800 cursor-pointer"
              classList={{
                "border-primary text-white": detail()?.id === scenario.id
              }}
              onClick={() => handleCardClick(scenario.id)}
            >
              <p class="font-semibold flex items-center gap-2">
                <GripVertical size={16} class="text-slate-500" />
                {scenario.nom}
              </p>
              <p class="text-xs text-slate-400">{scenario.thematique}</p>
            </button>
          )}
        </For>
      </div>
      <Show when={detail()}>
        {(scenario) => <ScenarioDetailCard scenario={scenario} />}
      </Show>
      
      {/* Modale de détails */}
      <ScenarioModal
        scenario={modalScenario()}
        isOpen={modalOpen()}
        onClose={() => {
          setModalOpen(false);
          setModalScenario(null);
        }}
        onDelete={handleDelete}
      />
    </aside>
  );
}

function ScenarioDetailCard(props: { scenario: ScenarioDetail }) {
  const { scenario } = props;

  return (
    <div class="space-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
      <header>
        <h3 class="text-base font-semibold text-white">{scenario.nom}</h3>
        <p class="text-xs text-slate-400">{scenario.thematique}</p>
      </header>
      <section>
        <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Objectifs
        </h4>
        <ul class="mt-1 space-y-1">
          <For each={scenario.objectifs}>
            {(item) => <li class="text-xs text-slate-300">• {item.label}</li>}
          </For>
        </ul>
      </section>
      <section>
        <h4 class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Cibles
        </h4>
        <ul class="mt-1 space-y-1">
          <For each={scenario.cibles}>
            {(item) => (
              <li class="text-xs text-slate-300">• {item.label} ({item.segment})</li>
            )}
          </For>
        </ul>
      </section>
    </div>
  );
}
