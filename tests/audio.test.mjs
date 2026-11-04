import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeVolume} from '../web/audio.js';

test('volume safely defaults, clamps and preserves explicit mute',()=>{
  assert.equal(normalizeVolume(null),.25);assert.equal(normalizeVolume(undefined),.25);assert.equal(normalizeVolume('no'),.25);assert.equal(normalizeVolume(''),.25);
  assert.equal(normalizeVolume(0),0);assert.equal(normalizeVolume('0.4'),.4);assert.equal(normalizeVolume(-5),0);assert.equal(normalizeVolume(5),1);assert.equal(normalizeVolume(Infinity),.25);
});
