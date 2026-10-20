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
