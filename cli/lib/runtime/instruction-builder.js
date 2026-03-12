/**
 * instruction-builder.js
 *
 * Builds the runtime-specific instruction file from layered templates:
 *   ZYLOS.md (runtime-agnostic core)
 *   + claude-addon.md  → CLAUDE.md   (Claude Code runtime)
 *   + codex-addon.md   → AGENTS.md   (Codex runtime)
 *
 * The generated file is written to the zylos data directory (~/zylos/).
 * The templates live in the zylos-core package (templates/).
 */

import fs from 'node:fs';
import path from 'node:path';
import { ZYLOS_DIR } from '../config.js';

// cli/lib/runtime/ → cli/lib/ → cli/ → package root
const PACKAGE_ROOT = path.join(import.meta.dirname, '..', '..', '..');
const TEMPLATES_DIR = path.join(PACKAGE_ROOT, 'templates');

// Generated file locations
const OUTPUT_FILES = {
  claude: path.join(ZYLOS_DIR, 'CLAUDE.md'),
  codex: path.join(ZYLOS_DIR, 'AGENTS.md'),
};

// Template paths
const TEMPLATE_FILES = {
  core: path.join(TEMPLATES_DIR, 'ZYLOS.md'),
  claudeAddon: path.join(TEMPLATES_DIR, 'claude-addon.md'),
  codexAddon: path.join(TEMPLATES_DIR, 'codex-addon.md'),
};

/**
 * Build the instruction file for the given runtime.
 *
 * @param {'claude'|'codex'} runtime
 * @param {object} [opts]
 * @param {string} [opts.memorySnapshot] - Optional memory content to append (e.g. for AGENTS.md)
 * @returns {string} Path to the generated file
 */
export function buildInstructionFile(runtime, opts = {}) {
  const coreSrc = TEMPLATE_FILES.core;
  const addonSrc = runtime === 'codex' ? TEMPLATE_FILES.codexAddon : TEMPLATE_FILES.claudeAddon;
  const destPath = OUTPUT_FILES[runtime];

  if (!fs.existsSync(coreSrc)) {
    throw new Error(`Core template not found: ${coreSrc}`);
  }
  if (!fs.existsSync(addonSrc)) {
    throw new Error(`Addon template not found: ${addonSrc}`);
  }

  const core = fs.readFileSync(coreSrc, 'utf8');
  const addon = fs.readFileSync(addonSrc, 'utf8');

  let content = core.trimEnd() + '\n\n' + addon.trimEnd() + '\n';

  if (opts.memorySnapshot) {
    content += '\n' + opts.memorySnapshot.trimEnd() + '\n';
  }

  // Atomic write: write to temp then rename
  const tmp = destPath + `.tmp.${process.pid}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, destPath);

  return destPath;
}

/**
 * Build both CLAUDE.md and AGENTS.md.
 * Used after upgrade migration to ensure both files are current.
 */
export function buildAllInstructionFiles() {
  buildInstructionFile('claude');
  buildInstructionFile('codex');
}

/**
 * Check whether the instruction files need rebuilding.
 * Returns true if either the core template or the relevant addon is newer
 * than the generated output file.
 *
 * @param {'claude'|'codex'} runtime
 * @returns {boolean}
 */
export function needsRebuild(runtime) {
  const destPath = OUTPUT_FILES[runtime];
  if (!fs.existsSync(destPath)) return true;

  const destMtime = fs.statSync(destPath).mtimeMs;
  const coreMtime = fs.existsSync(TEMPLATE_FILES.core)
    ? fs.statSync(TEMPLATE_FILES.core).mtimeMs : 0;
  const addonSrc = runtime === 'codex' ? TEMPLATE_FILES.codexAddon : TEMPLATE_FILES.claudeAddon;
  const addonMtime = fs.existsSync(addonSrc)
    ? fs.statSync(addonSrc).mtimeMs : 0;

  return coreMtime > destMtime || addonMtime > destMtime;
}

/**
 * Get the instruction file path for a runtime without building it.
 * @param {'claude'|'codex'} runtime
 * @returns {string}
 */
export function getInstructionFilePath(runtime) {
  return OUTPUT_FILES[runtime];
}
