import test from 'node:test';
import assert from 'node:assert/strict';
import {TRACK,buildScore,normalizeVolume} from '../web/audio.js';

test('original track has a deterministic eight-bar score and exact beat timing',()=>{
  const first=buildScore(),second=buildScore();
  assert.deepEqual(first,second);assert.equal(first.duration,8*4*60/76);
  assert.equal(TRACK.title,'Nas sombras');
  assert.ok(first.events.length>150&&first.events.length<300);
  assert.ok(first.events.every(event=>event.time>=0&&event.time<first.duration));
  assert.ok(first.events.every((event,index)=>index===0||event.time>=first.events[index-1].time));
});
test('arrangement includes all rock layers and drums across every bar',()=>{
  const {events}=buildScore();
  assert.deepEqual([...new Set(events.map(event=>event.instrument))].sort(),['bass','bell','chord','guitar','hat','kick','pad','snare']);
  for(let bar=0;bar<8;bar++){
    const barEvents=events.filter(event=>event.time>=bar*4*60/76&&event.time<(bar+1)*4*60/76);
    assert.ok(barEvents.some(event=>event.instrument==='chord'));assert.ok(barEvents.some(event=>event.instrument==='bass'));assert.ok(barEvents.some(event=>event.instrument==='snare'));
  }
  assert.equal(events.filter(event=>event.instrument==='chord').length,8);
  assert.ok(new Set(events.filter(event=>event.instrument==='chord').map(event=>event.note)).size>=4);
});
test('volume safely defaults, clamps and preserves explicit mute',()=>{
  assert.equal(normalizeVolume(null),.25);assert.equal(normalizeVolume(undefined),.25);assert.equal(normalizeVolume('no'),.25);assert.equal(normalizeVolume(''),.25);
  assert.equal(normalizeVolume(0),0);assert.equal(normalizeVolume('0.4'),.4);assert.equal(normalizeVolume(-5),0);assert.equal(normalizeVolume(5),1);assert.equal(normalizeVolume(Infinity),.25);
});
