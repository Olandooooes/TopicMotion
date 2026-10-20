export type Caption = {text: string; startSeconds: number; endSeconds: number};
export type DemoProps = {audioSrc: string | null; audioOffsetSeconds: number; audioVolume: number; captions: Caption[]};
export function validateProps(props: DemoProps) {
  if (props.audioSrc !== null && (typeof props.audioSrc !== 'string' || !/^audio\/[\w.-]+\.(wav|mp3|m4a|ogg)$/i.test(props.audioSrc))) throw new Error('audioSrc 必须为 null 或 public/audio 下的音频相对路径。');
  if (!Number.isFinite(props.audioOffsetSeconds) || props.audioOffsetSeconds < 0 || props.audioOffsetSeconds >= 5) throw new Error('音频起点必须在 0–5 秒之间。');
  if (!Number.isFinite(props.audioVolume) || props.audioVolume < 0 || props.audioVolume > 1) throw new Error('音量必须在 0–1 之间。');
  if (!Array.isArray(props.captions)) throw new Error('captions 必须是数组。');
  let previousEnd = 0;
  for (const c of props.captions) {
    if (!c || typeof c.text !== 'string' || !c.text.trim() || !Number.isFinite(c.startSeconds) || !Number.isFinite(c.endSeconds) || c.startSeconds < previousEnd || c.endSeconds <= c.startSeconds || c.endSeconds > 5) throw new Error('字幕必须按时间排序、不重叠，且在 0–5 秒内。');
    previousEnd = c.endSeconds;
  }
}
