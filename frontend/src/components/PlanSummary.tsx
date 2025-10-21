import { For, Show } from "solid-js";
import { Download, Sparkles, Target, Users, FileText } from "lucide-solid";
import { scenarioStore } from "../stores/scenarioStore";
import { configurationStore } from "../stores/configurationStore";
import { handleNewStrategy } from "../handlers/configurationHandlers";

export function PlanSummary() {
  const scenario = () => scenarioStore.state.selectedScenario;
  const config = () => {
    const cfg = configurationStore.state.configurations.find(
      c => c.id === configurationStore.state.currentConfigId
    );
    console.log("PlanSummary - config:", cfg);
    console.log("PlanSummary - plans:", cfg?.plans);
    console.log("PlanSummary - articles:", cfg?.plans?.[0]?.articles);
    return cfg;
  };

  const handleDownload = () => {
    // TODO: Implémenter le téléchargement du plan
    console.log("Téléchargement du plan...");
  };

  return (
    <div class="space-y-6 animate-in fade-in duration-500">
      {/* Header avec message de félicitations */}
      <div class="rounded-xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} class="text-white" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-green-400 mb-2">
              ✨ Félicitations Justine ! Votre plan marketing est prêt !
            </h2>
            <p class="text-sm text-slate-300">
              Votre stratégie de contenu est maintenant complète. Découvrez ci-dessous le récapitulatif de votre plan avec les 5 articles générés.
            </p>
          </div>
        </div>
      </div>

      {/* Récapitulatif de la stratégie */}
      <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <FileText size={20} class="text-blue-400" />
          Récapitulatif de votre stratégie
        </h3>

        <div class="space-y-4">
          {/* Scénario */}
          <Show when={scenario()}>
            <div class="rounded-lg bg-slate-800/40 p-4">
              <h4 class="text-sm font-semibold text-slate-200 mb-2">📊 Scénario</h4>
              <p class="text-sm font-medium text-slate-100">{scenario()!.nom}</p>
              <Show when={scenario()!.description}>
                <p class="text-xs text-slate-400 mt-1">{scenario()!.description}</p>
              </Show>
            </div>
          </Show>

          {/* Objectifs */}
          <div class="rounded-lg bg-slate-800/40 p-4">
            <h4 class="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Target size={16} class="text-blue-400" />
              Objectifs ({configurationStore.state.selectedObjectifs.length})
            </h4>
            <div class="space-y-2">
              <For each={configurationStore.state.selectedObjectifs}>
                {(objectif) => (
                  <div class="flex items-start gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p class="text-sm text-slate-100">{objectif.label}</p>
                      <Show when={objectif.description}>
                        <p class="text-xs text-slate-400 mt-0.5">{objectif.description}</p>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Cibles */}
          <div class="rounded-lg bg-slate-800/40 p-4">
            <h4 class="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Users size={16} class="text-purple-400" />
              Cibles ({configurationStore.state.selectedCibles.length})
            </h4>
            <div class="space-y-2">
              <For each={configurationStore.state.selectedCibles}>
                {(cible) => (
                  <div class="flex items-start gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p class="text-sm text-slate-100">{cible.label}</p>
                      <Show when={cible.persona || cible.segment}>
                        <p class="text-xs text-slate-400 mt-0.5">
                          {cible.persona && `Persona: ${cible.persona}`}
                          {cible.persona && cible.segment && " • "}
                          {cible.segment && `Segment: ${cible.segment}`}
                        </p>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>

      {/* Plan de contenu avec articles */}
      <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h3 class="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <FileText size={20} class="text-green-400" />
          Votre plan de contenu (5 articles)
        </h3>

        {/* Grid 2 colonnes pour les articles */}
        <div class="grid grid-cols-2 gap-4">
          <Show
            when={config()?.plans && config()!.plans.length > 0}
            fallback={
              <div class="col-span-2 text-center py-8">
                <p class="text-sm text-slate-500">Aucun article généré</p>
              </div>
            }
          >
            <For each={config()!.plans[0]?.articles || []}>
              {(article) => (
                <div class="rounded-lg border border-slate-700 bg-slate-800/60 p-4 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/10">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} class="text-green-400" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-semibold text-slate-100 mb-1 line-clamp-2">
                        {article.nom}
                      </h4>
                      <Show when={article.resume}>
                        <p class="text-xs text-slate-400 line-clamp-3">
                          {article.resume}
                        </p>
                      </Show>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </div>

      {/* Boutons d'action */}
      <div class="flex items-center gap-4">
        <button
          onClick={handleDownload}
          class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <Download size={18} />
          <span>Télécharger le plan</span>
        </button>
        <button
          onClick={handleNewStrategy}
          class="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-slate-600 hover:border-primary hover:bg-slate-800/60 text-slate-200 hover:text-primary font-semibold transition-all"
        >
          <Sparkles size={18} />
          <span>Nouvelle stratégie</span>
        </button>
      </div>
    </div>
  );
}
