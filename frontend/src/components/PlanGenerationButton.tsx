import { Show } from "solid-js";
import { Sparkles, Loader2 } from "lucide-solid";

interface PlanGenerationButtonProps {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  objectifsCount: number;
  ciblesCount: number;
}

export function PlanGenerationButton(props: PlanGenerationButtonProps) {
  return (
    <div class="space-y-3">
      {/* Message d'état */}
      <Show
        when={props.canGenerate}
        fallback={
          <div class="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <p class="text-xs text-orange-300">
              ⚠️ Sélectionnez au moins 1 objectif et 1 cible pour générer un plan
            </p>
          </div>
        }
      >
        <div class="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <p class="text-xs text-green-300">
            ✅ Configuration complète ! Vous pouvez générer un plan de contenu.
          </p>
        </div>
      </Show>

      {/* Résumé */}
      <div class="flex items-center justify-center gap-4 text-xs text-slate-400">
        <span>{props.objectifsCount} objectif{props.objectifsCount > 1 ? 's' : ''}</span>
        <span>•</span>
        <span>{props.ciblesCount} cible{props.ciblesCount > 1 ? 's' : ''}</span>
      </div>

      {/* Bouton */}
      <button
        onClick={props.onGenerate}
        disabled={!props.canGenerate || props.isGenerating}
        class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
      >
        <Show
          when={!props.isGenerating}
          fallback={
            <>
              <Loader2 size={20} class="animate-spin" />
              <span>Génération en cours...</span>
            </>
          }
        >
          <Sparkles size={20} />
          <span>Générer un plan avec 5 articles</span>
        </Show>
      </button>
    </div>
  );
}
