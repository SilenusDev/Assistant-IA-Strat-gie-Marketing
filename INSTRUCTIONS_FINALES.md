# 🎯 Instructions finales - Message de bienvenue stylisé

## ✅ La route API existe

`POST /api/scenarios/suggest-new` - Fonctionnelle ✅

## 📝 Code à ajouter dans ChatPanel.tsx

### Ligne 181, APRÈS `when={message.content === "welcome_message"}` et AVANT `fallback={`

Ajouter ce bloc :

```tsx
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
```

---

## 🔧 Alternative : Fichier complet

Si trop compliqué, je peux recréer le fichier ENTIER avec tout bien structuré.

**Dis-moi ce que tu préfères !**
