import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateJob,allocateFrames,subtitleTime} from '../skills/auto-video/assets/renderer/validate.mjs';
const scene={title:'测试',visual:'flow',labels:['输入','处理','输出'],narration:'这是一个测试。'};
test('video plan rejects unsupported style and excessive labels',()=>{
 assert.throws(()=>validateJob({topic:'主题',style:'live-footage',duration:15,scenes:[scene]}));
 assert.throws(()=>validateJob({topic:'主题',style:'cartoon',duration:15,scenes:[{...scene,labels:['一','二','三','四']}]}));
});
test('variable scene lengths still sum to exact requested frames',()=>{
 const scenes=[scene,{...scene,narration:'这是一段更长、更详细的说明。'},scene];
 const frames=allocateFrames(scenes,15);
 assert.equal(frames.reduce((a,b)=>a+b,0),450);assert.ok(frames.every(n=>n>=60));assert.ok(frames[1]>frames[0]);
});
test('SRT uses measured frame times, including minute boundaries',()=>{
 assert.equal(subtitleTime(45),'00:00:01,500');assert.equal(subtitleTime(1800),'00:01:00,000');
});
import {readPcmWave,assembleWave} from '../skills/auto-video/assets/renderer/pcm.mjs';
test('bounded PCM assembly preserves audio and exact scene duration',()=>{
 const samples=Buffer.alloc(4800);samples.writeInt16LE(1234,0);
 const wave=assembleWave([{start:.1,data:samples}],5);
 const pcm=readPcmWave(wave);
 assert.equal(pcm.duration,5);assert.equal(wave.length,240044);assert.equal(pcm.data.readInt16LE(4800),1234);
 assert.throws(()=>assembleWave([{start:4.99,data:samples}],5));
});
import {installSkill} from './install-skill.mjs';
import {mkdtemp,mkdir,writeFile,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('punctuation-only narration cannot silently produce a voiceless video',()=>{
 assert.throws(()=>validateJob({topic:'主题',style:'cartoon',duration:15,scenes:[{...scene,narration:'。。。！？'}]}));
});
test('skill installer excludes dependencies and refuses existing installations',async()=>{
 const temporary=await mkdtemp(join(tmpdir(),'auto-video-install-'));
 try {
  const source=join(temporary,'source'),destination=join(temporary,'installed');
  await mkdir(join(source,'node_modules'),{recursive:true});
  await writeFile(join(source,'SKILL.md'),'skill');await writeFile(join(source,'node_modules','private.txt'),'excluded');
  await installSkill(source,destination);assert.equal(await readFile(join(destination,'SKILL.md'),'utf8'),'skill');
  await assert.rejects(access(join(destination,'node_modules')));await assert.rejects(installSkill(source,destination));
 } finally {await rm(temporary,{recursive:true,force:true});}
});
import {checkRuntime} from '../skills/auto-video/scripts/preflight.mjs';
test('unsupported platforms and Node versions fail before dependency installation',()=>{
 for(const platform of ['win32','linux'])assert.throws(()=>checkRuntime(platform,'24.0.0',false));
 assert.throws(()=>checkRuntime('darwin','20.19.0',true));assert.throws(()=>checkRuntime('darwin','22.12.0',true));
 assert.throws(()=>checkRuntime('darwin','24.0.0',false));assert.doesNotThrow(()=>checkRuntime('darwin','24.0.0',true));
});
