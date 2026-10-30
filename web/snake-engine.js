function seededRandom(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

export function generateMaze(level) {
  if (!Number.isInteger(level) || level < 1 || level > 7) throw new RangeError('O nível deve estar entre 1 e 7.');
  const size = 9 + level * 2;
  const cells = Array.from({length: size}, () => Array(size).fill(1));
  // Fixed seeds keep both board size and the shortest exit route progressive.
  const random = seededRandom([1, 1, 1, 1, 1, 1, 5][level - 1]);
  const start = {x: 1, y: 1};
  const exit = {x: size - 2, y: size - 2};
  const stack = [start];
  cells[1][1] = 0;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const neighbours = [[0, -2], [2, 0], [0, 2], [-2, 0]]
      .map(([dx, dy]) => ({x: current.x + dx, y: current.y + dy}))
      .filter(({x, y}) => x > 0 && x < size - 1 && y > 0 && y < size - 1 && cells[y][x] === 1);
    if (!neighbours.length) {stack.pop(); continue;}
    const next = neighbours[Math.floor(random() * neighbours.length)];
    cells[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
    cells[next.y][next.x] = 0;
    stack.push(next);
  }
  return {level, width: size, height: size, size, cells, start, exit};
}

export function findPath(maze) {
  const queue = [maze.start];
  const key = ({x, y}) => `${x},${y}`;
  const previous = new Map([[key(maze.start), null]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current.x === maze.exit.x && current.y === maze.exit.y) {
      const result = [];
      let cursor = current;
      while (cursor) {result.push(cursor); cursor = previous.get(key(cursor));}
      return result.reverse();
    }
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = {x: current.x + dx, y: current.y + dy};
      if (maze.cells[next.y]?.[next.x] !== 0 || previous.has(key(next))) continue;
      previous.set(key(next), current); queue.push(next);
    }
  }
  return [];
}

export function normalizeProgress(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.completed) || value.completed.length > 7) return 0;
  return value.completed.every((level, i) => Number.isInteger(level) && level === i + 1) ? value.completed.length : 0;
}

const validDirection=(dx,dy)=>Number.isInteger(dx)&&Number.isInteger(dy)&&Math.abs(dx)+Math.abs(dy)===1;
export function createRun(maze,{stepMs=310-(maze.level-1)*10}={}){
  if(!Number.isFinite(stepMs)||stepMs<=0)throw new RangeError('Velocidade inválida.');
  return {maze,level:maze.level,position:{...maze.start},trail:[{...maze.start}],direction:[1,0],pending:[1,0],segment:null,moves:0,phase:'ready',stepMs,bodyLength:3+Math.floor(maze.level/2)};
}
export function setRunDirection(run,dx,dy){
  if(!validDirection(dx,dy)||!['ready','running'].includes(run.phase))return run;
  return {...run,pending:[dx,dy],direction:run.phase==='ready'?[dx,dy]:run.direction,phase:'running'};
}
export function pauseRun(run){return run.phase==='running'?{...run,phase:'paused'}:run;}
export function resumeRun(run){return run.phase==='paused'?{...run,phase:'running'}:run;}

/** Fixed grid simulation with fractional segments; direction changes happen at cell centres. */
export function advanceRun(run,milliseconds){
  if(run.phase!=='running'||!Number.isFinite(milliseconds)||milliseconds<=0)return run;
  let state={...run},remaining=milliseconds;
  while(remaining>1e-7&&state.phase==='running'){
    if(!state.segment){
      const [dx,dy]=state.pending,to={x:state.position.x+dx,y:state.position.y+dy};
      state.direction=[dx,dy];
      state.segment={from:{...state.position},to,progress:0,blocked:state.maze.cells[to.y]?.[to.x]!==0};
    }else state.segment={...state.segment};
    const segment=state.segment;
    // The head radius is .30 cells: at .20 it physically touches the next wall.
    const end=segment.blocked?.20:1;
    const used=Math.min(remaining,Math.max(0,(end-segment.progress)*state.stepMs));
    segment.progress+=used/state.stepMs;remaining-=used;
    if(segment.progress<end-1e-7)break;
    segment.progress=end;
    if(segment.blocked){state.phase='dead';break;}
    state.position={...segment.to};state.moves++;
    state.trail=[{...state.position},...state.trail].slice(0,state.bodyLength+2);
    state.segment=null;
    if(state.position.x===state.maze.exit.x&&state.position.y===state.maze.exit.y)state.phase='won';
  }
  return state;
}

export function snakePolyline(run){
  const progress=run.segment?.progress||0;
  const head=run.segment?{x:run.segment.from.x+(run.segment.to.x-run.segment.from.x)*progress,y:run.segment.from.y+(run.segment.to.y-run.segment.from.y)*progress}:{...run.position};
  const points=[head];let length=Math.min(run.bodyLength,run.moves+progress),cursor=head;
  for(const point of run.trail){
    const distance=Math.hypot(point.x-cursor.x,point.y-cursor.y);
    if(distance<1e-8)continue;
    if(length<=distance){if(length>1e-8)points.push({x:cursor.x+(point.x-cursor.x)*length/distance,y:cursor.y+(point.y-cursor.y)*length/distance});break;}
    points.push({...point});length-=distance;cursor=point;
  }
  return points;
}

