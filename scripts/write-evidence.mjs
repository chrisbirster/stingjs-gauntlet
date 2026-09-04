#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [outputArg, platform, version] = process.argv.slice(2);
if (!outputArg || !platform || !version) {
  console.error('usage: node scripts/write-evidence.mjs <output.json> <platform> <version>');
  process.exit(2);
}

const output = resolve(outputArg);
await mkdir(dirname(output), { recursive: true });
const record = {
  schemaVersion: 1,
  repository: process.env.GITHUB_REPOSITORY ?? 'chrisbirster/stingjs-gauntlet',
  platform,
  stingVersion: version,
  commit: process.env.GITHUB_SHA ?? null,
  workflowRunId: process.env.GITHUB_RUN_ID ?? null,
  workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
  runner: process.env.RUNNER_OS ?? null,
  createdAt: new Date().toISOString(),
};
await writeFile(output, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
process.stdout.write(`wrote ${output}\n`);
