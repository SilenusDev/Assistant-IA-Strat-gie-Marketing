import { For, Show, createSignal, createMemo } from "solid-js";
import { Plus, ArrowRight, Info } from "lucide-solid";
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
  onNextStep: () => void;
  maxReached: boolean;
}

export function ObjectifSelector(props: ObjectifSelectorProps) {
  const MAX_OBJECTIFS = 2;

  const isSelected = (objectif: Objectif) => {
    return props.selectedObjectifs.some(
      (o) => o.label === objectif.label
    );
  };

  const canSelect = (objectif: Objectif) => {
    return !props.maxReached || isSelected(objectif);
  };

  // Filtrer les suggestions IA pour exclure celles qui existent déjà en base
  const filteredSuggestions = createMemo(() => {
    const existingLabels = new Set(
      props.allObjectifs.map(obj => obj.label.toLowerCase().trim())
    );
    return props.suggestedObjectifs.filter(
      suggestion => !existingLabels.has(suggestion.label.toLowerCase().trim())
    );
  });

  return (
    <div class="space-y-6">
      {/* Header - Info + Bouton Navigation */}
      <div class="rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <Info size={18} class="text-blue-400" />
              <h3 class="text-sm font-semibold text-slate-200">
                Sélection des objectifs
              </h3>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              <strong class="text-slate-300">Maximum {MAX_OBJECTIFS} objectifs.</strong>
              {" "}
              <Show
                when={props.selectedObjectifs.length > 0}
                fallback="Choisissez les objectifs marketing pour votre stratégie."
              >
                Vous avez choisi <strong class="text-blue-400">{props.selectedObjectifs.length}</strong> objectif{props.selectedObjectifs.length > 1 ? 's' : ''}.
                {props.selectedObjectifs.length >= 1 && " Vous pouvez maintenant choisir vos cibles."}
              </Show>
            </p>
          </div>
          
          {/* Bouton Passer aux cibles */}
          <Show when={props.selectedObjectifs.length > 0}>
            <button
              onClick={props.onNextStep}
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <span class="text-sm whitespace-nowrap">Passer aux cibles</span>
              <ArrowRight size={16} />
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
                {(objectif) => (
                  <ObjectifCard
                    objectif={objectif}
                    isSelected={isSelected(objectif)}
                    onToggle={() => props.onToggle(objectif)}
                    disabled={!canSelect(objectif)}
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
            <span class="text-sm font-medium">Créer un objectif personnalisé</span>
          </button>
        </div>

        {/* Colonne Droite - Objectifs existants */}
        <div class="space-y-3">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-600/50">
            <div class="w-2 h-2 rounded-full bg-slate-400"></div>
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Objectifs existants
            </h4>
            <Show when={props.allObjectifs.length > 0}>
              <span class="ml-auto text-xs text-slate-500 font-medium">
                {props.allObjectifs.length} {props.allObjectifs.length > 1 ? 'objectifs' : 'objectif'}
              </span>
            </Show>
          </div>

          {/* Liste objectifs existants avec scroll */}
          <div class="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600/30 scrollbar-track-transparent">
            <Show
              when={props.allObjectifs.length > 0}
              fallback={
                <div class="text-center py-8 px-4">
                  <p class="text-xs text-slate-500 italic">
                    Aucun objectif existant
                  </p>
                </div>
              }
            >
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
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
