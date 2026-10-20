import {createRequire} from 'node:module';
import {readFile,access} from 'node:fs/promises';
import {resolve,join,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=resolve(process.argv[2]||'');
if(!process.argv[2])throw new Error('提供解压后的 auto-video 文件夹。');
for(const file of ['SKILL.md','LICENSE','THIRD_PARTY_NOTICES.md','AUDIO_LICENSE.md'])await access(join(root,file));
const manifest=JSON.parse(await readFile(join(root,'assets/renderer/package.json'),'utf8'));
const require=createRequire(pathToFileURL(join(root,'assets/renderer/package.json')));
for(const name of Object.keys(manifest.dependencies)){
 const path=require.resolve(name+'/package.json');
 if(!path.startsWith(root+sep))throw new Error('依赖借用了 Skill 目录之外的安装：'+name);
}
const {validateJob}=await import(pathToFileURL(join(root,'assets/renderer/validate.mjs')));
validateJob(JSON.parse(await readFile(join(root,'examples/rag-15s.json'),'utf8')));
console.log('Independent Skill package: dependencies, licenses and example validated.');
