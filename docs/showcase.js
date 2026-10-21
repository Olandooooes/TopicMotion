const topic=document.getElementById('prompt-topic');
const style=document.getElementById('prompt-style');
const duration=document.getElementById('prompt-duration');
const result=document.getElementById('prompt-result');
const status=document.getElementById('prompt-status');
function update(){result.value=`用 $auto-video 把“${topic.value.trim()||'你的话题'}”做成 ${duration.value} 秒${style.value}讲解视频，自动完成资料核验、口播稿、分镜、配音、字幕与 MP4 成片。`;}
for(const input of [topic,style,duration])input.addEventListener('input',update);
update();
document.getElementById('copy-prompt').addEventListener('click',async()=>{
 try {await navigator.clipboard.writeText(result.value);status.textContent='已复制。请粘贴到安装了 Skill 的 Codex 对话中。';}
 catch {result.focus();result.select();status.textContent='浏览器未允许自动复制，指令已选中，请手动复制。';}
});
for(const video of document.querySelectorAll('video')) video.addEventListener('play',()=>{
 for(const other of document.querySelectorAll('video'))if(other!==video)other.pause();
});

// Only the introduction preloads. Other demos wait for a deliberate play.
const intro=document.getElementById('project-intro');
const introStatus=document.getElementById('intro-status');
const retry=document.getElementById('intro-retry');
let slowTimer;
function ready(){clearTimeout(slowTimer);retry.classList.add('hidden');introStatus.textContent=intro.paused?'已就绪 · 点击播放，含中文口播和字幕':'正在播放 · 中文口播与同步字幕';}
function waiting(){
 clearTimeout(slowTimer);introStatus.textContent='正在缓冲…';
 slowTimer=setTimeout(()=>{if(intro.readyState<3){introStatus.textContent='连接较慢，可重新加载，或下载原版 MP4。';retry.classList.remove('hidden');}},12000);
}
intro.addEventListener('loadstart',waiting);
intro.addEventListener('waiting',waiting);
intro.addEventListener('canplay',ready);
intro.addEventListener('playing',ready);
intro.addEventListener('pause',()=>{if(intro.readyState>=3)ready();});
intro.addEventListener('ended',()=>{introStatus.textContent='播放完成 · 可从头重播';});
intro.addEventListener('error',()=>{clearTimeout(slowTimer);introStatus.textContent='视频加载失败，请重新加载，或下载原版 MP4。';retry.classList.remove('hidden');});
retry.addEventListener('click',async()=>{intro.load();try{await intro.play();}catch{introStatus.textContent='请点击视频内的播放键。';}});
if(intro.readyState>=3)ready();else waiting();
