import {readFile,writeFile,mkdir,copyFile,access,rm,readdir} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {validateJob,allocateFrames,subtitleTime} from './validate.mjs';
import {naturalTimeline} from './natural.mjs';
const run=promisify(execFile), require=createRequire(import.meta.url);
const engine=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2), flags={};
for(let i=0;i<args.length;i+=2){if(!['--job','--out','--browser','--cache'].includes(args[i])||!args[i+1])throw new Error('用法: --job job.json --out 输出目录 [--browser Chrome路径]');flags[args[i].slice(2)]=args[i+1];}
if(!flags.job||!flags.out)throw new Error('必须提供 --job 和 --out。');
if(process.platform!=='darwin')throw new Error('当前语音适配器使用 macOS say；其他系统需要先实现本地 TTS 适配器，不能静默生成无声成片。');
const job=validateJob(JSON.parse(await readFile(resolve(flags.job),'utf8')));
const out=resolve(flags.out);
await mkdir(out,{recursive:true});
if((await readdir(out)).length)throw new Error('输出目录非空，请使用新目录，避免覆盖已有文件。');
const assets=join(out,'assets');await mkdir(assets,{recursive:true});
for(const name of ['robot.svg','librarian.svg'])await copyFile(join(engine,'public',name),join(assets,name));
await writeFile(join(out,'input.json'),JSON.stringify(job,null,2));
const binaryDir=dirname(require.resolve(`@remotion/compositor-${process.platform}-${process.arch}/package.json`));
const mediaEnv={...process.env,DYLD_LIBRARY_PATH:binaryDir};
const ffprobe=join(binaryDir,'ffprobe');
async function mediaLength(path){const r=await run(ffprobe,['-v','quiet','-show_entries','format=duration','-of','csv=p=0',path],{env:mediaEnv});return Number(r.stdout.trim());}
const {scenes,srt,frames:from,narrator,cache}=await naturalTimeline({job,engine,assets,binaryDir,mediaEnv,cacheDir:flags.cache?resolve(flags.cache):undefined});
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
await writeFile(join(out,'report.json'),JSON.stringify({topic:job.topic,style:job.style,requestedSeconds:job.duration,actualSeconds:measured,frames:from,fps:30,width:1280,height:720,narrator,cache,sourceNotes:job.sources||[],createdAt:new Date().toISOString()},null,2));
await rm(join(out,'bundle'),{recursive:true,force:true});
console.log(`[完成] ${join(out,'movie.mp4')} (${measured.toFixed(3)}s)`);
