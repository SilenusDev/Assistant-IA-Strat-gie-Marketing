import { Loader2 } from "lucide-solid";

interface LoadingMessageProps {
  message: string;
}

/**
 * Composant uniforme pour afficher un message avec spinner
 * Utilisé dans toute l'orchestration pour la cohérence visuelle
 */
export function LoadingMessage(props: LoadingMessageProps) {
  return (
    <div class="mr-auto text-left max-w-xl">
      <div class="inline-block rounded-xl px-4 py-3 text-sm shadow-md bg-slate-800 text-slate-100">
        <div class="flex items-center gap-3">
          <Loader2 size={20} class="animate-spin text-primary" />
          <p>{props.message}</p>
        </div>
      </div>
    </div>
  );
}
