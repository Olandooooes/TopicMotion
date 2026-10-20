import {readFile,writeFile,mkdir,copyFile,access,rm,readdir} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {validateJob,allocateFrames,subtitleTime} from './validate.mjs';
import {readPcmWave,assembleWave} from './pcm.mjs';
const run=promisify(execFile), require=createRequire(import.meta.url);
const engine=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2), flags={};
for(let i=0;i<args.length;i+=2){if(!['--job','--out','--browser'].includes(args[i])||!args[i+1])throw new Error('用法: --job job.json --out 输出目录 [--browser Chrome路径]');flags[args[i].slice(2)]=args[i+1];}
if(!flags.job||!flags.out)throw new Error('必须提供 --job 和 --out。');
if(process.platform!=='darwin')throw new Error('当前语音适配器使用 macOS say；其他系统需要先实现本地 TTS 适配器，不能静默生成无声成片。');
const job=validateJob(JSON.parse(await readFile(resolve(flags.job),'utf8')));
const out=resolve(flags.out);
await mkdir(out,{recursive:true});
if((await readdir(out)).length)throw new Error('输出目录非空，请使用新目录，避免覆盖已有文件。');
const assets=join(out,'assets');await mkdir(assets,{recursive:true});
await copyFile(join(engine,'public/robot.svg'),join(assets,'robot.svg'));
await writeFile(join(out,'input.json'),JSON.stringify(job,null,2));
const binaryDir=dirname(require.resolve(`@remotion/compositor-${process.platform}-${process.arch}/package.json`));
const mediaEnv={...process.env,DYLD_LIBRARY_PATH:binaryDir};
const ffprobe=join(binaryDir,'ffprobe');
async function mediaLength(path){const r=await run(ffprobe,['-v','quiet','-show_entries','format=duration','-of','csv=p=0',path],{env:mediaEnv});return Number(r.stdout.trim());}
const lengths=allocateFrames(job.scenes,job.duration),scenes=[];
let from=0,subtitleIndex=1,srt='';
console.log(`AUTO VIDEO | ${job.topic} | ${job.style} | ${job.duration}s`);
for(let i=0;i<job.scenes.length;i++){
 const scene=job.scenes[i],duration=lengths[i]/30;
 console.log(`[配音 ${i+1}/${job.scenes.length}] ${scene.title}`);
 const chunks=scene.narration.match(/[^。！？!?；;]+[。！？!?；;]?/gu)?.map(s=>s.trim()).filter(Boolean)||[];
 const raw=[];
 for(let j=0;j<chunks.length;j++){
  const text=join(assets,`speech-${i}-${j}.txt`),audio=join(assets,`speech-${i}-${j}.wav`);
  await writeFile(text,chunks[j]);
  await run('/usr/bin/say',['-v','Tingting','-r','185','--file-format=WAVE','--data-format=LEI16@24000','-f',text,'-o',audio],{timeout:60000});
  const pcm=readPcmWave(await readFile(audio));
  raw.push({text:chunks[j],textFile:text,file:audio,...pcm});
 }
 const total=raw.reduce((n,c)=>n+c.duration,0),pause=.14;
 const target=duration-.3-pause*Math.max(0,raw.length-1);
 const speed=Math.max(.85,total/target);
 if(speed>1.6)throw new Error(`场景“${scene.title}”口播过长，需压缩文案或延长视频；未截断口播。`);
 let rate=Math.round(185*speed);
 for(let attempt=0;attempt<2;attempt++){
  for(const clip of raw){
   await run('/usr/bin/say',['-v','Tingting','-r',String(rate),'--file-format=WAVE','--data-format=LEI16@24000','-f',clip.textFile,'-o',clip.file],{timeout:60000});
   Object.assign(clip,readPcmWave(await readFile(clip.file)));
  }
  const spoken=raw.reduce((n,c)=>n+c.duration,0);
  if(spoken<=target)break;
  rate=Math.ceil(rate*spoken/target*1.03);
  if(rate>296||attempt===1)throw new Error(`场景“${scene.title}”口播超时，请缩短文案。`);
 }
 let cursor=.1;
 const captions=[],clips=[];
 for(let j=0;j<raw.length;j++){
  const end=cursor+raw[j].duration;
  clips.push({start:cursor,data:raw[j].data});
  const pieces=raw[j].text.match(/.{1,23}/gu)||[];
  for(let k=0;k<pieces.length;k++){
   const startFrame=Math.round((cursor+(end-cursor)*k/pieces.length)*30),endFrame=Math.min(lengths[i],Math.round((cursor+(end-cursor)*(k+1)/pieces.length)*30));
   captions.push({text:pieces[k],from:startFrame,to:endFrame});
   srt+=`${subtitleIndex++}\n${subtitleTime(from+startFrame)} --> ${subtitleTime(from+endFrame)}\n${pieces[k]}\n\n`;
  }
  cursor=end+pause;
 }
 const name=`voice-${i}.wav`;
 await writeFile(join(assets,name),assembleWave(clips,duration));
 for(const r of raw)await rm(r.file); // temporary synthesis, not user-supplied audio
 scenes.push({...scene,startFrame:from,durationInFrames:lengths[i],captions,audioSrc:name});from+=lengths[i];
}
const inputProps={...job,scenes};
await writeFile(join(out,'timeline.json'),JSON.stringify(inputProps,null,2));
await writeFile(join(out,'captions.srt'),srt);
await writeFile(join(out,'script.txt'),job.scenes.map((s,i)=>`${i+1}. ${s.title}\n${s.narration}`).join('\n\n'));
let browser=flags.browser||process.env.AUTO_VIDEO_BROWSER;
if(!browser){const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';if(await access(chrome).then(()=>true,()=>false))browser=chrome;}
console.log('[画面] 生成动画与字幕');
const serveUrl=await bundle({entryPoint:join(engine,'src/index.tsx'),publicDir:assets,outDir:join(out,'bundle')});
const composition=await selectComposition({serveUrl,id:'AutoVideo',inputProps,browserExecutable:browser});
let previous=-1;
await renderMedia({composition,serveUrl,inputProps,browserExecutable:browser,codec:'h264',audioCodec:'aac',outputLocation:join(out,'movie.mp4'),concurrency:2,crf:21,overwrite:false,onProgress:({progress})=>{const n=Math.floor(progress*10)*10;if(n!==previous){previous=n;console.log(`[渲染] ${n}%`);}}});
await renderStill({composition,serveUrl,inputProps,browserExecutable:browser,output:join(out,'poster.png'),frame:Math.min(from-1,Math.floor(from*.88)),imageFormat:'png'});
await mkdir(join(out,'style-previews'),{recursive:true});
for(const style of ['cartoon','diagram','editorial']){
 const styleProps={...inputProps,style};
 const styleComposition=await selectComposition({serveUrl,id:'AutoVideo',inputProps:styleProps,browserExecutable:browser});
 await renderStill({composition:styleComposition,serveUrl,inputProps:styleProps,browserExecutable:browser,output:join(out,'style-previews',`${style}.png`),frame:Math.min(from-1,Math.floor(from*.4)),imageFormat:'png'});
}
const measured=await mediaLength(join(out,'movie.mp4'));
await writeFile(join(out,'report.json'),JSON.stringify({topic:job.topic,style:job.style,requestedSeconds:job.duration,actualSeconds:measured,frames:from,fps:30,width:1280,height:720,narrator:'macOS Tingting synthetic voice; local preview only, rights not re-licensed',sourceNotes:job.sources||[],createdAt:new Date().toISOString()},null,2));
await rm(join(out,'bundle'),{recursive:true,force:true});
console.log(`[完成] ${join(out,'movie.mp4')} (${measured.toFixed(3)}s)`);
