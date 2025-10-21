import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { nanoid } from "nanoid";

import { sendChatMessage } from "../api/client";
import type { ChatAction, ChatMessage, ChatResponse } from "../types";
import { scenarioStore } from "./scenarioStore";

const [messages, setMessages] = createStore<ChatMessage[]>([]);
const [actions, setActions] = createSignal<ChatAction[]>([]);
const [isThinking, setIsThinking] = createSignal(false);
const [error, setError] = createSignal<string | null>(null);

function pushMessage(message: ChatMessage) {
  setMessages((list) => [...list, message]);
}

function removeMessage(id: string) {
  setMessages((list) => list.filter(m => m.id !== id));
}

async function processResponse(response: ChatResponse) {
  if (response.scenario) {
    scenarioStore.setSelectedScenario(response.scenario);
    scenarioStore.refreshScenarios();
  }
  setActions(response.actions ?? []);
  pushMessage({
    id: nanoid(),
    author: "assistant",
    content: response.message,
    createdAt: new Date(),
    scenarioId: response.scenario?.id ?? undefined
  });
}

async function sendMessage(
  content: string,
  extra: Record<string, unknown> = {}
) {
  pushMessage({ id: nanoid(), author: "user", content, createdAt: new Date() });
  setIsThinking(true);
  setError(null);
  try {
    const response = await sendChatMessage({
      message: content,
      scenario_id: scenarioStore.state.selectedScenario?.id,
      ...extra
    });
    await processResponse(response);
  } catch (err) {
    setError((err as Error).message);
  } finally {
    setIsThinking(false);
  }
}

async function triggerAction(action: ChatAction) {
  await sendMessage(action.label, { action: action.action, payload: action.payload });
}

function resetChat() {
  setMessages([]);
  setActions([]);
  setError(null);
}

export const chatStore = {
  messages,
  actions,
  isThinking,
  error,
  sendMessage,
  triggerAction,
  resetChat,
  addMessage: pushMessage,
  removeMessage
};
