import {t,setMessage,getLanguage} from './i18n.mjs?v=i18n-1';
const topic=document.getElementById('prompt-topic');
const style=document.getElementById('prompt-style');
const duration=document.getElementById('prompt-duration');
const result=document.getElementById('prompt-result');
const status=document.getElementById('prompt-status');
const installationGuide=document.querySelector('.prompt-panel a[href*="#quick-start"]');
function update(){result.value=t('prompt.template',{topic:topic.value.trim()||t('prompt.fallbackTopic'),seconds:duration.value,style:t(`style.${style.value}`)});}
function languageUpdate(){
 if(['What is RAG?','RAG 是什么'].includes(topic.value))topic.value=t('prompt.defaultTopic');
 installationGuide.href=`https://github.com/Olandooooes/TopicMotion${getLanguage()==='zh'?'/blob/main/README.zh-CN.md#安装与第一次使用':'#quick-start'}`;
 update();
}
for(const input of [topic,style,duration])input.addEventListener('input',update);
document.addEventListener('topicmotion:languagechange',languageUpdate);
languageUpdate();
document.getElementById('copy-prompt').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(result.value);setMessage(status,'copy.ok');}
 catch{result.focus();result.select();setMessage(status,'copy.manual');}
});
for(const video of document.querySelectorAll('video'))video.addEventListener('play',()=>{
 for(const other of document.querySelectorAll('video'))if(other!==video)other.pause();
});
// Only the introduction preloads. Language changes never replace video elements.
const intro=document.getElementById('project-intro');
const introStatus=document.getElementById('intro-status');
const retry=document.getElementById('intro-retry');
let slowTimer;
function ready(){clearTimeout(slowTimer);retry.classList.add('hidden');setMessage(introStatus,intro.ended?'intro.ended':intro.paused?'intro.ready':'intro.playing');}
function waiting(){
 clearTimeout(slowTimer);setMessage(introStatus,'intro.waiting');
 slowTimer=setTimeout(()=>{if(intro.readyState<3){setMessage(introStatus,'intro.slow');retry.classList.remove('hidden');}},12000);
}
intro.addEventListener('loadstart',waiting);
intro.addEventListener('waiting',waiting);
intro.addEventListener('canplay',ready);
intro.addEventListener('playing',ready);
intro.addEventListener('pause',()=>{if(intro.readyState>=3)ready();});
intro.addEventListener('ended',()=>setMessage(introStatus,'intro.ended'));
intro.addEventListener('error',()=>{clearTimeout(slowTimer);setMessage(introStatus,'intro.error');retry.classList.remove('hidden');});
retry.addEventListener('click',async()=>{intro.load();try{await intro.play();}catch{setMessage(introStatus,'intro.click');}});
if(intro.readyState>=3)ready();else waiting();
