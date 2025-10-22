import { Show, onMount, createSignal } from "solid-js";
import { BookOpen, ChevronDown } from "lucide-solid";

import { ChatPanel } from "./components/ChatPanel";
import { ScenarioSidebar } from "./components/ScenarioSidebar";
import { ScenarioStructure } from "./components/ScenarioStructure";
import { scenarioStore } from "./stores/scenarioStore";

export default function App() {
  const [docsOpen, setDocsOpen] = createSignal(false);

  onMount(() => {
    scenarioStore.refreshScenarios();
  });

  return (
    <div class="flex min-h-screen flex-col bg-slate-950/95">
      <header class="border-b border-slate-800 bg-slate-950/80 px-8 py-5 backdrop-blur">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-white">
              Assistant IA – Stratégie Marketing
            </h1>
            <p class="text-sm text-slate-400">
              Co-construisez votre scénario, ajoutez des cibles et générez votre plan.
            </p>
          </div>
          
          {/* Menu Documentation */}
          <div class="relative">
            <button
              onClick={() => setDocsOpen(!docsOpen())}
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <BookOpen size={18} />
              <span class="text-sm font-medium">Documentation</span>
              <ChevronDown size={16} class="transition-transform" classList={{ "rotate-180": docsOpen() }} />
            </button>
            
            {/* Dropdown */}
            <Show when={docsOpen()}>
              <div class="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900 border border-slate-700 shadow-xl overflow-hidden z-50">
                <a
                  href="/docs/presentation.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800"
                >
                  🎯 Présentation POC (Slides)
                </a>
                <a
                  href="/docs/livrable-1-analyse-besoins-A4.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800"
                >
                  📄 Livrable 1 : Analyse des besoins
                </a>
                <a
                  href="/docs/livrable-2-cahier-des-charges-A4.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  📋 Livrable 2 : Cahier des charges
                </a>
              </div>
            </Show>
          </div>
        </div>
      </header>
      <main class="flex flex-1 gap-6 px-8 py-6">
        {/* Aside gauche - Structure du scénario */}
        <aside class="w-80 flex-shrink-0">
          <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl h-full">
            <ScenarioStructure />
          </div>
        </aside>

        {/* Zone centrale - Chat */}
        <section class="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl">
          <ChatPanel />
        </section>

        {/* Aside droite - Liste des scénarios */}
        <aside class="w-96 flex-shrink-0">
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
