# TwinKinétique — QSP Cytokine-Antagonist Binding & Resistance Engine

Moteur mécaniste de pharmacologie quantitative des systèmes (**QSP**) modélisant la cinétique de liaison des cytokines pro-inflammatoires (`TNF-α`, `IL-6`, `IL-1β`, `IL-17A`, `IL-23`) et de leurs antagonistes (`neutralisation de ligand soluble` ou `blocage compétitif du récepteur`) pour prédire la probabilité de résistance thérapeutique.

Le projet expose :
1. **Un serveur MCP (`stdio`)** (`src/mcp-server.ts`) utilisable directement par des agents IA (Claude Desktop, Cursor, Windsurf, LangGraph) comme calculateur biophysique déterministe sans hallucination.
2. **Une CLI JSON** (`src/cli.ts`) pour l’intégration dans des pipelines Python/bash ou scripts multi-agents.
3. **Une interface Web interactive** (`src/App.tsx`) pour l’exploration visuelle, les cartes de chaleur 2D, les cohortes Monte Carlo et les graphiques VPC cliniques.

---

## Outils exposés (MCP & CLI)

| Outil MCP | Commande CLI | Rôle |
| :--- | :--- | :--- |
| `list_cytokine_presets` | `list` | Retourne les 5 axes thérapeutiques calibrés et les 3 cohortes cliniques de référence. |
| `simulate_cytokine_kinetics` | `simulate` | Intègre les EDO couplées sur 28 jours + 140 jumeaux stochastiques Monte Carlo (IC 95 %, occupation $\theta_{CR}$, $C_{\text{trough}}$, attribution des facteurs de résistance). |
| `optimize_antagonist_regimen` | `optimize` | Recherche la combinaison dose/intervalle minimisant $P(\text{Résistance})$ et détecte les profils nécessitant une bascule de mécanisme. |
| `calibrate_clinical_cohort` | `calibrate` | Évalue ou auto-calibre par moindres carrés $(t_{1/2}, \text{ADA}, \text{TMDD})$ sur les études publiées (*Bartelds et al., JAMA 2011* ; *Burmester/Gibiansky*) ou sur des observations JSON fournies par l’agent. |
| `scan_resistance_landscape` | `scan` | Génère la matrice de sensibilité 2D ($16 \times 11$) sur *Dose × [C]₀* ou *Perte d’affinité $K_d$ × ADA*. |

---

## Utilisation CLI

```bash
# Lister les axes disponibles et les benchmarks publiés
npm run cli -- list

# Simuler un patient sous Adalimumab avec risque ADA élevé
npm run cli -- simulate --preset tnf_adalimumab --adaRisk 0.72 --c0_pM 210

# Optimiser la posologie
npm run cli -- optimize --preset il6_tocilizumab --c0_pM 320 --dose_mg 162

# Calibrer le modèle sur la cohorte ADA+ de Bartelds et al. (JAMA 2011)
npm run cli -- calibrate --benchmark bartelds_ada_pos --auto
```

---

## Configuration Serveur MCP (`stdio`)

Ajoutez cette configuration dans votre client MCP (ex. `claude_desktop_config.json` ou `.cursor/mcp.json`) :

```json
{
  "mcpServers": {
    "twinkinetique": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server.ts"],
      "cwd": "/chemin/absolu/vers/le/projet"
    }
  }
}
```

---

## Tests numériques & Vérification

```bash
npm test          # Suite Vitest (conservation de masse, monotonie, R² >= 0.85 sur JAMA 2011)
npm run lint      # Vérification TypeScript strict (tsc --noEmit)
npm run build     # Compilation Vite de l'interface web
```
