import { For, Show, createSignal } from "solid-js";
import { exportCSV, exportJSON } from "../api/client";

interface PlanItem {
  id: number;
  format: string;
  message: string;
  canal: string;
  frequence?: string;
  kpi?: string;
}

interface Plan {
  id: number;
  resume: string;
  generated_at: string;
  items: PlanItem[];
}

interface PlanTableProps {
  plan: Plan;
  scenarioId: number;
}

export function PlanTable(props: PlanTableProps) {
  const [exporting, setExporting] = createSignal(false);
  const [exportError, setExportError] = createSignal<string | null>(null);

  const handleExportJSON = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportJSON(props.scenarioId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scenario_${props.scenarioId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportCSV(props.scenarioId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan_${props.scenarioId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div class="space-y-4">
      {/* En-tête avec résumé et boutons export */}
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-white">Plan de diffusion</h3>
          <p class="mt-1 text-sm text-slate-400">{props.plan.resume}</p>
          <p class="mt-1 text-xs text-slate-500">
            Généré le {new Date(props.plan.generated_at).toLocaleString("fr-FR")}
          </p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={exporting()}
            class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
          >
            {exporting() ? "Export..." : "Export JSON"}
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting()}
            class="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
          >
            {exporting() ? "Export..." : "Export CSV"}
          </button>
        </div>
      </div>

      <Show when={exportError()}>
        {(error) => (
          <div class="rounded-lg bg-red-900/20 border border-red-800 px-4 py-2 text-sm text-red-400">
            Erreur d'export : {error()}
          </div>
        )}
      </Show>

      {/* Tableau des items */}
      <div class="overflow-x-auto rounded-lg border border-slate-800">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-800 bg-slate-900/60">
            <tr>
              <th class="px-4 py-3 font-semibold text-slate-300">Format</th>
              <th class="px-4 py-3 font-semibold text-slate-300">Message</th>
              <th class="px-4 py-3 font-semibold text-slate-300">Canal</th>
              <th class="px-4 py-3 font-semibold text-slate-300">Fréquence</th>
              <th class="px-4 py-3 font-semibold text-slate-300">KPI</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <For each={props.plan.items}>
              {(item) => (
                <tr class="transition hover:bg-slate-900/40">
                  <td class="px-4 py-3">
                    <span class="inline-block rounded-full bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-400">
                      {item.format}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-slate-200">{item.message}</td>
                  <td class="px-4 py-3 text-slate-300">{item.canal}</td>
                  <td class="px-4 py-3 text-slate-400">{item.frequence || "—"}</td>
                  <td class="px-4 py-3 text-slate-400">{item.kpi || "—"}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      {/* Compteur */}
      <p class="text-xs text-slate-500">
        {props.plan.items.length} action{props.plan.items.length > 1 ? "s" : ""} dans le plan
      </p>
    </div>
  );
}
