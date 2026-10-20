import {voicePosition, needsResync} from './timeline.mjs';
const $ = id => document.getElementById(id);
const video = $('demo'), play = $('play'), status = $('status');
const input = $('voice-file'), delayInput = $('voice-delay'), volume = $('voice-volume');
const note = $('voice-status'), remove = $('voice-remove');
let context, gain, buffer, source, anchor, request = 0;

function audioContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('此浏览器不支持本地配音，请使用新版 Chrome、Edge、Safari 或 Firefox。');
    context = new AudioContextClass();
    gain = context.createGain();
    gain.gain.value = Number(volume.value);
    gain.connect(context.destination);
  }
  return context;
}
function stopVoice() {
  if (source) {
    source.onended = null;
    try { source.stop(); } catch { /* A source may already have ended. */ }
    source.disconnect();
    source = null;
  }
  anchor = null;
}
function delay() {
  return Math.max(0, Math.min(4.9, Number(delayInput.value) || 0));
}
function syncVoice(force = false) {
  if (!buffer || !context || context.state !== 'running' || video.paused || video.ended || video.seeking || video.readyState < 3) {
    stopVoice();
    return;
  }
  const expected = voicePosition(video.currentTime, delay(), buffer.duration, video.duration);
  if (expected === null) { stopVoice(); return; }
  const actual = anchor ? anchor.offset + (context.currentTime - anchor.clock) * anchor.rate : Infinity;
  if (!force && source && !needsResync(expected, actual)) return;
  stopVoice();
  source = context.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = video.playbackRate;
  source.connect(gain);
  anchor = {offset: expected, clock: context.currentTime, rate: video.playbackRate};
  source.start(context.currentTime, expected);
}
function tick() {
  syncVoice();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
async function unlock() {
  if (buffer) {
    try { await audioContext().resume(); }
    catch { note.textContent = '浏览器未允许录音播放，请点击“播放动画”重试。'; }
  }
}
async function start() {
  await unlock();
  try { await video.play(); }
  catch { status.textContent = '未能开始播放，请使用视频内置播放键重试。'; }
}
play.addEventListener('click', () => {
  if (video.paused) { if (video.ended) video.currentTime = 0; start(); }
  else video.pause();
});
$('replay').addEventListener('click', () => { stopVoice(); video.currentTime = 0; start(); });
$('loop').addEventListener('change', event => { video.loop = event.target.checked; });
video.addEventListener('play', () => {
  play.textContent = '暂停动画';
  status.textContent = buffer ? '正在播放 · 你的录音' : '正在播放 · 无声示例';
  unlock().then(() => syncVoice(true));
});
video.addEventListener('pause', () => {
  stopVoice();
  play.textContent = video.ended ? '再看一遍' : '继续播放';
  status.textContent = video.ended ? '播放完成 · 5 秒' : '已暂停';
});
video.addEventListener('ended', () => {
  stopVoice(); play.textContent = '再看一遍'; status.textContent = '播放完成 · 5 秒';
});
video.addEventListener('seeking', stopVoice);
video.addEventListener('seeked', () => syncVoice(true));
video.addEventListener('ratechange', () => syncVoice(true));
video.addEventListener('waiting', stopVoice);
video.addEventListener('error', () => $('error').classList.remove('hidden'));
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });

function updateNote(name) {
  const available = Math.max(0, Math.min(5 - delay(), buffer.duration));
  note.textContent = `${name} · 录音 ${buffer.duration.toFixed(2)} 秒 · 将在动画 ${delay().toFixed(1)} 秒处开始，最多播放 ${available.toFixed(2)} 秒。${buffer.duration + delay() > 5 ? '超出片尾的部分不会播放。' : '录音结束后保持无声。'}`;
}
let filename = '';
input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (!file) return;
  const token = ++request;
  video.pause(); stopVoice(); buffer = null; remove.disabled = true;
  note.textContent = '正在读取录音…';
  try {
    if (!file.size || file.size > 25 * 1024 * 1024) throw new Error('请选择非空且不超过 25 MB 的录音。');
    const ctx = audioContext();
    // Resume from the file selection gesture; playback still requires pressing Play.
    ctx.resume().catch(() => {});
    const decoded = await ctx.decodeAudioData(await file.arrayBuffer());
    if (token !== request) return;
    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0 || decoded.duration > 300) throw new Error('请选择时长不超过 5 分钟的录音，建议先裁剪到约 5 秒。');
    buffer = decoded; filename = file.name; remove.disabled = false;
    video.currentTime = 0; status.textContent = '录音已就绪 · 点击播放动画';
    updateNote(filename);
  } catch (error) {
    if (token !== request) return;
    note.textContent = error instanceof Error && ['EncodingError', 'NotSupportedError'].includes(error.name) ? '无法解码该录音，请转换为 MP3 或 WAV 后重试。' : `录音未加载：${error.message || '不支持此格式，请尝试 MP3 或 WAV。'}`;
    input.value = ''; status.textContent = '录音未加载 · 可播放无声示例';
  }
});
delayInput.addEventListener('change', () => {
  delayInput.value = delay().toFixed(1);
  syncVoice(true);
  if (buffer) updateNote(filename);
});
volume.addEventListener('input', () => {
  $('volume-label').textContent = `${Math.round(Number(volume.value) * 100)}%`;
  if (gain) gain.gain.value = Number(volume.value);
});
remove.addEventListener('click', () => {
  ++request; video.pause(); stopVoice(); buffer = null; filename = '';
  input.value = ''; remove.disabled = true;
  note.textContent = '已移除录音，当前播放无声示例。'; status.textContent = '5 秒 · 无声示例 · 含字幕';
});
window.addEventListener('pagehide', event => { video.pause(); stopVoice(); if (!event.persisted) { ++request; if (context) context.close(); } });
