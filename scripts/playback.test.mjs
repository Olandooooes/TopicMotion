import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('homepage reserves eager video loading for the introduction',async()=>{
 const html=await readFile(new URL('docs/index.html',root),'utf8');
 const tags=html.match(/<video\b[^>]*>/g);
 assert.ok(tags.length>1);
 for(const tag of tags)assert.match(tag,tag.includes('id="project-intro"')?/preload="auto"/:/preload="none"/);
 assert.match(html,/<source src="assets\/topicmotion-intro\/intro-web-v1\.mp4"/);
});
test('web introduction is smaller and has streaming metadata before media',async()=>{
 const web=await readFile(new URL('examples/topicmotion-intro/intro-web-v1.mp4',root));
 const original=await readFile(new URL('examples/topicmotion-intro/topicmotion-intro-30s.mp4',root));
 assert.ok(web.length<original.length*.8);
 const atoms=[];for(let offset=0;offset+8<=web.length;){const size=web.readUInt32BE(offset);assert.ok(size>=8);atoms.push(web.toString('ascii',offset+4,offset+8));offset+=size;}
 assert.ok(atoms.includes('moov')&&atoms.includes('mdat'));
 assert.ok(atoms.indexOf('moov')<atoms.indexOf('mdat'));
});
