import { Show, createSignal } from "solid-js";
import { X } from "lucide-solid";

interface CreateObjectifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { label: string; description?: string }) => void;
}

export function CreateObjectifModal(props: CreateObjectifModalProps) {
  const [label, setLabel] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!label().trim()) return;

    setIsSubmitting(true);
    try {
      await props.onCreate({
        label: label().trim(),
        description: description().trim() || undefined
      });
      setLabel("");
      setDescription("");
      props.onClose();
    } catch (error) {
      console.error("Erreur création objectif:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={props.onClose}
      >
        <div
          class="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 class="text-xl font-bold text-slate-100">Créer un objectif</h2>
            <button
              onClick={props.onClose}
              class="p-2 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                Objectif <span class="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={label()}
                onInput={(e) => setLabel(e.currentTarget.value)}
                placeholder="Ex: Augmenter la notoriété de marque"
                class="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm focus:border-primary focus:outline-none"
                required
                maxLength={120}
              />
              <p class="text-xs text-slate-500 mt-1">
                {label().length}/120 caractères
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder="Décrivez l'objectif en détail..."
                rows={3}
                class="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                onClick={props.onClose}
                class="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!label().trim() || isSubmitting()}
                class="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-500 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting() ? "Création..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
