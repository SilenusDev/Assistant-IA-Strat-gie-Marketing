import { For, Show, createSignal } from "solid-js";
import { Plus, Sparkles } from "lucide-solid";
import { ObjectifCard } from "./ObjectifCard";

interface Objectif {
  id?: number;
  label: string;
  description?: string;
}

interface ObjectifSelectorProps {
  suggestedObjectifs: Objectif[];
  allObjectifs: Objectif[];
  selectedObjectifs: Objectif[];
  onToggle: (objectif: Objectif) => void;
  onCreateNew: () => void;
  maxReached: boolean;
}

export function ObjectifSelector(props: ObjectifSelectorProps) {
  const isSelected = (objectif: Objectif) => {
    return props.selectedObjectifs.some(
      (o) => o.label === objectif.label
    );
  };

  const canSelect = (objectif: Objectif) => {
    return !props.maxReached || isSelected(objectif);
  };

  return (
    <div class="space-y-4">
      {/* Compteur */}
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-300">
          {props.selectedObjectifs.length === 0
            ? "Sélectionnez jusqu'à 2 objectifs"
            : `${props.selectedObjectifs.length}/2 objectif${props.selectedObjectifs.length > 1 ? 's' : ''} sélectionné${props.selectedObjectifs.length > 1 ? 's' : ''}`}
        </p>
        <Show when={props.maxReached}>
          <span class="text-xs text-orange-400">Maximum atteint</span>
        </Show>
      </div>

      {/* Suggestions IA */}
      <Show when={props.suggestedObjectifs.length > 0}>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Sparkles size={16} class="text-purple-400" />
            <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide">
              Suggestions IA
            </p>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <For each={props.suggestedObjectifs}>
              {(objectif) => (
                <ObjectifCard
                  objectif={objectif}
                  isSelected={isSelected(objectif)}
                  onToggle={() => props.onToggle(objectif)}
                  disabled={!canSelect(objectif)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Objectifs existants */}
      <Show when={props.allObjectifs.length > 0}>
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Objectifs existants
          </p>
          <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            <For each={props.allObjectifs}>
              {(objectif) => (
                <ObjectifCard
                  objectif={objectif}
                  isSelected={isSelected(objectif)}
                  onToggle={() => props.onToggle(objectif)}
                  disabled={!canSelect(objectif)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Bouton créer nouveau */}
      <button
        onClick={props.onCreateNew}
        class="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-600 hover:border-primary hover:bg-slate-800/40 transition text-slate-300 hover:text-primary"
      >
        <Plus size={18} />
        <span class="text-sm font-medium">Créer un objectif personnalisé</span>
      </button>
    </div>
  );
}
