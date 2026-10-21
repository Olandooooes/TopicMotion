// Keep the original download; generate a smaller, seekable browser delivery copy.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';
import {dirname,join,resolve} from 'node:path';
import {rename,stat} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const bin=dirname(require.resolve(`@remotion/compositor-${process.platform}-${process.arch}/package.json`));
const folder=resolve(import.meta.dirname,'../examples/topicmotion-intro');
const output=join(folder,'intro-web-v1.mp4'),temp=join(folder,'intro-web-v1.tmp.mp4');
await promisify(execFile)(join(bin,process.platform==='win32'?'ffmpeg.exe':'ffmpeg'),[
 '-y','-v','error','-i',join(folder,'topicmotion-intro-30s.mp4'),
 '-c:v','libx264','-preset','slow','-crf','28','-maxrate','500k','-bufsize','1000k',
 '-pix_fmt','yuv420p','-g','30','-c:a','aac','-b:a','64k','-ac','1','-movflags','+faststart',temp
],{env:{...process.env,DYLD_LIBRARY_PATH:bin}});
await rename(temp,output);
console.log(`Web introduction: ${(await stat(output)).size} bytes`);
