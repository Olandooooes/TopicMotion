// The video timeline is the master clock. Delay is measured in video seconds.
export function voicePosition(videoTime, delay, audioDuration, videoDuration) {
  const position = videoTime - delay;
  return Number.isFinite(position) && position >= 0 && position < audioDuration && videoTime < videoDuration ? position : null;
}
export function needsResync(expected, actual) {
  return Math.abs(expected - actual) > 0.08;
}
