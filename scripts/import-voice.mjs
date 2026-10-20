import {copyFile, writeFile, mkdir} from 'node:fs/promises';
import {extname, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export function parseArgs(args) {
  const result = {};
  for (let i=0; i<args.length; i+=2) {
    if (!['--file','--license-note'].includes(args[i]) || !args[i+1]) throw new Error('用法: npm run voice:import -- --file /path/voice.wav --license-note "本人录音，允许分发"');
    result[args[i].slice(2)] = args[i+1];
  }
  if (!result.file || !result['license-note']?.trim()) throw new Error('必须提供音频文件和授权来源说明。');
  if (!['.wav','.mp3','.m4a','.ogg'].includes(extname(result.file).toLowerCase())) throw new Error('支持 wav/mp3/m4a/ogg。');
  return result;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const name = `voice${extname(args.file).toLowerCase()}`;
    await mkdir(resolve(root,'public/audio'), {recursive:true});
    await copyFile(resolve(args.file), resolve(root,'public/audio',name));
    await writeFile(resolve(root,'public/audio/voice-license.local.txt'), args['license-note']+'\n');
    await writeFile(resolve(root,'examples/with-voice.json'), JSON.stringify({audioSrc:`audio/${name}`,audioOffsetSeconds:0,audioVolume:1},null,2)+'\n');
    console.log('配音已导入（默认不纳入 Git）。运行 npm run render:voice；字幕时序见 src/FiveSecond.tsx 或 examples/with-voice.json。');
  } catch(error) {console.error(error.message);process.exitCode=1;}
}
