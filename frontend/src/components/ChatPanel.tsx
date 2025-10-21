import { For, Show, createSignal, createEffect } from "solid-js";
import { nanoid } from "nanoid";

import { chatStore } from "../stores/chatStore";
import { scenarioStore } from "../stores/scenarioStore";
import { configurationStore } from "../stores/configurationStore";
import { ActionButtonGroup } from "./ActionButtonGroup";
import { SuggestionCard } from "./SuggestionCard";
import { ConfigurationSelector } from "./ConfigurationSelector";
import { ObjectifFlow } from "./ObjectifFlow";
import { CibleFlow } from "./CibleFlow";
import { suggestNewScenario, batchCreateScenarios, type ScenarioSuggestion } from "../api/client";
import { handleConfigurationReady, handleNextToCibles, handleGeneratePlan } from "../handlers/configurationHandlers";
import { Loader2 } from "lucide-solid";

export function ChatPanel() {
  const [draft, setDraft] = createSignal("");

  // Ajouter le message d'accueil au chargement
  createEffect(() => {
    if (chatStore.messages.length === 0) {
      chatStore.addMessage({
        id: "welcome",
        author: "assistant",
        content: "welcome_message",
        createdAt: new Date()
      });
    }
  });

  const [isGenerating, setIsGenerating] = createSignal(false);
  const [suggestions, setSuggestions] = createSignal<ScenarioSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = createSignal<Set<number>>(new Set());
  const [isSaving, setIsSaving] = createSignal(false);

  const handleNewScenarioIdea = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    setSelectedSuggestions(new Set());
    
    // Afficher le spinner avec message
    chatStore.addMessage({
      id: "scanning",
      author: "assistant",
      content: "scanning",
      createdAt: new Date()
    });
    
    try {
      // Appeler l'agent IA pour générer plusieurs suggestions
      const response = await suggestNewScenario();
      
      // Retirer le message de scan
      chatStore.removeMessage("scanning");
      
      // Stocker les suggestions
      setSuggestions(response.suggestions);
      
      // Afficher le message avec les suggestions
      chatStore.addMessage({
        id: nanoid(),
        author: "assistant",
        content: `J'ai analysé vos scénarios existants et je vous propose ${response.suggestions.length} nouvelles approches innovantes.

Sélectionnez ceux qui vous intéressent :`,
        createdAt: new Date()
      });
      
      // Message spécial pour afficher les cartes
      chatStore.addMessage({
        id: "suggestions",
        author: "assistant",
        content: "suggestions",
        createdAt: new Date()
      });
      
    } catch (error) {
      chatStore.removeMessage("scanning");
      chatStore.addMessage({
        id: nanoid(),
        author: "assistant",
        content: `Désolé, une erreur est survenue : ${(error as Error).message}`,
        createdAt: new Date()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions());
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleSaveSelected = async () => {
    const selected = suggestions().filter((_, index) => selectedSuggestions().has(index));
    if (selected.length === 0) return;

    setIsSaving(true);
    try {
      const response = await batchCreateScenarios(selected);
      
      // Retirer le message "suggestions"
      chatStore.removeMessage("suggestions");
      
      // Rafraîchir la liste des scénarios
      await scenarioStore.refreshScenarios();
      
      // Message de confirmation avec actions
      chatStore.addMessage({
        id: nanoid(),
        author: "assistant",
        content: `success_confirmation:${response.count}`,
        createdAt: new Date()
      });
      
      // Réinitialiser
      setSuggestions([]);
      setSelectedSuggestions(new Set());
      
    } catch (error) {
      chatStore.addMessage({
        id: nanoid(),
        author: "assistant",
        content: `Erreur lors de l'enregistrement : ${(error as Error).message}`,
        createdAt: new Date()
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    const value = draft().trim();
    if (!value) return;
    await chatStore.sendMessage(value);
    setDraft("");
  };

  return (
    <div class="flex h-full flex-col">
      {/* Formulaire de saisie en haut */}
      <form class="mb-4 flex gap-2" onSubmit={handleSubmit}>
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

      {/* Boutons d'action */}
      <Show when={chatStore.actions().length}>
        <div class="mb-4">
          <ActionButtonGroup
            actions={chatStore.actions()}
            onActionClick={(action) => chatStore.triggerAction(action)}
            disabled={chatStore.isThinking()}
          />
        </div>
      </Show>

      {/* Messages (récents en haut) */}
      <div class="flex-1 space-y-4 overflow-y-auto rounded-md bg-slate-900/60 p-4 flex flex-col">
        <For each={[...chatStore.messages].reverse()}>
          {(message) => (
            <Show
              when={message.content === "welcome_message"}
              fallback={
                <Show
                  when={message.content === "scanning"}
                  fallback={
                    <Show
                      when={message.content === "suggestions"}
                      fallback={
                        <Show
                          when={message.content === "objectif_flow"}
                          fallback={
                            <Show
                              when={message.content === "cible_flow"}
                              fallback={
                                <Show
                                  when={message.content === "config_selection"}
                                  fallback={
                                    <Show
                                      when={message.content.startsWith("success_confirmation:")}
                                      fallback={
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
                              }
                            >
                              {/* Message de confirmation avec actions */}
                              <div class="mr-auto text-left max-w-xl">
                                <div class="rounded-xl px-4 py-3 text-sm shadow-md bg-slate-800 text-slate-100">
                                  <p class="font-semibold text-green-400 mb-3">
                                    🎉 Félicitation Justine ! Vous avez {message.content.split(':')[1]} nouveau{parseInt(message.content.split(':')[1]) > 1 ? 'x' : ''} scénario{parseInt(message.content.split(':')[1]) > 1 ? 's' : ''} qui {parseInt(message.content.split(':')[1]) > 1 ? 'sont' : 'est'} maintenant disponible{parseInt(message.content.split(':')[1]) > 1 ? 's' : ''} dans le menu à droite.
                                  </p>
                                  
                                  <div class="space-y-2 text-xs">
                                    <p class="font-semibold">Vous pouvez maintenant :</p>
                                    <ul class="space-y-1.5 ml-2">
                                      <li class="flex items-start gap-2">
                                        <span class="text-blue-400 mt-0.5">•</span>
                                        <span><strong>Développer un de ces scénarios</strong> en le faisant glisser du menu de droite vers le menu de gauche</span>
                                      </li>
                                      <li class="flex items-start gap-2">
                                        <span class="text-blue-400 mt-0.5">•</span>
                                        <span><strong>Faire une nouvelle recherche de scénario</strong></span>
                                      </li>
                                    </ul>
                                  </div>
                                  
                                  <div class="mt-3 pt-3 border-t border-slate-700">
                                    <button
                                      onClick={handleNewScenarioIdea}
                                      disabled={isGenerating()}
                                      class="w-full px-3 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition text-xs font-semibold border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isGenerating() ? "⏳ Génération en cours..." : "💡 Nouveau scénario"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </Show>
                          }
                        >
                          {/* ConfigurationSelector */}
                          <div class="mr-auto text-left w-full">
                            <ConfigurationSelector
                              configurations={configurationStore.state.configurations}
                              onSelect={handleConfigurationReady}
                              onCreateNew={async (nom) => {
                                const config = await configurationStore.createConfiguration(
                                  configurationStore.state.currentScenarioId!,
                                  nom
                                );
                                await handleConfigurationReady(config.id);
                              }}
                            />
                          </div>
                        </Show>
                      }
                    >
                      {/* CibleFlow */}
                      <div class="mr-auto text-left w-full">
                        <CibleFlow onGeneratePlan={handleGeneratePlan} />
                      </div>
                    </Show>
                  }
                >
                  {/* ObjectifFlow */}
                  <div class="mr-auto text-left w-full">
                    <ObjectifFlow onNextStep={handleNextToCibles} />
                  </div>
                </Show>
              }
            >
                      {/* Cartes de suggestions */}
                      <div class="mr-auto text-left w-full space-y-3">
                        <div class="grid grid-cols-1 gap-3">
                          <For each={suggestions()}>
                            {(suggestion, index) => (
                              <SuggestionCard
                                suggestion={suggestion}
                                isSelected={selectedSuggestions().has(index())}
                                onToggle={() => toggleSuggestion(index())}
                              />
                            )}
                          </For>
                        </div>
                        
                        <div class="flex items-center justify-between pt-2">
                          <span class="text-xs text-slate-400">
                            {selectedSuggestions().size} scénario{selectedSuggestions().size > 1 ? 's' : ''} sélectionné{selectedSuggestions().size > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={handleSaveSelected}
                            disabled={selectedSuggestions().size === 0 || isSaving()}
                            class="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                          >
                            {isSaving() ? "Enregistrement..." : "Enregistrer les scénarios sélectionnés"}
                          </button>
                        </div>
                      </div>
                    </Show>
                  }
                >
                  {/* Spinner de scan */}
                  <div class="mr-auto text-left max-w-xl">
                    <div class="inline-block rounded-xl px-4 py-3 text-sm shadow-md bg-slate-800 text-slate-100">
                      <div class="flex items-center gap-3">
                        <Loader2 size={20} class="animate-spin text-primary" />
                        <p>Je scanne les scénarios existants pour vous proposer une approche inédite</p>
                      </div>
                    </div>
                  </div>
                </Show>
              }
            >
              {/* Message de bienvenue stylisé */}
              <div class="mr-auto text-left w-full max-w-2xl">
                <div class="rounded-xl px-5 py-4 text-sm shadow-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <p class="text-base font-semibold text-slate-100 mb-3">
                    Bonjour Justine, sur quelle stratégie allons-nous travailler ?
                  </p>
                  
                  <div class="space-y-2 text-sm text-slate-300 mb-4">
                    <div class="flex items-start gap-2">
                      <span class="text-blue-400 mt-0.5">•</span>
                      <span><strong class="text-slate-200">Créer un nouveau scénario</strong> : cliquer sur le bouton en haut à droite</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-blue-400 mt-0.5">•</span>
                      <span><strong class="text-slate-200">Travailler sur un scénario existant</strong> : glisser un scénario du menu de droite vers le menu de gauche</span>
                    </div>
                  </div>
                  
                  <div class="pt-3 border-t border-slate-700/50">
                    <p class="text-xs text-slate-400 mb-2">Souhaitez-vous explorer d'autres scénarios ?</p>
                    <button
                      onClick={handleNewScenarioIdea}
                      disabled={isGenerating()}
                      class="w-full px-4 py-2.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition text-sm font-semibold border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating() ? "⏳ Génération en cours..." : "💡 Nouveau scénario"}
                    </button>
                  </div>
                </div>
              </div>
            </Show>
          )}
        </For>
        <Show when={chatStore.error()}>
          {(error) => <div class="text-sm text-red-400">{error}</div>}
        </Show>
        <Show when={chatStore.isThinking()}>
          <div class="text-sm text-slate-400">Assistant en réflexion…</div>
        </Show>
      </div>
    </div>
  );
}
