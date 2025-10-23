import { Show, For, createSignal } from "solid-js";
import { X, Target, Users, FileText, Calendar } from "lucide-solid";
import type { ScenarioDetail } from "../types";

interface ScenarioModalProps {
  scenario: ScenarioDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export function ScenarioModal(props: ScenarioModalProps) {
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleDelete = async () => {
    if (!props.scenario) return;
    
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le scénario "${props.scenario.nom}" ?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await props.onDelete(props.scenario.id);
      props.onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Show when={props.isOpen && props.scenario}>
      {/* Overlay */}
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={props.onClose}
      >
        {/* Modal */}
        <div
          class="bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-start justify-between p-6 border-b border-slate-700">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-slate-100 mb-2">
                {props.scenario!.nom}
              </h2>
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                  {props.scenario!.thematique}
                </span>
                <span class="text-sm text-slate-400">
                  Créé le {new Date(props.scenario!.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <button
              onClick={props.onClose}
              class="p-2 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-slate-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Description */}
            <Show when={props.scenario!.description}>
              <div class="mb-6">
                <p class="text-slate-300 leading-relaxed">
                  {props.scenario!.description}
                </p>
              </div>
            </Show>

            {/* Two columns layout */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne 1 : Objectifs et Cibles */}
              <div class="space-y-6">
                {/* Objectifs */}
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div class="flex items-center gap-2 mb-4">
                    <Target size={20} class="text-blue-400" />
                    <h3 class="text-lg font-semibold text-slate-100">Objectifs</h3>
                  </div>
                  <Show
                    when={props.scenario!.configurations && props.scenario!.configurations.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucun objectif défini</p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={props.scenario!.configurations}>
                        {(config) => (
                          <Show when={config.objectifs && config.objectifs.length > 0}>
                            <For each={config.objectifs}>
                              {(objectif) => (
                                <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <p class="text-sm font-medium text-slate-200 mb-1">
                                    {objectif.label}
                                  </p>
                                  <Show when={objectif.description}>
                                    <p class="text-xs text-slate-400">
                                      {objectif.description}
                                    </p>
                                  </Show>
                                </div>
                              )}
                            </For>
                          </Show>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Cibles */}
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div class="flex items-center gap-2 mb-4">
                    <Users size={20} class="text-green-400" />
                    <h3 class="text-lg font-semibold text-slate-100">Cibles</h3>
                  </div>
                  <Show
                    when={props.scenario!.configurations && props.scenario!.configurations.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucune cible définie</p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={props.scenario!.configurations}>
                        {(config) => (
                          <Show when={config.cibles && config.cibles.length > 0}>
                            <For each={config.cibles}>
                              {(cible) => (
                                <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <p class="text-sm font-medium text-slate-200 mb-1">
                                    {cible.label}
                                  </p>
                                  <Show when={cible.persona}>
                                    <p class="text-xs text-slate-400">
                                      <strong>Persona:</strong> {cible.persona}
                                    </p>
                                  </Show>
                                  <Show when={cible.segment}>
                                    <p class="text-xs text-slate-400">
                                      <strong>Segment:</strong> {cible.segment}
                                    </p>
                                  </Show>
                                </div>
                              )}
                            </For>
                          </Show>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>

              {/* Colonne 2 : Plan avec Articles */}
              <div class="space-y-6">
                {/* Plan */}
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div class="flex items-center gap-2 mb-4">
                    <Calendar size={20} class="text-orange-400" />
                    <h3 class="text-lg font-semibold text-slate-100">Plan Marketing</h3>
                  </div>
                  <Show
                    when={props.scenario!.configurations && props.scenario!.configurations.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucun plan défini</p>
                    }
                  >
                    <div class="space-y-4">
                      <For each={props.scenario!.configurations}>
                        {(config) => (
                          <Show when={config.plans && config.plans.length > 0}>
                            <For each={config.plans}>
                              {(plan) => (
                                <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-700 space-y-3">
                                  {/* En-tête du plan */}
                                  <div class="flex items-center justify-between">
                                    <p class="text-sm font-semibold text-slate-200">
                                      Plan Marketing - {config.nom}
                                    </p>
                                    <span class="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-300 font-medium">
                                      {new Date(plan.generated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>
                                  
                                  <Show when={plan.resume}>
                                    <p class="text-xs text-slate-400">
                                      {plan.resume}
                                    </p>
                                  </Show>

                                  {/* Items du plan */}
                                  <Show when={plan.items && plan.items.length > 0}>
                                    <div class="space-y-2">
                                      <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                        Actions ({plan.items.length})
                                      </h4>
                                      <For each={plan.items}>
                                        {(item) => (
                                          <div class="bg-slate-800/30 rounded-lg p-2.5 border border-slate-700/50">
                                            <div class="flex items-start justify-between gap-2 mb-1">
                                              <p class="text-xs font-medium text-slate-200">
                                                {item.format}
                                              </p>
                                              <span class="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 shrink-0">
                                                {item.canal}
                                              </span>
                                            </div>
                                            <p class="text-xs text-slate-400">
                                              {item.message}
                                            </p>
                                            <Show when={item.frequence || item.kpi}>
                                              <div class="flex gap-3 mt-1.5 text-xs text-slate-500">
                                                <Show when={item.frequence}>
                                                  <span>📅 {item.frequence}</span>
                                                </Show>
                                                <Show when={item.kpi}>
                                                  <span>📊 {item.kpi}</span>
                                                </Show>
                                              </div>
                                            </Show>
                                          </div>
                                        )}
                                      </For>
                                    </div>
                                  </Show>

                                  {/* Articles du plan */}
                                  <Show when={plan.articles && plan.articles.length > 0}>
                                    <div class="pt-3 border-t border-slate-700/50">
                                      <div class="flex items-center gap-2 mb-2">
                                        <FileText size={14} class="text-purple-400" />
                                        <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                                          Articles ({plan.articles.length})
                                        </h4>
                                      </div>
                                      <div class="space-y-2">
                                        <For each={plan.articles}>
                                          {(article) => (
                                            <div class="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                                              <p class="text-xs font-medium text-slate-200 mb-1">
                                                {article.nom}
                                              </p>
                                              <Show when={article.resume}>
                                                <p class="text-xs text-slate-400 line-clamp-2">
                                                  {article.resume}
                                                </p>
                                              </Show>
                                            </div>
                                          )}
                                        </For>
                                      </div>
                                    </div>
                                  </Show>
                                </div>
                              )}
                            </For>
                          </Show>
                        )}
                      </For>
                    </div>

                    {/* Bouton Générer un autre plan */}
                    <div class="pt-4 border-t border-slate-700">
                      <button
                        disabled
                        class="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600/20 to-purple-600/20 border border-orange-500/30 text-orange-300 font-semibold text-sm transition-all opacity-50 cursor-not-allowed"
                      >
                        🔄 Générer un autre plan
                      </button>
                      <p class="text-xs text-slate-500 text-center mt-2 italic">
                        Fonctionnalité à venir
                      </p>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/30">
            <button
              onClick={props.onClose}
              class="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-medium"
            >
              Fermer
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting()}
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting() ? "Suppression..." : "Supprimer le scénario"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
