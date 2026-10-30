import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BACKGROUND_VIDEO_ID,backgroundVideoURL,silencePlayer} from '../web/background-video.js';
test('the requested video uses the official YouTube embed returned by its metadata, with looping and inline playback',()=>{
  const url=new URL(backgroundVideoURL('https://skulls.example/path?value=1'));
  assert.equal(BACKGROUND_VIDEO_ID,'uoe9E8KZH1I');assert.equal(url.origin,'https://www.youtube.com');assert.equal(url.pathname,`/embed/${BACKGROUND_VIDEO_ID}`);
  assert.equal(url.searchParams.get('playlist'),BACKGROUND_VIDEO_ID);assert.equal(url.searchParams.get('loop'),'1');assert.equal(url.searchParams.get('playsinline'),'1');assert.equal(url.searchParams.get('origin'),'https://skulls.example');assert.equal(url.searchParams.get('controls'),'0');assert.equal(url.searchParams.get('enablejsapi'),'1');
});
test('the initial iframe cannot autoplay audio before the player has been muted',()=>{
  const url=new URL(backgroundVideoURL('http://localhost:3000'));
  assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(url.searchParams.get('mute'),'1');
  const calls=[];silencePlayer({mute:()=>calls.push('mute'),setVolume:value=>calls.push(['volume',value])});assert.deepEqual(calls,['mute',['volume',0]]);
});
test('non-HTTP origins never become trusted player origins',()=>{
  for(const origin of ['file:///tmp/test.html','javascript:alert(1)','not a URL'])assert.equal(new URL(backgroundVideoURL(origin)).searchParams.has('origin'),false);
});
test('background iframe remains separate from the music controls and is activated only after entry',async()=>{
  const html=await readFile(new URL('../web/index.html',import.meta.url),'utf8');assert.ok(html.includes('id="site-video"'));assert.ok(html.includes('aria-hidden="true" data-video-state="waiting"'));
  const source=await readFile(new URL('../web/background-video.js',import.meta.url),'utf8');assert.ok(source.includes("document.addEventListener('skulls:entered'"));assert.ok(!source.includes('.unMute('));assert.ok(source.includes('prefers-reduced-motion')&&source.includes('visibilitychange'));assert.ok(source.includes('onError:')&&source.includes('onAutoplayBlocked:'));
});
