import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseArgs} from './import-voice.mjs';
test('requires an explicit provenance note',()=>assert.throws(()=>parseArgs(['--file','voice.wav'])));
test('rejects unsupported media',()=>assert.throws(()=>parseArgs(['--file','voice.exe','--license-note','owned'])));
test('accepts a file path with spaces',()=>assert.equal(parseArgs(['--file','my voice.wav','--license-note','本人录音']).file,'my voice.wav'));
