import { For, Show } from "solid-js";
import { Plus, Sparkles } from "lucide-solid";
import { CibleCard } from "./CibleCard";

interface Cible {
  id?: number;
  label: string;
  persona?: string;
  segment?: string;
}

interface CibleSelectorProps {
  suggestedCibles: Cible[];
  allCibles: Cible[];
  selectedCibles: Cible[];
  onToggle: (cible: Cible) => void;
  onCreateNew: () => void;
  maxReached: boolean;
}

export function CibleSelector(props: CibleSelectorProps) {
  const isSelected = (cible: Cible) => {
    return props.selectedCibles.some(
      (c) => c.label === cible.label
    );
  };

  const canSelect = (cible: Cible) => {
    return !props.maxReached || isSelected(cible);
  };

  return (
    <div class="space-y-4">
      {/* Compteur */}
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-300">
          {props.selectedCibles.length === 0
            ? "Sélectionnez jusqu'à 3 cibles"
            : `${props.selectedCibles.length}/3 cible${props.selectedCibles.length > 1 ? 's' : ''} sélectionnée${props.selectedCibles.length > 1 ? 's' : ''}`}
        </p>
        <Show when={props.maxReached}>
          <span class="text-xs text-orange-400">Maximum atteint</span>
        </Show>
      </div>

      {/* Suggestions IA */}
      <Show when={props.suggestedCibles.length > 0}>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <Sparkles size={16} class="text-purple-400" />
            <p class="text-xs font-semibold text-purple-400 uppercase tracking-wide">
              Suggestions IA
            </p>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <For each={props.suggestedCibles}>
              {(cible) => (
                <CibleCard
                  cible={cible}
                  isSelected={isSelected(cible)}
                  onToggle={() => props.onToggle(cible)}
                  disabled={!canSelect(cible)}
                />
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Cibles existantes */}
      <Show when={props.allCibles.length > 0}>
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Cibles existantes
          </p>
          <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
            <For each={props.allCibles}>
              {(cible) => (
                <CibleCard
                  cible={cible}
                  isSelected={isSelected(cible)}
                  onToggle={() => props.onToggle(cible)}
                  disabled={!canSelect(cible)}
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
        <span class="text-sm font-medium">Créer une cible personnalisée</span>
      </button>
    </div>
  );
}
