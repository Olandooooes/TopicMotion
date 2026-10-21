#!/usr/bin/env node
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {checkRuntime} from './preflight.mjs';
if(process.argv.includes('--help')){console.log('Auto Video: --job /path/job.json --out /new/output [--browser /path/Chrome] [--cache /private/cache]. Requires macOS, Node 22.13+, Python 3, Chrome; online neural voice by default, explicit system voice optional.');process.exit(0);}
try {checkRuntime(process.platform,process.versions.node,existsSync('/usr/bin/say'));}
catch(error){console.error(error.message);process.exit(1);}
const engine=fileURLToPath(new URL('../assets/renderer/',import.meta.url));
const require=createRequire(new URL('../assets/renderer/package.json',import.meta.url));
try {require.resolve('@remotion/renderer');require.resolve('@remotion/bundler');}
catch {
  console.log('Preparing local rendering dependencies (first run only)…');
  const r=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['ci','--ignore-scripts'],{cwd:engine,stdio:'inherit'});
  if(r.status!==0)process.exit(r.status||1);
}
const result=spawnSync(process.execPath,[resolve(engine,'render.mjs'),...process.argv.slice(2)],{stdio:'inherit',env:process.env});
process.exit(result.status ?? 1);
