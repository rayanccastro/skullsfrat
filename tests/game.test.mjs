import test from 'node:test';
import assert from 'node:assert/strict';
import {SINS} from '../web/game.js';
import {generateMaze,findPath,normalizeProgress,createRun,setRunDirection,advanceRun,pauseRun,resumeRun,snakePolyline} from '../web/snake-engine.js';
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-7,`${actual} differs from ${expected}`);
const corridor={level:1,size:11,width:11,height:11,start:{x:1,y:1},exit:{x:9,y:1},cells:Array.from({length:11},(_,y)=>Array.from({length:11},(_,x)=>y===1&&x>0&&x<10?0:1))};
test('seven deterministic levels and seven unique sin clues retain increasing difficulty',()=>{
  assert.equal(SINS.length,7);assert.equal(new Set(SINS.map(s=>s.name)).size,7);
  let previousSize=0,previousSteps=0;
  for(let level=1;level<=7;level++){const maze=generateMaze(level);assert.deepEqual(maze,generateMaze(level));assert.ok(maze.size>previousSize);const length=findPath(maze).length;assert.ok(length>previousSteps);previousSize=maze.size;previousSteps=length;}
});
for(let level=1;level<=7;level++)test(`level ${level}: continuous simulation follows its entire route and wins only at the exit`,()=>{
  const maze=generateMaze(level),route=findPath(maze);let run=createRun(maze);
  for(let i=1;i<route.length;i++){
    const [previous,next]=[route[i-1],route[i]];
    assert.equal(Math.abs(next.x-previous.x)+Math.abs(next.y-previous.y),1);
    run=setRunDirection(run,next.x-previous.x,next.y-previous.y);run=advanceRun(run,run.stepMs);
    assert.deepEqual(run.position,next);assert.equal(run.phase,i===route.length-1?'won':'running');
  }
  assert.equal(run.moves,route.length-1);assert.deepEqual(run.position,maze.exit);
  assert.equal(advanceRun(run,10000),run);assert.equal(setRunDirection(run,-1,0),run);
});
test('one direction keeps moving across cells without repeated key presses',()=>{
  const selected=setRunDirection(createRun(corridor,{stepMs:300}),1,0);
  const run=advanceRun(selected,750);assert.equal(run.moves,2);assert.equal(run.phase,'running');
  const head=snakePolyline(run)[0];close(head.x,3.5);close(head.y,1);
  assert.equal(selected.moves,0,'updating must not mutate earlier frames');
});
test('visual position is equivalent at 30, 60, 120 and 144 Hz',()=>{
  const expected=advanceRun(setRunDirection(createRun(corridor,{stepMs:300}),1,0),1100);
  for(const hz of [30,60,120,144]){
    let run=setRunDirection(createRun(corridor,{stepMs:300}),1,0),remaining=1100;
    while(remaining>1e-7){const elapsed=Math.min(1000/hz,remaining);run=advanceRun(run,elapsed);remaining-=elapsed;}
    assert.equal(run.moves,expected.moves);close(snakePolyline(run)[0].x,snakePolyline(expected)[0].x);
  }
});
test('turn input is buffered to the next centre and never cuts diagonally through corners',()=>{
  const maze={level:1,size:5,start:{x:1,y:1},exit:{x:3,y:2},cells:[[1,1,1,1,1],[1,0,1,1,1],[1,0,0,0,1],[1,1,1,1,1],[1,1,1,1,1]]};
  let run=setRunDirection(createRun(maze,{stepMs:300}),0,1);run=advanceRun(run,150);run=setRunDirection(run,1,0);
  close(snakePolyline(run)[0].x,1);close(snakePolyline(run)[0].y,1.5);
  run=advanceRun(run,225);close(snakePolyline(run)[0].x,1.25);close(snakePolyline(run)[0].y,2);
  const points=snakePolyline(run);for(let i=1;i<points.length;i++)assert.ok(Math.abs(points[i].x-points[i-1].x)<1e-7||Math.abs(points[i].y-points[i-1].y)<1e-7);
  run=advanceRun(run,525);assert.equal(run.phase,'won');
});
test('touching a wall loses the current phase and freezes the run until a fresh retry',()=>{
  const maze=generateMaze(4),initial=createRun(maze);let run=setRunDirection(initial,-1,0);run=advanceRun(run,1000);
  assert.equal(run.phase,'dead');assert.equal(run.level,4);assert.equal(run.moves,0);assert.deepEqual(run.position,maze.start);
  close(snakePolyline(run)[0].x,.8);assert.equal(advanceRun(run,1000),run);assert.equal(setRunDirection(run,0,1),run);
  const retried=createRun(maze);assert.equal(retried.level,4);assert.equal(retried.phase,'ready');assert.equal(retried.moves,0);assert.deepEqual(retried.position,maze.start);
});
test('remaining in the same direction eventually hits a wall instead of stopping safely',()=>{
  let run=setRunDirection(createRun(generateMaze(1)),0,1);run=advanceRun(run,20000);
  assert.equal(run.phase,'dead');assert.ok(run.moves>=1);assert.equal(run.level,1);
});
test('pause preserves fractional movement and resume continues without catch-up',()=>{
  let run=advanceRun(setRunDirection(createRun(corridor,{stepMs:300}),1,0),120);const before=snakePolyline(run);
  run=pauseRun(run);assert.equal(run.phase,'paused');assert.equal(advanceRun(run,10000),run);assert.deepEqual(snakePolyline(run),before);
  run=advanceRun(resumeRun(run),180);assert.equal(run.moves,1);assert.deepEqual(run.position,{x:2,y:1});
});
test('snake length stays bounded and smooth after the full body has formed',()=>{
  const run=advanceRun(setRunDirection(createRun(corridor,{stepMs:300}),1,0),1350),points=snakePolyline(run);
  const length=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);close(length,run.bodyLength);
  assert.ok(run.trail.length<=run.bodyLength+2);
});
test('invalid directions do not start a run and invalid levels are rejected',()=>{
  const run=createRun(generateMaze(1));for(const vector of [[0,0],[1,1],[2,0],[NaN,0]])assert.equal(setRunDirection(run,...vector),run);
  for(const level of [0,8,-1,1.2,NaN,'1',null,undefined])assert.throws(()=>generateMaze(level),RangeError);
});
test('existing sequential clue progress remains compatible and malformed saves are rejected',()=>{
  for(let n=0;n<=7;n++)assert.equal(normalizeProgress({version:1,completed:Array.from({length:n},(_,i)=>i+1)}),n);
  for(const save of [null,{},true,{version:2,completed:[1]},{version:1,completed:[7]},{version:1,completed:[1,1]},{version:1,completed:[1,3]},{version:1,completed:Array(8).fill(1)}])assert.equal(normalizeProgress(save),0);
});
