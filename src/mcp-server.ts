#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CalibrateInputSchema,
  LandscapeInputSchema,
  listPresetsAndBenchmarks,
  OptimizeInputSchema,
  runCalibrateTool,
  runLandscapeTool,
  runOptimizeTool,
  runSimulationTool,
  SimulateInputSchema,
} from './engine/agentApi.ts';

const server = new McpServer({
  name: 'twinkinetique-qsp-mcp',
  version: '1.0.0',
});

function okJson(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

server.registerTool(
  'list_cytokine_presets',
  {
    title: 'List Cytokine-Antagonist Presets & Clinical Benchmarks',
    description:
      'Returns the 5 calibrated pro-inflammatory cytokine/antagonist clinical axes (TNF-a/Adalimumab, IL-6/Tocilizumab, IL-1b/Anakinra, IL-17A/Secukinumab, IL-23/Risankizumab) and 3 published clinical PK/ADA cohorts.',
  },
  async () => okJson(listPresetsAndBenchmarks())
);

server.registerTool(
  'simulate_cytokine_kinetics',
  {
    title: 'Simulate Cytokine-Antagonist Binding Kinetics & Resistance',
    description:
      'Solves the coupled cytokine-receptor-antagonist ODE system over 28 days with 140-patient Monte Carlo variability to predict receptor occupancy, trough exposure, primary/secondary resistance probability (with 95% CI), and counterfactual risk drivers.',
    inputSchema: SimulateInputSchema,
  },
  async (args) => okJson(runSimulationTool(args))
);

server.registerTool(
  'optimize_antagonist_regimen',
  {
    title: 'Optimize Antagonist Dose & Dosing Interval',
    description:
      'Searches dose escalations and dosing interval reductions on the coupled ODE model to minimize therapeutic resistance probability and detect refractory bypass profiles requiring a mechanism switch.',
    inputSchema: OptimizeInputSchema,
  },
  async (args) => okJson(runOptimizeTool(args))
);

server.registerTool(
  'calibrate_clinical_cohort',
  {
    title: 'Calibrate PK/PD Model Against Published or Custom Clinical Cohort',
    description:
      'Evaluates and optionally auto-calibrates (least-squares coordinate descent) the ODE model against published JAMA/Ann Rheum Dis PK/ADA cohorts or custom agent-supplied serum trough observations, returning R², RMSE, MAPE, and WRES residuals.',
    inputSchema: CalibrateInputSchema,
  },
  async (args) => okJson(runCalibrateTool(args))
);

server.registerTool(
  'scan_resistance_landscape',
  {
    title: 'Scan 2D Therapeutic Resistance Sensitivity Surface',
    description:
      'Computes a 16x11 multiparametric resistance matrix across either Dose vs Baseline Cytokine [C]0 or Affinity Loss (Kd) vs ADA Immunogenicity.',
    inputSchema: LandscapeInputSchema,
  },
  async (args) => okJson(runLandscapeTool(args))
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TwinKinétique MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
