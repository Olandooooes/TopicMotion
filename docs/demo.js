import {t,setMessage} from './i18n.mjs?v=i18n-1';
import {voicePosition, needsResync} from './timeline.mjs';
const $ = id => document.getElementById(id);
const video = $('demo'), play = $('play'), status = $('status');
const input = $('voice-file'), delayInput = $('voice-delay'), volume = $('voice-volume');
const note = $('voice-status'), remove = $('voice-remove');
let context, gain, buffer, source, anchor, request = 0;

function audioContext() {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('voice.unsupported');
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
    catch { setMessage(note,'voice.unlock'); }
  }
}
async function start() {
  await unlock();
  try { await video.play(); }
  catch { setMessage(status,'demo.startError'); }
}
play.addEventListener('click', () => {
  if (video.paused) { if (video.ended) video.currentTime = 0; start(); }
  else video.pause();
});
$('replay').addEventListener('click', () => { stopVoice(); video.currentTime = 0; start(); });
$('loop').addEventListener('change', event => { video.loop = event.target.checked; });
video.addEventListener('play', () => {
  setMessage(play,'demo.pauseButton');
  setMessage(status,buffer?'demo.playVoice':'demo.playSilent');
  unlock().then(() => syncVoice(true));
});
video.addEventListener('pause', () => {
  stopVoice();
  setMessage(play,video.ended?'demo.replayButton':'demo.resumeButton');
  setMessage(status,video.ended?'demo.ended':'demo.paused');
});
video.addEventListener('ended', () => {
  stopVoice(); setMessage(play,'demo.replayButton'); setMessage(status,'demo.ended');
});
video.addEventListener('seeking', stopVoice);
video.addEventListener('seeked', () => syncVoice(true));
video.addEventListener('ratechange', () => syncVoice(true));
video.addEventListener('waiting', stopVoice);
video.addEventListener('error', () => $('error').classList.remove('hidden'));
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });

function updateNote(name) {
  const available = Math.max(0, Math.min(5 - delay(), buffer.duration));
  setMessage(note,'voice.detail',()=>({name,duration:buffer.duration.toFixed(2),start:delay().toFixed(1),available:available.toFixed(2),tail:t(buffer.duration+delay()>5?'voice.trimmed':'voice.short')}));
}
let filename = '';
input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (!file) return;
  const token = ++request;
  video.pause(); stopVoice(); buffer = null; remove.disabled = true;
  setMessage(note,'voice.reading');
  try {
    if (!file.size || file.size > 25 * 1024 * 1024) throw new Error('voice.empty');
    const ctx = audioContext();
    // Resume from the file selection gesture; playback still requires pressing Play.
    ctx.resume().catch(() => {});
    const decoded = await ctx.decodeAudioData(await file.arrayBuffer());
    if (token !== request) return;
    if (!Number.isFinite(decoded.duration) || decoded.duration <= 0 || decoded.duration > 300) throw new Error('voice.length');
    buffer = decoded; filename = file.name; remove.disabled = false;
    video.currentTime = 0; setMessage(status,'voice.loaded');
    updateNote(filename);
  } catch (error) {
    if (token !== request) return;
    if(['voice.unsupported','voice.empty','voice.length'].includes(error.message))setMessage(note,error.message);
    else if(['EncodingError','NotSupportedError'].includes(error.name))setMessage(note,'voice.decode');
    else setMessage(note,'voice.failed',()=>({reason:error.message||t('voice.format')}));
    input.value = ''; setMessage(status,'voice.failedStatus');
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
  setMessage(note,'voice.removed'); setMessage(status,'demo.initial');
});
window.addEventListener('pagehide', event => { video.pause(); stopVoice(); if (!event.persisted) { ++request; if (context) context.close(); } });
