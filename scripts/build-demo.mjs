import {mkdir, copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const target = new URL('dist/', root);
await mkdir(new URL('assets/', target), {recursive:true});
await copyFile(new URL('docs/index.html',root),new URL('index.html',target));
for (const name of ['demo-silent.mp4','poster.png']) await copyFile(new URL(`examples/${name}`,root),new URL(`assets/${name}`,target));
console.log(`Static demo ready: ${fileURLToPath(target)}`);
