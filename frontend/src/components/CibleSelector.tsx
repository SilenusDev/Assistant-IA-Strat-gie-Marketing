import { For, Show, createMemo } from "solid-js";
import { Plus, Rocket, Info } from "lucide-solid";
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
  onGeneratePlan: () => void;
  maxReached: boolean;
}

export function CibleSelector(props: CibleSelectorProps) {
  const MAX_CIBLES = 3;

  const isSelected = (cible: Cible) => {
    return props.selectedCibles.some(
      (c) => c.label === cible.label
    );
  };

  const canSelect = (cible: Cible) => {
    return !props.maxReached || isSelected(cible);
  };

  // Filtrer les suggestions IA pour exclure celles qui existent déjà en base
  const filteredSuggestions = createMemo(() => {
    const existingLabels = new Set(
      props.allCibles.map(cible => cible.label.toLowerCase().trim())
    );
    return props.suggestedCibles.filter(
      suggestion => !existingLabels.has(suggestion.label.toLowerCase().trim())
    );
  });

  return (
    <div class="space-y-6">
      {/* Header - Info + Bouton Navigation */}
      <div class="rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Info size={18} class="text-purple-400" />
              <h3 class="text-sm font-semibold text-slate-200">
                Sélection des cibles
              </h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              <strong class="text-slate-300">Maximum {MAX_CIBLES} cibles.</strong>
              {" "}
              <Show
                when={props.selectedCibles.length > 0}
                fallback="Choisissez les personas et segments pour votre stratégie."
              >
                Vous avez choisi <strong class="text-purple-400">{props.selectedCibles.length}</strong> cible{props.selectedCibles.length > 1 ? 's' : ''}.
                {props.selectedCibles.length >= 1 && " Vous pouvez maintenant générer votre plan."}
              </Show>
            </p>
          </div>
          
          {/* Bouton Générer le plan */}
          <Show when={props.selectedCibles.length > 0}>
            <button
              onClick={props.onGeneratePlan}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <Rocket size={16} />
              <span class="text-sm whitespace-nowrap">Générer le plan</span>
            </button>
          </Show>
        </div>
      </div>

      {/* Layout 2 colonnes 50/50 */}
      <div class="grid grid-cols-2 gap-6">
        {/* Colonne Gauche - Suggestions IA */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-purple-500/30">
            <div class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <h4 class="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Suggestions IA
            </h4>
            <Show when={filteredSuggestions().length > 0}>
              <span class="ml-auto text-xs text-purple-400/60 font-medium">
                {filteredSuggestions().length} {filteredSuggestions().length > 1 ? 'suggestions' : 'suggestion'}
              </span>
            </Show>
          </div>

          {/* Liste suggestions IA avec scroll */}
          <div class="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600/30 scrollbar-track-transparent">
            <Show
              when={filteredSuggestions().length > 0}
              fallback={
                <div class="text-center py-8 px-4">
                  <p class="text-xs text-slate-500 italic">
                    Aucune suggestion IA disponible pour le moment
                  </p>
                </div>
              }
            >
              <For each={filteredSuggestions()}>
                {(cible) => (
                  <CibleCard
                    cible={cible}
                    isSelected={isSelected(cible)}
                    onToggle={() => props.onToggle(cible)}
                    disabled={!canSelect(cible)}
                  />
                )}
              </For>
            </Show>
          </div>

          {/* Bouton créer nouveau en bas de la colonne */}
          <button
            onClick={props.onCreateNew}
            disabled={props.maxReached}
            class="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-600/40 hover:border-purple-500 hover:bg-purple-600/10 transition-all text-purple-300 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-purple-600/40"
          >
            <Plus size={18} />
            <span class="text-sm font-medium">Créer une cible personnalisée</span>
          </button>
        </div>

        {/* Colonne Droite - Cibles existantes */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-600/50">
            <div class="w-2 h-2 rounded-full bg-slate-400"></div>
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Cibles existantes
            </h4>
            <Show when={props.allCibles.length > 0}>
              <span class="ml-auto text-xs text-slate-500 font-medium">
                {props.allCibles.length} {props.allCibles.length > 1 ? 'cibles' : 'cible'}
              </span>
            </Show>
          </div>

          {/* Liste cibles existantes avec scroll */}
          <div class="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600/30 scrollbar-track-transparent">
            <Show
              when={props.allCibles.length > 0}
              fallback={
                <div class="text-center py-8 px-4">
                  <p class="text-xs text-slate-500 italic">
                    Aucune cible existante
                  </p>
                </div>
              }
            >
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
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
