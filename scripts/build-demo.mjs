import {mkdir, copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const target = new URL('dist/', root);
await mkdir(new URL('assets/', target), {recursive:true});
for (const name of ['index.html','demo.js','timeline.mjs']) await copyFile(new URL(`docs/${name}`,root),new URL(name,target));
for (const name of ['demo-silent.mp4','poster.png']) await copyFile(new URL(`examples/${name}`,root),new URL(`assets/${name}`,target));
console.log(`Static demo ready: ${fileURLToPath(target)}`);
