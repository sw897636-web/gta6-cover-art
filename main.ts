// Neon Coast Cover Studio — submission entrypoint (Node 22, stdlib only).
//
// The app itself is plain static files under app/ (index.html plus its ES
// modules, local fonts and sample photos — no build step, no network at
// runtime). This program hands it in: it mirrors app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json there,
// the summary the judge reads, using the vendored make.fun library.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function mirrorFolder(source, target) {
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

function main() {
  mkdirSync(outDir, { recursive: true });
  rmSync(join(outDir, 'app'), { recursive: true, force: true });
  rmSync(join(outDir, 'screenshots'), { recursive: true, force: true });
  mirrorFolder(join(repoRoot, 'app'), join(outDir, 'app'));
  if (existsSync(join(repoRoot, 'screenshots'))) {
    mirrorFolder(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
  } else {
    mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  }
  // The scorer's own caps: only text_max_bytes shapes the dossier bytes; the
  // rest refuse an entry the scorer would refuse (more than 4 screenshots or
  // one over 256 KiB; app/ over 993 files or 48 MiB in all, or a path under
  // app/ over 1000 bytes).
  writeFileSync(
    join(outDir, 'dossier.json'),
    buildDossier(outDir, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
      app_path_max_bytes: 1000,
    }),
  );
  console.log(`Neon Coast Cover Studio handed in to ${outDir}`);
}

main();
