import { For, Show } from "solid-js";
import { Settings, Target, Users, FileText, Check } from "lucide-solid";

interface ProgressStep {
  id: string;
  label: string;
  icon: any;
}

interface ProgressBarProps {
  currentStep: number; // 0: config, 1: objectifs, 2: cibles, 3: plan
}

export function ProgressBar(props: ProgressBarProps) {
  const steps: ProgressStep[] = [
    { id: "config", label: "Configuration", icon: Settings },
    { id: "objectifs", label: "Objectifs", icon: Target },
    { id: "cibles", label: "Cibles", icon: Users },
    { id: "plan", label: "Plan", icon: FileText }
  ];

  const isCompleted = (index: number) => index < props.currentStep;
  const isCurrent = (index: number) => index === props.currentStep;

  return (
    <div class="w-full py-4 px-6 bg-slate-900/60 rounded-lg border border-slate-800/60 mb-4">
      <div class="flex items-center justify-between relative">
        {/* Ligne de progression */}
        <div class="absolute top-5 left-0 right-0 h-0.5 bg-slate-700/50 -z-10">
          <div
            class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
            style={{
              width: `${(props.currentStep / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Étapes */}
        <For each={steps}>
          {(step, index) => (
            <div class="flex flex-col items-center gap-2 relative">
              {/* Icône */}
              <div
                classList={{
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300": true,
                  "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg scale-110": isCurrent(index()),
                  "bg-gradient-to-br from-green-500 to-emerald-500 text-white": isCompleted(index()),
                  "bg-slate-800 text-slate-500": !isCurrent(index()) && !isCompleted(index())
                }}
              >
                <Show
                  when={isCompleted(index())}
                  fallback={
                    <step.icon size={18} />
                  }
                >
                  <Check size={18} class="animate-in fade-in zoom-in duration-300" />
                </Show>
              </div>

              {/* Label */}
              <span
                classList={{
                  "text-xs font-medium transition-colors duration-300": true,
                  "text-blue-400": isCurrent(index()),
                  "text-green-400": isCompleted(index()),
                  "text-slate-500": !isCurrent(index()) && !isCompleted(index())
                }}
              >
                {step.label}
              </span>

              {/* Indicateur étape courante */}
              <Show when={isCurrent(index())}>
                <div class="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
