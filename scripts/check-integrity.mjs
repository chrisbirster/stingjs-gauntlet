#!/usr/bin/env node
import { lstat, readFile, realpath } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';

const [appArg, expectedVersion] = process.argv.slice(2);
if (!appArg || !expectedVersion) {
  console.error('usage: node scripts/check-integrity.mjs <app-dir> <exact-sting-version>');
  process.exit(2);
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(expectedVersion)) {
  throw new Error(`expected an exact SemVer Sting version, got ${expectedVersion}`);
}

const appDir = resolve(appArg);
const manifestPath = join(appDir, 'package.json');
const lockPath = join(appDir, 'package-lock.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const lockText = await readFile(lockPath, 'utf8');
const lock = JSON.parse(lockText);
const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

function isStingPackage(name) {
  return name === 'create-sting' || name.startsWith('@stingjs/');
}

for (const field of dependencyFields) {
  for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
    if (!isStingPackage(name)) continue;
    if (typeof spec !== 'string') throw new Error(`${field}.${name} is not a string dependency spec`);
    if (/^(workspace:|file:|link:)/.test(spec)) {
      throw new Error(`${field}.${name} leaks a local dependency: ${spec}`);
    }
    if (isAbsolute(spec) || /^[A-Za-z]:[\\/]/.test(spec)) {
      throw new Error(`${field}.${name} uses an absolute path: ${spec}`);
    }
    if (spec !== expectedVersion) {
      throw new Error(`${field}.${name}=${spec}; expected exact RC cohort ${expectedVersion}`);
    }
  }
}

if (/\b(?:workspace:|file:|link:)/.test(lockText)) {
  throw new Error('package-lock.json contains a workspace/file/link dependency');
}
if (/[\\/]stingjs[\\/](?:packages|tooling|native|runtime)[\\/]/i.test(lockText)) {
  throw new Error('package-lock.json contains a StingJS source-checkout path');
}

const installed = [];
for (const [packagePath, record] of Object.entries(lock.packages ?? {})) {
  const match = packagePath.match(/(?:^|\/)node_modules\/(?:@stingjs\/[^/]+|create-sting)$/);
  if (!match) continue;
  const packageName = packagePath.slice(packagePath.lastIndexOf('node_modules/') + 'node_modules/'.length);
  if (!record || typeof record !== 'object') throw new Error(`invalid lock record for ${packageName}`);
  if (record.version !== expectedVersion) {
    throw new Error(`${packageName}@${record.version ?? '<missing>'}; expected ${expectedVersion}`);
  }
  if (typeof record.resolved === 'string' && /^(file:|link:)/.test(record.resolved)) {
    throw new Error(`${packageName} resolved locally: ${record.resolved}`);
  }

  const installedPath = join(appDir, packagePath);
  const stat = await lstat(installedPath);
  if (stat.isSymbolicLink()) throw new Error(`${packageName} is installed through a symlink`);
  const resolvedPath = await realpath(installedPath);
  if (/[\\/]stingjs[\\/](?:packages|tooling|native|runtime)(?:[\\/]|$)/i.test(resolvedPath)) {
    throw new Error(`${packageName} realpath resolves into a StingJS source checkout: ${resolvedPath}`);
  }
  installed.push(packageName);
}

if (installed.length === 0) throw new Error('no installed @stingjs packages were found in package-lock.json');

const required = ['@stingjs/core', '@stingjs/native', '@stingjs/solid', '@stingjs/cli'];
for (const name of required) {
  if (!installed.includes(name)) throw new Error(`required installed package missing: ${name}`);
}

process.stdout.write(`integrity passed: StingJS ${expectedVersion}; installed cohort=${[...new Set(installed)].sort().join(', ')}\n`);
