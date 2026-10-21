import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join} from 'node:path';
import {readPcmWave,assembleWave} from './pcm.mjs';
import {subtitleTime} from './validate.mjs';
import {cachedVoice,voiceDescriptor} from './voice-cache.mjs';
const run=promisify(execFile);
export function naturalFrames(groups,seconds,fps=30){
 const minimum=groups.map(g=>Math.max(2,g.reduce((n,c)=>n+c.duration,0)+.4+Math.max(0,g.length-1)*.32));
 const sum=minimum.reduce((a,b)=>a+b,0);
 if(sum>seconds)throw new Error(`自然口播需要至少 ${sum.toFixed(1)} 秒；请缩短文案或增加时长，未加速或截断声音。`);
 let used=0;return minimum.map((s,i)=>{const n=i===minimum.length-1?seconds*fps-used:Math.round((s+(seconds-sum)/minimum.length)*fps);used+=n;return n;});
}
export async function naturalTimeline({job,engine,assets,binaryDir,mediaEnv,cacheDir=join(engine,'.voice-cache')}){
 const provider=job.voice?.provider||'neural';let python=process.env.AUTO_VIDEO_TTS_PYTHON;
 let prepared=false;
 async function prepare(){
  if(prepared)return;prepared=true;
  if(provider==='neural'&&!python){
   const venv=join(engine,'.venv-tts');python=join(venv,'bin/python');
   if(!await access(python).then(()=>true,()=>false))await run('python3',['-m','venv',venv],{timeout:60000});
   try{await run(python,['-c',"import importlib.metadata; assert importlib.metadata.version('edge-tts') == '7.3.1'"]);}catch{console.log('[配音] 首次安装 edge-tts 7.3.1');await run(python,['-m','pip','install','edge-tts==7.3.1'],{timeout:180000});}
  }
 }
 const cache={hits:0,generated:0,directory:cacheDir};
 const groups=[];
 for(const [i,scene] of job.scenes.entries()){
  const clips=[];const chunks=scene.narration.match(/[^。！？!?；;]+[。！？!?；;]?/gu)?.map(s=>s.trim()).filter(Boolean)||[];
  for(const [j,text] of chunks.entries()){
   console.log(`[自然配音 ${i+1}.${j+1}] ${text}`);const stem=join(assets,`speech-${i}-${j}`);
   const clip=await cachedVoice({cacheDir,descriptor:voiceDescriptor(text,job.voice),synthesize:async()=>{
   await prepare();
   if(provider==='neural'){
    await run(python,[join(engine,'neural.py'),text,stem+'.mp3',String(job.voice?.rate??-12)],{timeout:95000});
    await run(join(binaryDir,'ffmpeg'),['-v','error','-y','-i',stem+'.mp3','-ar','24000','-ac','1','-fs','12000000',stem+'.wav'],{env:mediaEnv,timeout:30000,maxBuffer:1024*1024});
   }else{
    await writeFile(stem+'.txt',text);await run('/usr/bin/say',['-v','Tingting','-r',String(Math.round(185*(1+(job.voice?.rate??-12)/100))),'--file-format=WAVE','--data-format=LEI16@24000','-f',stem+'.txt','-o',stem+'.wav'],{timeout:60000});
   }
   return await readFile(stem+'.wav');}});
   cache[clip.hit?'hits':'generated']++;console.log(clip.hit?'[缓存] 命中':'[缓存] 新生成');
   clips.push({text,...clip});
  }groups.push(clips);
 }
 const lengths=naturalFrames(groups,job.duration);const scenes=[];let start=0,srt='',count=1;
 for(const [i,scene] of job.scenes.entries()){
  let cursor=.1;const captions=[],clips=[],utteranceStarts=[];
  for(const clip of groups[i]){
   utteranceStarts.push(Math.round(cursor*30));
   clips.push({start:cursor,data:clip.data});let text=clip.text.replaceAll('R A G','RAG'),pieces=[];
   while(text.length>23){let cut=text.lastIndexOf('，',22)+1;if(cut<6)cut=23;pieces.push(text.slice(0,cut));text=text.slice(cut);}if(text)pieces.push(text);
   const chars=pieces.join('').length;let consumed=0;
   for(const piece of pieces){const from=Math.round((cursor+clip.duration*consumed/chars)*30);consumed+=piece.length;const to=Math.round((cursor+clip.duration*consumed/chars)*30);captions.push({text:piece,from,to});srt+=`${count++}\n${subtitleTime(start+from)} --> ${subtitleTime(start+to)}\n${piece}\n\n`;}
   cursor+=clip.duration+.32;
  }
  const audioSrc=`voice-${i}.wav`;await writeFile(join(assets,audioSrc),assembleWave(clips,lengths[i]/30));scenes.push({...scene,startFrame:start,durationInFrames:lengths[i],phaseSplitFrame:utteranceStarts[2]??Math.floor(lengths[i]/2),captions,audioSrc});start+=lengths[i];
 }
 return {scenes,srt,frames:start,cache,narrator:provider==='neural'?'Edge TTS zh-CN-XiaoxiaoNeural (online), local review; rights not re-licensed':'macOS Tingting, local review; rights not re-licensed'};
}
