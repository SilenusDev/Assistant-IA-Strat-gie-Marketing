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
                    when={props.scenario!.objectifs && props.scenario!.objectifs.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucun objectif défini</p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={props.scenario!.objectifs}>
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

              {/* Colonne 2 : Plan et Articles */}
              <div class="space-y-6">
                {/* Plan */}
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div class="flex items-center gap-2 mb-4">
                    <Calendar size={20} class="text-orange-400" />
                    <h3 class="text-lg font-semibold text-slate-100">Plan</h3>
                  </div>
                  <Show
                    when={props.scenario!.configurations && props.scenario!.configurations.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucun plan défini</p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={props.scenario!.configurations}>
                        {(config) => (
                          <Show when={config.plan && config.plan.length > 0}>
                            <For each={config.plan}>
                              {(planItem) => (
                                <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                  <div class="flex items-center justify-between mb-2">
                                    <p class="text-sm font-medium text-slate-200">
                                      {planItem.titre}
                                    </p>
                                    <span class="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-300">
                                      {planItem.type}
                                    </span>
                                  </div>
                                  <Show when={planItem.description}>
                                    <p class="text-xs text-slate-400 mb-2">
                                      {planItem.description}
                                    </p>
                                  </Show>
                                  <div class="flex items-center gap-3 text-xs text-slate-500">
                                    <Show when={planItem.date_debut}>
                                      <span>Début: {new Date(planItem.date_debut).toLocaleDateString('fr-FR')}</span>
                                    </Show>
                                    <Show when={planItem.date_fin}>
                                      <span>Fin: {new Date(planItem.date_fin).toLocaleDateString('fr-FR')}</span>
                                    </Show>
                                  </div>
                                </div>
                              )}
                            </For>
                          </Show>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                {/* Articles */}
                <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div class="flex items-center gap-2 mb-4">
                    <FileText size={20} class="text-purple-400" />
                    <h3 class="text-lg font-semibold text-slate-100">Articles</h3>
                  </div>
                  <Show
                    when={props.scenario!.configurations && props.scenario!.configurations.length > 0}
                    fallback={
                      <p class="text-sm text-slate-400 italic">Aucun article défini</p>
                    }
                  >
                    <div class="space-y-3">
                      <For each={props.scenario!.configurations}>
                        {(config) => (
                          <Show when={config.plan && config.plan.length > 0}>
                            <For each={config.plan}>
                              {(planItem) => (
                                <Show when={planItem.articles && planItem.articles.length > 0}>
                                  <For each={planItem.articles}>
                                    {(article) => (
                                      <div class="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                        <p class="text-sm font-medium text-slate-200 mb-1">
                                          {article.titre}
                                        </p>
                                        <Show when={article.contenu}>
                                          <p class="text-xs text-slate-400 line-clamp-2">
                                            {article.contenu}
                                          </p>
                                        </Show>
                                        <Show when={article.statut}>
                                          <span class="inline-block mt-2 text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                            {article.statut}
                                          </span>
                                        </Show>
                                      </div>
                                    )}
                                  </For>
                                </Show>
                              )}
                            </For>
                          </Show>
                        )}
                      </For>
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
