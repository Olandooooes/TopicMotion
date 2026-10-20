import {test} from 'node:test';
import assert from 'node:assert/strict';
import {voicePosition, needsResync} from '../docs/timeline.mjs';
test('delay keeps the introduction silent', () => {
  assert.equal(voicePosition(0.5, 1, 5, 5), null);
  assert.equal(voicePosition(1, 1, 5, 5), 0);
});
test('seek and replay map to the correct audio position', () => {
  assert.equal(voicePosition(3.2, 0.2, 6, 5), 3);
  assert.equal(voicePosition(0, 0, 6, 5), 0);
});
test('short audio and the video ending stop voice playback', () => {
  assert.equal(voicePosition(3, 0, 2, 5), null);
  assert.equal(voicePosition(5, 0, 8, 5), null);
});
test('only correct noticeable clock drift', () => {
  assert.equal(needsResync(2, 2.03), false);
  assert.equal(needsResync(2, 1.8), true);
});
