import { Show } from "solid-js";
import { Check, Users } from "lucide-solid";

interface Cible {
  id?: number;
  label: string;
  persona?: string;
  segment?: string;
}

interface CibleCardProps {
  cible: Cible;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CibleCard(props: CibleCardProps) {
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
        <div class="flex items-center gap-2 mb-2">
          <Users size={16} class="text-green-400" />
          <h3 class="text-sm font-semibold text-slate-100">
            {props.cible.label}
          </h3>
        </div>
        
        <Show when={props.cible.segment}>
          <p class="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 inline-block mb-2">
            {props.cible.segment}
          </p>
        </Show>
        
        <Show when={props.cible.persona}>
          <p class="text-xs text-slate-400 leading-relaxed">
            {props.cible.persona}
          </p>
        </Show>
      </div>
    </button>
  );
}
