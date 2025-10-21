import { CheckCircle, XCircle } from "lucide-solid";
import { progressStore } from "../stores/progressStore";
import type { ConfigurationDetail } from "../types";

interface ProgressIndicatorProps {
  configuration: ConfigurationDetail;
}

export function ProgressIndicator(props: ProgressIndicatorProps) {
  return (
    <section class="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 class="text-sm font-semibold text-slate-100 mb-3">Progression</h4>
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-xs">
          {progressStore.state.configCompleted ? (
            <CheckCircle size={16} class="text-green-500" />
          ) : (
            <XCircle size={16} class="text-slate-600" />
          )}
          <span class="text-slate-300">Configuration définie</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          {progressStore.state.objectifsCount > 0 ? (
            <CheckCircle size={16} class="text-green-500" />
          ) : (
            <XCircle size={16} class="text-slate-600" />
          )}
          <span class="text-slate-300">
            Objectifs ({progressStore.state.objectifsCount}/2)
          </span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          {progressStore.state.ciblesCount > 0 ? (
            <CheckCircle size={16} class="text-green-500" />
          ) : (
            <XCircle size={16} class="text-slate-600" />
          )}
          <span class="text-slate-300">
            Cibles ({progressStore.state.ciblesCount}/3)
          </span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          {progressStore.state.planGenerated ? (
            <CheckCircle size={16} class="text-green-500" />
          ) : (
            <XCircle size={16} class="text-slate-600" />
          )}
          <span class="text-slate-300">Plan généré</span>
        </div>
      </div>
    </section>
  );
}
