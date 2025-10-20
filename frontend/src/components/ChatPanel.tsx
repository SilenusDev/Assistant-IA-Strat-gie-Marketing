import { For, Show, createSignal } from "solid-js";

import { chatStore } from "../stores/chatStore";
import { ActionButtonGroup } from "./ActionButtonGroup";

export function ChatPanel() {
  const [draft, setDraft] = createSignal("");

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const value = draft().trim();
    if (!value) return;
    await chatStore.sendMessage(value);
    setDraft("");
  };

  return (
    <div class="flex h-full flex-col">
      <div class="flex-1 space-y-4 overflow-y-auto rounded-md bg-slate-900/60 p-4">
        <For each={chatStore.messages}>
          {(message) => (
            <div
              classList={{
                "ml-auto text-right": message.author === "user",
                "mr-auto text-left": message.author !== "user"
              }}
              class="max-w-xl"
            >
              <div
                class="inline-block rounded-xl px-4 py-2 text-sm shadow-md"
                classList={{
                  "bg-primary text-white": message.author === "user",
                  "bg-slate-800 text-slate-100": message.author !== "user"
                }}
              >
                <p class="whitespace-pre-line">{message.content}</p>
                <p class="mt-1 text-xs text-slate-300">
                  {message.createdAt.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </For>
        <Show when={chatStore.isThinking()}>
          <div class="text-sm text-slate-400">Assistant en réflexion…</div>
        </Show>
        <Show when={chatStore.error()}>
          {(error) => <div class="text-sm text-red-400">{error}</div>}
        </Show>
      </div>
      <Show when={chatStore.actions().length}>
        <div class="mt-4">
          <ActionButtonGroup
            actions={chatStore.actions()}
            onActionClick={(action) => chatStore.triggerAction(action)}
            disabled={chatStore.isThinking()}
          />
        </div>
      </Show>
      <form class="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft()}
          onInput={(event) => setDraft(event.currentTarget.value)}
          placeholder="Posez votre question…"
          class="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          class="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          disabled={chatStore.isThinking()}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
