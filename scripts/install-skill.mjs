import {cp,access,mkdir} from 'node:fs/promises';
import {homedir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
export async function installSkill(source,destination) {
 if(await access(destination).then(()=>true,()=>false))throw new Error('目标 Skill 已存在，未覆盖。请先审阅或备份已有版本。');
 await access(join(source,'SKILL.md'));
 await mkdir(resolve(destination,'..'),{recursive:true});
 await cp(source,destination,{recursive:true,errorOnExist:true,force:false,filter:path=>!path.split(/[\\/]/).some(p=>['node_modules','.venv-tts','__pycache__','.DS_Store'].includes(p))});
 return destination;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const source=fileURLToPath(new URL('../skills/auto-video/',import.meta.url));
 const destination=join(process.env.CODEX_HOME||join(homedir(),'.codex'),'skills','auto-video');
 try {console.log('Installed:',await installSkill(source,destination));console.log('在新对话中使用 $auto-video；若未出现在列表中，请重启 Codex。');}
 catch(error){console.error(error.message);process.exitCode=1;}
}
