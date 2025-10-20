import { Show, onMount } from "solid-js";

import { ChatPanel } from "./components/ChatPanel";
import { ScenarioSidebar } from "./components/ScenarioSidebar";
import { scenarioStore } from "./stores/scenarioStore";

export default function App() {
  onMount(() => {
    scenarioStore.refreshScenarios();
  });

  return (
    <div class="flex min-h-screen flex-col bg-slate-950/95">
      <header class="border-b border-slate-800 bg-slate-950/80 px-8 py-5 backdrop-blur">
        <h1 class="text-xl font-semibold text-white">
          Assistant IA – Stratégie Marketing
        </h1>
        <p class="text-sm text-slate-400">
          Co-construisez votre scénario, ajoutez des cibles et générez votre plan.
        </p>
      </header>
      <main class="flex flex-1 flex-col gap-6 px-8 py-6 lg:flex-row">
        <section class="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl">
          <ChatPanel />
        </section>
        <aside class="w-full lg:w-96">
          <div class="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-xl">
            <ScenarioSidebar />
          </div>
          <Show when={scenarioStore.state.loading}>
            <p class="mt-2 text-xs text-slate-500">
              Chargement des scénarios…
            </p>
          </Show>
          <Show when={scenarioStore.state.error}>
            {(error) => <p class="mt-2 text-xs text-red-400">{error}</p>}
          </Show>
        </aside>
      </main>
    </div>
  );
}
