import test from 'node:test';
import assert from 'node:assert/strict';
import {clampScroll,easeScrollStep} from '../web/atmosphere.js';
test('scroll targets stay within page boundaries',()=>{assert.equal(clampScroll(-50,400),0);assert.equal(clampScroll(500,400),400);assert.equal(clampScroll(120,400),120);});
test('smooth scroll converges monotonically without overshooting',()=>{let current=0;for(let i=0;i<60;i++){const next=easeScrollStep(current,1000,1/60);assert.ok(next>=current&&next<=1000);current=next;}assert.ok(1000-current<.01);});
test('wheel reversal immediately moves toward the new target, and zero time is stable',()=>{assert.equal(easeScrollStep(500,1000,0),500);assert.ok(easeScrollStep(500,100,1/60)<500);assert.equal(easeScrollStep(100,100,1/60),100);});
test('rounded browser scroll positions cannot stall at any common refresh rate',()=>{
  for(const hz of [60,120,144,240])for(const target of [1.6,2,100,800,-2,-100]){
    let current=0,frames=0;
    while(Math.abs(target-current)>=1.5&&frames++<500)current=Math.round(easeScrollStep(current,target,1/hz));
    assert.ok(frames<500,`${hz}Hz with target ${target} must settle`);
  }
});
