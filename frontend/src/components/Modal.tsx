import { Show, JSX } from "solid-js";
import { X } from "lucide-solid";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}

export function Modal(props: ModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={props.onClose}
        />
        
        {/* Modal */}
        <div class="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div class="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 class="text-lg font-semibold text-slate-100">{props.title}</h2>
            <button
              onClick={props.onClose}
              class="p-1 rounded hover:bg-slate-800 transition"
            >
              <X size={20} class="text-slate-400" />
            </button>
          </div>
          
          {/* Content */}
          <div class="flex-1 overflow-y-auto p-4">
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
}
