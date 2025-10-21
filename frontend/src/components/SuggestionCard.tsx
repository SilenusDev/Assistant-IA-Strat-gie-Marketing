import { Show } from "solid-js";
import { Check } from "lucide-solid";
import type { ScenarioSuggestion } from "../api/client";

interface SuggestionCardProps {
  suggestion: ScenarioSuggestion;
  isSelected: boolean;
  onToggle: () => void;
}

export function SuggestionCard(props: SuggestionCardProps) {
  return (
    <button
      onClick={props.onToggle}
      class="w-full text-left rounded-xl border-2 transition-all duration-200 p-4 relative"
      classList={{
        "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60": !props.isSelected,
        "border-primary bg-primary/10 shadow-lg shadow-primary/20": props.isSelected
      }}
    >
      {/* Badge de sélection */}
      <Show when={props.isSelected}>
        <div class="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check size={16} class="text-white" />
        </div>
      </Show>

      {/* Contenu de la carte */}
      <div class="pr-8">
        <h3 class="text-base font-semibold text-slate-100 mb-2">
          {props.suggestion.nom}
        </h3>
        
        <div class="flex items-center gap-2 mb-3">
          <span class="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-medium">
            {props.suggestion.thematique}
          </span>
        </div>
        
        <p class="text-sm text-slate-300 leading-relaxed">
          {props.suggestion.description}
        </p>
      </div>
    </button>
  );
}
