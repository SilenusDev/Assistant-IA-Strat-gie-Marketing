import { Show } from "solid-js";
import { Check } from "lucide-solid";

interface Objectif {
  id?: number;
  label: string;
  description?: string;
}

interface ObjectifCardProps {
  objectif: Objectif;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ObjectifCard(props: ObjectifCardProps) {
  return (
    <button
      onClick={props.onToggle}
      disabled={props.disabled}
      class="w-full text-left rounded-xl border-2 transition-all duration-200 p-4 relative"
      classList={{
        "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60": !props.isSelected && !props.disabled,
        "border-primary bg-primary/10 shadow-lg shadow-primary/20": props.isSelected,
        "opacity-50 cursor-not-allowed": props.disabled
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
        <h3 class="text-sm font-semibold text-slate-100 mb-2">
          {props.objectif.label}
        </h3>
        
        <Show when={props.objectif.description}>
          <p class="text-xs text-slate-400 leading-relaxed">
            {props.objectif.description}
          </p>
        </Show>
      </div>
    </button>
  );
}
