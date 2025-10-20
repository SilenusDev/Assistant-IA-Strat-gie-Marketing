import { For, Show, createSignal } from "solid-js";
import { FileText, Target, Users, Package, CheckCircle, XCircle, X } from "lucide-solid";
import { scenarioStore } from "../stores/scenarioStore";

export function ScenarioStructure() {
  const detail = () => scenarioStore.state.selectedScenario;
  const [isDragOver, setIsDragOver] = createSignal(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const scenarioId = e.dataTransfer?.getData("scenarioId");
    if (scenarioId) {
      scenarioStore.selectScenario(parseInt(scenarioId));
    }
  };

  return (
    <aside class="flex h-full flex-col gap-4">
      <div class="border-b border-slate-800 pb-3">
        <h2 class="text-lg font-semibold text-slate-100">Scénario en cours</h2>
        <p class="text-xs text-slate-400 mt-1">Glissez un scénario pour l'éditer</p>
      </div>

      <Show
        when={detail()}
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
        {(scenario) => (
          <div class="flex-1 flex flex-col gap-4 overflow-y-auto">
            {/* Bouton Retirer */}
            <button
              onClick={() => scenarioStore.setSelectedScenario(null)}
              class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-sm font-medium"
            >
              <X size={16} />
              Retirer de l'édition
            </button>

            <div class="space-y-4">
            {/* Nom du scénario */}
            <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div class="flex items-start gap-2">
                <FileText size={20} class="text-primary mt-0.5" />
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-white">{scenario().nom}</h3>
                  <p class="text-xs text-slate-400 mt-1">{scenario().thematique}</p>
                  <Show when={scenario().description}>
                    <p class="text-xs text-slate-300 mt-2">{scenario().description}</p>
                  </Show>
                </div>
              </div>
            </section>

            {/* Indicateur de progression */}
            <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h4 class="text-sm font-semibold text-slate-100 mb-3">Progression</h4>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs">
                  <CheckCircle size={16} class="text-green-500" />
                  <span class="text-slate-300">Nom défini</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  {scenario().objectifs && scenario().objectifs.length > 0 ? (
                    <CheckCircle size={16} class="text-green-500" />
                  ) : (
                    <XCircle size={16} class="text-slate-600" />
                  )}
                  <span class="text-slate-300">Objectifs ({scenario().objectifs?.length || 0})</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  {scenario().cibles && scenario().cibles.length > 0 ? (
                    <CheckCircle size={16} class="text-green-500" />
                  ) : (
                    <XCircle size={16} class="text-slate-600" />
                  )}
                  <span class="text-slate-300">Cibles ({scenario().cibles?.length || 0})</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  {scenario().ressources && scenario().ressources.length > 0 ? (
                    <CheckCircle size={16} class="text-green-500" />
                  ) : (
                    <XCircle size={16} class="text-slate-600" />
                  )}
                  <span class="text-slate-300">Ressources ({scenario().ressources?.length || 0})</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  {scenario().statut === 'ready' ? (
                    <CheckCircle size={16} class="text-green-500" />
                  ) : (
                    <XCircle size={16} class="text-slate-600" />
                  )}
                  <span class="text-slate-300">Plan généré</span>
                </div>
              </div>
            </section>

            {/* Objectifs */}
            <Show when={scenario().objectifs && scenario().objectifs.length > 0}>
              <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div class="flex items-center gap-2 mb-3">
                  <Target size={18} class="text-blue-400" />
                  <h4 class="text-sm font-semibold text-slate-100">Objectifs</h4>
                  <span class="ml-auto text-xs text-slate-500">
                    {scenario().objectifs?.length || 0}
                  </span>
                </div>
                <ul class="space-y-2">
                  <For each={scenario().objectifs}>
                    {(item) => (
                      <li class="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle size={14} class="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            </Show>

            {/* Cibles */}
            <Show when={scenario().cibles && scenario().cibles.length > 0}>
              <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div class="flex items-center gap-2 mb-3">
                  <Users size={18} class="text-purple-400" />
                  <h4 class="text-sm font-semibold text-slate-100">Cibles</h4>
                  <span class="ml-auto text-xs text-slate-500">
                    {scenario().cibles?.length || 0}
                  </span>
                </div>
                <ul class="space-y-2">
                  <For each={scenario().cibles}>
                    {(item) => (
                      <li class="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle size={14} class="text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p class="font-medium">{item.label}</p>
                          <p class="text-slate-500">{item.segment}</p>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            </Show>

            {/* Ressources */}
            <Show when={scenario().ressources && scenario().ressources.length > 0}>
              <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div class="flex items-center gap-2 mb-3">
                  <Package size={18} class="text-orange-400" />
                  <h4 class="text-sm font-semibold text-slate-100">Ressources</h4>
                  <span class="ml-auto text-xs text-slate-500">
                    {scenario().ressources?.length || 0}
                  </span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <For each={scenario().ressources}>
                    {(item) => (
                      <span class="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                        <CheckCircle size={10} class="text-green-500" />
                        {item.type}
                      </span>
                    )}
                  </For>
                </div>
              </section>
            </Show>

            </div>
          </div>
        )}
      </Show>
    </aside>
  );
}
