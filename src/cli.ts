#!/usr/bin/env node
import {
  listPresetsAndBenchmarks,
  runCalibrateTool,
  runLandscapeTool,
  runOptimizeTool,
  runSimulationTool,
} from './engine/agentApi.ts';

function parseArgs(argv: string[]): {
  command: string;
  flags: Record<string, string | boolean>;
} {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string | boolean> = {};

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];
    if (!token.startsWith('--')) continue;
    const eqIdx = token.indexOf('=');
    if (eqIdx !== -1) {
      const k = token.slice(2, eqIdx);
      const v = token.slice(eqIdx + 1);
      flags[k] = v;
    } else {
      const k = token.slice(2);
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[k] = next;
        i++;
      } else {
        flags[k] = true;
      }
    }
  }
  return { command, flags };
}

function extractOverrides(flags: Record<string, string | boolean>) {
  const numKeys = [
    'c0_pM',
    'kon_C',
    'koff_C',
    'rTot_pM',
    'feedbackGain',
    'dose_mg',
    'interval_days',
    'halfLife_days',
    'kon_A',
    'koff_A',
    'adaRisk',
    'mutationPenalty',
    'bypassPathway',
    'inflammatoryClearance',
  ] as const;

  const overrides: Record<string, unknown> = {};
  for (const key of numKeys) {
    const raw = flags[key];
    if (typeof raw === 'string') {
      const val = Number(raw);
      if (Number.isNaN(val)) {
        throw new Error(`Invalid numeric flag --${key}=${raw}`);
      }
      overrides[key] = val;
    }
  }
  if (typeof flags.mechanism === 'string') {
    overrides.mechanism = flags.mechanism;
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

function printHelp() {
  console.log(
    JSON.stringify(
      {
        name: 'twinkinetique-cli',
        usage: 'npx tsx src/cli.ts <command> [--flags]',
        commands: {
          list: 'List available cytokine presets and clinical benchmarks',
          simulate:
            'Run 28-day ODE + Monte Carlo simulation (--preset, --adaRisk, --dose_mg, --c0_pM, --includeTimeSeries)',
          optimize:
            'Find optimal dose & interval (--preset + any parameter override)',
          calibrate:
            'Fit/evaluate against clinical study (--benchmark bartelds_ada_neg|bartelds_ada_pos|gibiansky_toci_q2w, --auto)',
          scan: 'Compute 2D sensitivity matrix (--preset, --mode dose_vs_cytokine|kd_vs_ada)',
        },
      },
      null,
      2
    )
  );
}

function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  try {
    if (command === 'help' || flags.help === true) {
      printHelp();
      return;
    }

    if (command === 'list') {
      console.log(JSON.stringify(listPresetsAndBenchmarks(), null, 2));
      return;
    }

    const overrides = extractOverrides(flags);
    const presetId = typeof flags.preset === 'string' ? flags.preset : 'tnf_adalimumab';

    if (command === 'simulate') {
      const result = runSimulationTool({
        presetId,
        overrides,
        includeTimeSeries: flags.includeTimeSeries === true,
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === 'optimize') {
      const result = runOptimizeTool({ presetId, overrides });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === 'calibrate') {
      const benchmarkId =
        typeof flags.benchmark === 'string' ? flags.benchmark : 'bartelds_ada_neg';
      const autoCalibrate = flags.auto !== 'false';
      const result = runCalibrateTool({
        benchmarkId,
        autoCalibrate,
        overrides,
      });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    if (command === 'scan') {
      const mode =
        typeof flags.mode === 'string' ? flags.mode : 'dose_vs_cytokine';
      const result = runLandscapeTool({ presetId, mode, overrides });
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    throw new Error(`Unknown command "${command}". Run with "help".`);
  } catch (err) {
    console.error(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      })
    );
    process.exit(1);
  }
}

main();
