import { For, Show, createSignal } from "solid-js";
import { Target, Users, FileText, Plus } from "lucide-solid";
import { Modal } from "./Modal";
import { addObjectifToConfiguration, addCibleToConfiguration } from "../api/client";
import type { ConfigurationDetail } from "../types";

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: ConfigurationDetail | null;
  onUpdate: () => void;
}

export function ConfigurationModal(props: ConfigurationModalProps) {
  const [showObjectifForm, setShowObjectifForm] = createSignal(false);
  const [showCibleForm, setShowCibleForm] = createSignal(false);
  const [objectifLabel, setObjectifLabel] = createSignal("");
  const [objectifDesc, setObjectifDesc] = createSignal("");
  const [cibleLabel, setCibleLabel] = createSignal("");
  const [ciblePersona, setCiblePersona] = createSignal("");
  const [cibleSegment, setCibleSegment] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleAddObjectif = async (e: Event) => {
    e.preventDefault();
    if (!props.configuration || !objectifLabel().trim()) return;

    setIsSubmitting(true);
    try {
      await addObjectifToConfiguration(props.configuration.id, {
        label: objectifLabel(),
        description: objectifDesc() || undefined
      });
      setObjectifLabel("");
      setObjectifDesc("");
      setShowObjectifForm(false);
      props.onUpdate();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCible = async (e: Event) => {
    e.preventDefault();
    if (!props.configuration || !cibleLabel().trim()) return;

    setIsSubmitting(true);
    try {
      await addCibleToConfiguration(props.configuration.id, {
        label: cibleLabel(),
        persona: ciblePersona() || undefined,
        segment: cibleSegment() || undefined
      });
      setCibleLabel("");
      setCiblePersona("");
      setCibleSegment("");
      setShowCibleForm(false);
      props.onUpdate();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={props.configuration?.nom || "Configuration"}
    >
      <Show when={props.configuration}>
        {(config) => (
          <div class="space-y-6">
            {/* Objectifs */}
            <section>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Target size={18} class="text-blue-400" />
                  <h3 class="text-sm font-semibold text-slate-100">Objectifs</h3>
                  <span class="text-xs text-slate-500">
                    ({config().objectifs?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => setShowObjectifForm(!showObjectifForm())}
                  class="p-1 rounded hover:bg-slate-800 transition"
                >
                  <Plus size={16} class="text-slate-400" />
                </button>
              </div>

              <Show when={showObjectifForm()}>
                <form onSubmit={handleAddObjectif} class="mb-3 space-y-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                  <input
                    type="text"
                    value={objectifLabel()}
                    onInput={(e) => setObjectifLabel(e.currentTarget.value)}
                    placeholder="Label de l'objectif"
                    class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                    disabled={isSubmitting()}
                  />
                  <textarea
                    value={objectifDesc()}
                    onInput={(e) => setObjectifDesc(e.currentTarget.value)}
                    placeholder="Description (optionnel)"
                    rows={2}
                    class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                    disabled={isSubmitting()}
                  />
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting() || !objectifLabel().trim()}
                      class="flex-1 px-3 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowObjectifForm(false);
                        setObjectifLabel("");
                        setObjectifDesc("");
                      }}
                      class="px-3 py-2 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </Show>

              <Show
                when={config().objectifs && config().objectifs.length > 0}
                fallback={<p class="text-xs text-slate-500 italic">Aucun objectif</p>}
              >
                <ul class="space-y-2">
                  <For each={config().objectifs}>
                    {(item) => (
                      <li class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                        <p class="text-sm font-medium text-slate-200">{item.label}</p>
                        <Show when={item.description}>
                          <p class="text-xs text-slate-400 mt-1">{item.description}</p>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>

            {/* Cibles */}
            <section>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <Users size={18} class="text-purple-400" />
                  <h3 class="text-sm font-semibold text-slate-100">Cibles</h3>
                  <span class="text-xs text-slate-500">
                    ({config().cibles?.length || 0})
                  </span>
                </div>
                <button
                  onClick={() => setShowCibleForm(!showCibleForm())}
                  class="p-1 rounded hover:bg-slate-800 transition"
                >
                  <Plus size={16} class="text-slate-400" />
                </button>
              </div>

              <Show when={showCibleForm()}>
                <form onSubmit={handleAddCible} class="mb-3 space-y-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                  <input
                    type="text"
                    value={cibleLabel()}
                    onInput={(e) => setCibleLabel(e.currentTarget.value)}
                    placeholder="Label de la cible"
                    class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                    disabled={isSubmitting()}
                  />
                  <input
                    type="text"
                    value={ciblePersona()}
                    onInput={(e) => setCiblePersona(e.currentTarget.value)}
                    placeholder="Persona (optionnel)"
                    class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                    disabled={isSubmitting()}
                  />
                  <input
                    type="text"
                    value={cibleSegment()}
                    onInput={(e) => setCibleSegment(e.currentTarget.value)}
                    placeholder="Segment (optionnel)"
                    class="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-primary focus:outline-none"
                    disabled={isSubmitting()}
                  />
                  <div class="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting() || !cibleLabel().trim()}
                      class="flex-1 px-3 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90 disabled:opacity-50 transition"
                    >
                      Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCibleForm(false);
                        setCibleLabel("");
                        setCiblePersona("");
                        setCibleSegment("");
                      }}
                      class="px-3 py-2 rounded bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </Show>

              <Show
                when={config().cibles && config().cibles.length > 0}
                fallback={<p class="text-xs text-slate-500 italic">Aucune cible</p>}
              >
                <ul class="space-y-2">
                  <For each={config().cibles}>
                    {(item) => (
                      <li class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                        <p class="text-sm font-medium text-slate-200">{item.label}</p>
                        <Show when={item.persona}>
                          <p class="text-xs text-slate-400 mt-1">Persona: {item.persona}</p>
                        </Show>
                        <Show when={item.segment}>
                          <p class="text-xs text-slate-400">Segment: {item.segment}</p>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </section>

            {/* Plans */}
            <section>
              <div class="flex items-center gap-2 mb-3">
                <FileText size={18} class="text-green-400" />
                <h3 class="text-sm font-semibold text-slate-100">Plans</h3>
                <span class="text-xs text-slate-500">
                  ({config().plans?.length || 0})
                </span>
              </div>

              <Show
                when={config().plans && config().plans.length > 0}
                fallback={<p class="text-xs text-slate-500 italic">Aucun plan généré</p>}
              >
                <div class="space-y-3">
                  <For each={config().plans}>
                    {(plan) => (
                      <div class="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                        <Show when={plan.resume}>
                          <p class="text-sm text-slate-300 mb-2">{plan.resume}</p>
                        </Show>
                        <p class="text-xs text-slate-500">
                          {plan.items?.length || 0} actions • {plan.articles?.length || 0} articles
                        </p>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </section>
          </div>
        )}
      </Show>
    </Modal>
  );
}
