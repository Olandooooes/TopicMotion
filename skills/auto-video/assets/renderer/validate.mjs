export function validateJob(job) {
  if (!job || typeof job.topic !== 'string' || !job.topic.trim() || job.topic.length > 100) throw new Error('topic 需要 1–100 字。');
  if (!['cartoon','diagram','editorial'].includes(job.style)) throw new Error('style 应为 cartoon、diagram 或 editorial。');
  if (!Number.isInteger(job.duration) || job.duration < 5 || job.duration > 180) throw new Error('duration 应为 5–180 秒的整数。');
  if (!Array.isArray(job.scenes) || job.scenes.length < 1 || job.scenes.length > 12 || job.duration / job.scenes.length < 2) throw new Error('需要 1–12 个场景，每场至少 2 秒。');
  for (const scene of job.scenes) {
    if (!scene || typeof scene.title !== 'string' || !scene.title.trim() || scene.title.length > 18) throw new Error('场景标题需要 1–18 字。');
    if (typeof scene.narration !== 'string' || !scene.narration.trim() || !/[\p{L}\p{N}]/u.test(scene.narration) || scene.narration.length > 240) throw new Error('每场口播需要 1–240 字。');
    if (!['flow','search','evidence','summary','fermentation','cache','hook','index','retrieve','context','answer','limits'].includes(scene.visual)) throw new Error('未知 visual。');
    if (!Array.isArray(scene.labels) || scene.labels.length < 1 || scene.labels.length > 3 || scene.labels.some(x => typeof x !== 'string' || !x.trim() || x.length > (scene.visual === 'flow' ? 7 : 17))) throw new Error('labels 需要 1–3 条短标签；流程标签最多 7 字，其他最多 17 字。');
  }
  if(job.voice && (!['neural','system'].includes(job.voice.provider)|| (job.voice.rate!==undefined && (!Number.isInteger(job.voice.rate)||job.voice.rate < -30||job.voice.rate>10)))) throw new Error('voice: provider 为 neural/system，rate 为 -30 到 10 的整数百分比。');
  for(const scene of job.scenes) for(const [key,max] of Object.entries({detail:24,result:18,sourceLabel:30,note:80})) if(scene[key]!==undefined&&(typeof scene[key]!=='string'||scene[key].length>max))throw new Error(`${key} 最多 ${max} 字。`);
  for(const scene of job.scenes) if(['fermentation','cache'].includes(scene.visual)&&scene.labels.length!==3)throw new Error('fermentation/cache 需要恰好3个标签。');
  return job;
}
export function allocateFrames(scenes, duration, fps = 30) {
  const total = duration * fps, minimum = 2 * fps;
  const weights = scenes.map(s => s.narration.length), sum = weights.reduce((a,b)=>a+b,0);
  let used = 0;
  return weights.map((w,i)=>{
    const count = i === weights.length-1 ? total-used : minimum+Math.floor((total-minimum*weights.length)*w/sum);
    used += count; return count;
  });
}
export function subtitleTime(frame,fps=30) {
  const ms=Math.round(frame/fps*1000);
  return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;
}
