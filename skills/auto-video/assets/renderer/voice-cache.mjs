import {createHash,randomUUID} from 'node:crypto';
import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {readPcmWave} from './pcm.mjs';
const digest=x=>createHash('sha256').update(x).digest('hex');
export const voiceDescriptor=(text,voice={})=>({schema:1,strategy:'sentence-pcm-v1',text,provider:voice.provider||'neural',voice:voice.provider==='system'?'Tingting':'zh-CN-XiaoxiaoNeural',rate:voice.rate??-12,client:voice.provider==='system'?'macOS-say':'edge-tts-7.3.1',format:'PCM-s16le-mono-24000'});
export async function cachedVoice({cacheDir,descriptor,synthesize}){
 const key=digest(JSON.stringify(descriptor)),path=join(cacheDir,key+'.json');
 function verify(buffer){if(buffer.length>12000000)throw Error('Oversized cached audio');const pcm=readPcmWave(buffer);if(pcm.duration<=0||pcm.duration>180)throw Error('Invalid cached duration');return pcm;}
 try{const raw=await readFile(path);if(raw.length>17000000)throw Error('Oversized cache entry');const entry=JSON.parse(raw);const wave=Buffer.from(entry.wave,'base64');if(JSON.stringify(entry.descriptor)!==JSON.stringify(descriptor)||entry.sha256!==digest(wave))throw Error('Cache checksum mismatch');return {...verify(wave),hit:true,key};}catch(error){if(error?.code==='EACCES')throw error;}
 const wave=await synthesize(),pcm=verify(wave);
 await mkdir(cacheDir,{recursive:true,mode:0o700});const tmp=join(cacheDir,key+'.'+randomUUID()+'.tmp');
 try{await writeFile(tmp,JSON.stringify({descriptor,sha256:digest(wave),wave:wave.toString('base64')}),{mode:0o600,flag:'wx'});await rename(tmp,path);}finally{await rm(tmp,{force:true});}
 return {...pcm,hit:false,key};
}
