import { For } from "solid-js";

interface Action {
  id: string;
  label: string;
  type: string;
  payload?: Record<string, any>;
}

interface ActionButtonGroupProps {
  actions: Action[];
  onActionClick: (action: Action) => void;
  disabled?: boolean;
}

export function ActionButtonGroup(props: ActionButtonGroupProps) {
  const getButtonColor = (type: string) => {
    switch (type) {
      case "add_objective":
        return "bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 border-purple-800/50";
      case "add_target":
      case "suggest_targets":
        return "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border-blue-800/50";
      case "add_resource":
        return "bg-green-900/30 text-green-400 hover:bg-green-900/50 border-green-800/50";
      case "generate_plan":
        return "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 border-orange-800/50";
      case "search_inspiration":
        return "bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 border-cyan-800/50";
      default:
        return "bg-slate-800 text-slate-100 hover:bg-slate-700 border-slate-700";
    }
  };

  return (
    <div class="flex flex-wrap gap-2">
      <For each={props.actions}>
        {(action) => (
          <button
            type="button"
            onClick={() => props.onActionClick(action)}
            disabled={props.disabled}
            class={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor(action.type)}`}
          >
            {action.label}
          </button>
        )}
      </For>
    </div>
  );
}
