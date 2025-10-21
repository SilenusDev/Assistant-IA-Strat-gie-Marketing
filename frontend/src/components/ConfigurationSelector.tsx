import { For, Show, createSignal } from "solid-js";
import { Plus } from "lucide-solid";

interface Configuration {
  id: number;
  nom: string;
  created_at: string;
}

interface ConfigurationSelectorProps {
  configurations: Configuration[];
  onSelect: (configId: number) => void;
  onCreateNew: (nom: string) => void;
}

export function ConfigurationSelector(props: ConfigurationSelectorProps) {
  const [showCreate, setShowCreate] = createSignal(false);
  const [nom, setNom] = createSignal("");

  const handleCreate = () => {
    if (nom().trim()) {
      props.onCreateNew(nom().trim());
      setNom("");
      setShowCreate(false);
    }
  };

  return (
    <div class="space-y-3">
      {/* Configurations existantes */}
      <Show when={props.configurations.length > 0}>
        <div class="space-y-2">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Configurations existantes
          </p>
          <For each={props.configurations}>
            {(config) => (
              <button
                onClick={() => props.onSelect(config.id)}
                class="w-full text-left p-3 rounded-lg border border-slate-700 bg-slate-800/40 hover:border-primary hover:bg-slate-800/60 transition"
              >
                <p class="text-sm font-medium text-slate-100">{config.nom}</p>
                <p class="text-xs text-slate-400 mt-1">
                  Créée le {new Date(config.created_at).toLocaleDateString('fr-FR')}
                </p>
              </button>
            )}
          </For>
        </div>
      </Show>

      {/* Créer nouvelle configuration */}
      <div class="pt-3 border-t border-slate-700">
        <Show
          when={!showCreate()}
          fallback={
            <div class="space-y-2">
              <input
                type="text"
                value={nom()}
                onInput={(e) => setNom(e.currentTarget.value)}
                placeholder="Nom de la configuration"
                class="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:border-primary focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleCreate()}
              />
              <div class="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!nom().trim()}
                  class="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNom("");
                  }}
                  class="px-3 py-2 rounded-lg bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          }
        >
          <button
            onClick={() => setShowCreate(true)}
            class="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-600 hover:border-primary hover:bg-slate-800/40 transition text-slate-300 hover:text-primary"
          >
            <Plus size={18} />
            <span class="text-sm font-medium">Nouvelle configuration</span>
          </button>
        </Show>
      </div>
    </div>
  );
}
