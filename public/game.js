import {generateMaze,findPath,normalizeProgress,createRun,setRunDirection,advanceRun,pauseRun,resumeRun,snakePolyline} from './snake-engine.js?v=7980f4328abe';
export {generateMaze,findPath,normalizeProgress} from './snake-engine.js?v=7980f4328abe';
export const SINS=Object.freeze([
  {name:'Soberba',title:'O espelho',clue:'No alto do próprio pedestal, até a sombra parece pequena. Quem só contempla a si mesmo deixa de enxergar a saída.'},
  {name:'Avareza',title:'As mãos fechadas',clue:'Guarda todas as chaves, mas não abre nenhuma porta. O medo de perder transforma abrigo em prisão.'},
  {name:'Luxúria',title:'O desejo',clue:'Uma chama chama outra. Quando o desejo toma o leme, nenhum horizonte parece suficiente.'},
  {name:'Inveja',title:'O outro lado',clue:'Seus olhos seguem a luz alheia, enquanto o próprio caminho desaparece no escuro.'},
  {name:'Gula',title:'O vazio',clue:'Tudo é pouco para uma fome que não nasce no corpo. Quanto mais recebe, mais o vazio pede.'},
  {name:'Ira',title:'As cinzas',clue:'Quer romper cada muro com fogo. Quando a fumaça baixa, descobre que queimou também o caminho de volta.'},
  {name:'Preguiça',title:'A espera',clue:'A porta está entreaberta, mas o primeiro passo sempre fica para amanhã. Até a noite acaba para quem decide atravessá-la.'}
]);
const ROMAN=['I','II','III','IV','V','VI','VII'];
const STORAGE_KEY='skulls-labyrinth-v1';
const DIRECTIONS={ArrowUp:[0,-1],w:[0,-1],ArrowRight:[1,0],d:[1,0],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0]};
export function mountGame(root){
  if(!root)return()=>{};
  let completed=0;try{completed=normalizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY)));}catch{}
  let run=createRun(generateMaze(Math.min(completed+1,7))),entered=completed===7,frame=0,lastFrame=0,touchStart;
  if(completed===7)run={...run,phase:'won'};
  root.classList.add('sk-game');
  root.innerHTML=`<div class="sk-game__top"><div class="sk-game__stage"><span class="sk-game__stage-label">PORTÃO <b data-stage>I</b> / VII</span><span data-counter>0 passos</span></div><div class="sk-game__actions"><button type="button" data-pause aria-pressed="false" disabled>Pausar</button><button type="button" data-retry>Recomeçar nível</button><button type="button" data-reset>Apagar progresso</button></div></div><div class="sk-game__layout"><div class="sk-game__play"><div class="sk-game__board"><canvas class="sk-game__canvas" width="560" height="560" tabindex="0" role="application" aria-label="Labirinto da serpente" aria-describedby="sk-game-help"></canvas><div class="sk-game__veil" data-veil><span class="sk-game__veil-number">VII</span><h3>Uma direção.<br>Nenhum passo em falso.</h3><p>A serpente segue sozinha. Mude a direção nas curvas e evite as paredes.</p><button class="sk-game__start" type="button" data-start>Entrar no labirinto <span aria-hidden="true">↗</span></button></div></div><div class="sk-game__legend" id="sk-game-help"><span><i class="sk-game__legend-snake"></i> Você</span><span><i class="sk-game__legend-exit"></i> Saída</span><span>Setas / WASD / toque</span></div><div class="sk-game__dpad" aria-label="Controles da serpente"><button type="button" data-direction="up" aria-label="Mover para cima">↑</button><button type="button" data-direction="left" aria-label="Mover para a esquerda">←</button><button type="button" data-direction="down" aria-label="Mover para baixo">↓</button><button type="button" data-direction="right" aria-label="Mover para a direita">→</button></div><p class="sk-game__instructions">Um toque escolhe a direção. A cobra continua andando. Bateu na parede? Recomece esta fase. Espaço pausa o jogo.</p><p class="sk-game__status" data-status role="status" aria-live="polite">O caminho espera por você.</p></div><aside class="sk-game__archive" aria-label="Pistas dos sete pecados"><div class="sk-game__archive-head"><span>O QUE A SOMBRA REVELA</span><strong><b data-total>0</b><small> / 7 pistas</small></strong></div><div class="sk-game__revelation" data-revelation aria-live="polite"></div><ol class="sk-game__seals" data-seals></ol><p class="sk-game__save-note">Suas pistas ficam salvas neste navegador.<br>Perder uma fase não apaga as anteriores.<br>Jogar é opcional para solicitar recrutamento.</p></aside></div>`;
  const get=selector=>root.querySelector(selector),canvas=get('canvas'),ctx=canvas.getContext('2d');
  if(!ctx){root.innerHTML='<p>Seu navegador não oferece suporte ao labirinto.</p>';return()=>{};}
  const veil=get('[data-veil]'),status=get('[data-status]'),start=get('[data-start]'),pause=get('[data-pause]');
  const background=document.createElement('canvas'),backgroundContext=background.getContext('2d');
  function rebuildBoard(){
    background.width=canvas.width;background.height=canvas.height;
    const size=canvas.width,cell=size/run.maze.size,bg=backgroundContext;
    bg.fillStyle='#090909';bg.fillRect(0,0,size,size);
    run.maze.cells.forEach((row,y)=>row.forEach((wall,x)=>{
      bg.fillStyle=wall?'#242321':'#0c0c0c';bg.fillRect(x*cell+.7,y*cell+.7,cell-1.4,cell-1.4);
      if(wall){bg.fillStyle='#34312d';bg.fillRect(x*cell+.7,y*cell+.7,cell-1.4,Math.max(1,cell*.045));}
    }));
    bg.save();bg.shadowColor='#eee6d5';bg.shadowBlur=cell*.6;bg.strokeStyle='#eee6d5';bg.lineWidth=Math.max(2,cell*.07);bg.strokeRect((run.maze.exit.x+.23)*cell,(run.maze.exit.y+.23)*cell,cell*.54,cell*.54);bg.restore();
  }
  function draw(){
    const cell=canvas.width/run.maze.size,points=snakePolyline(run),head=points[0];
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(background,0,0);
    ctx.strokeStyle=run.phase==='dead'?'#a82626':'#d62626';ctx.lineWidth=cell*.56;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
    points.slice().reverse().forEach((point,index)=>{const x=(point.x+.5)*cell,y=(point.y+.5)*cell;if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
    ctx.fillStyle=run.phase==='dead'?'#a82626':'#e02c2c';ctx.beginPath();ctx.arc((head.x+.5)*cell,(head.y+.5)*cell,cell*.30,0,Math.PI*2);ctx.fill();
    const [dx,dy]=run.direction;
    [-1,1].forEach(side=>{ctx.fillStyle='#eee6d5';ctx.beginPath();ctx.arc((head.x+.5+dx*.12+dy*side*.14)*cell,(head.y+.5+dy*.12-dx*side*.14)*cell,cell*.055,0,Math.PI*2);ctx.fill();});
  }
  function describe(){
    root.dataset.gameState=entered?run.phase:'welcome';
    get('[data-stage]').textContent=ROMAN[run.level-1];get('[data-counter]').textContent=`${run.moves} ${run.moves===1?'passo':'passos'}`;
    canvas.setAttribute('aria-label',`Labirinto ${run.level} de 7. Serpente na coluna ${run.position.x}, linha ${run.position.y}. Saída na coluna ${run.maze.exit.x}, linha ${run.maze.exit.y}. ${run.phase==='running'?'Movimento contínuo.':''}`);
    pause.disabled=!['running','paused'].includes(run.phase);pause.textContent=run.phase==='paused'?'Continuar':'Pausar';pause.setAttribute('aria-pressed',String(run.phase==='paused'));
  }
  function collection(){
    get('[data-total]').textContent=String(completed);
    get('[data-seals]').innerHTML=SINS.map((sin,index)=>index<completed?`<li class="is-open"><details ${index===completed-1?'open':''}><summary><span>${ROMAN[index]}</span><b>${sin.name}</b><i aria-hidden="true">↗</i></summary><p>${sin.clue}</p></details></li>`:`<li><span>${ROMAN[index]}</span><b>Pista selada</b><i aria-hidden="true">◇</i></li>`).join('');
    get('[data-revelation]').innerHTML=run.phase==='won'?`<span>PISTA ${ROMAN[run.level-1]} REVELADA</span><h3>${SINS[run.level-1].title}</h3><p>${SINS[run.level-1].clue}</p>`:'<span>ATRAVESSE PARA DESCOBRIR</span><h3>Nem todo demônio<br>vive nas sombras.</h3><p>Sete caminhos. Sete pistas sobre aquilo que também vive em nós.</p>';
  }
  function showVeil(kind){
    veil.hidden=false;veil.classList.toggle('is-solved',kind==='won');veil.classList.toggle('is-dead',kind==='dead');
    veil.querySelector('.sk-game__veil-number').textContent=ROMAN[run.level-1];
    const title=veil.querySelector('h3'),copy=veil.querySelector('p');
    if(kind==='dead'){title.textContent='A parede venceu.';copy.textContent=`Você tocou a parede. Recomece o portão ${ROMAN[run.level-1]}. Suas pistas anteriores continuam guardadas.`;start.textContent='Tentar novamente';}
    else if(kind==='paused'){title.textContent='O caminho pode esperar.';copy.textContent='O jogo está pausado. Continue quando estiver pronto para guiar a serpente.';start.textContent='Continuar fase';}
    else if(kind==='won'){title.textContent=run.level===7?'Você atravessou os sete portões.':'Uma saída. Uma revelação.';copy.textContent=`${SINS[run.level-1].name}: ${SINS[run.level-1].title.toLowerCase()}. A pista está no seu arquivo.`;start.textContent=run.level<7?'Abrir próximo portão':'Percorrer novamente';}
    start.focus({preventScroll:true});
  }
  function stop(){cancelAnimationFrame(frame);frame=0;lastFrame=0;}
  function finishRun(){
    stop();
    if(run.phase==='won'){
      completed=Math.max(completed,run.level);
      try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,completed:Array.from({length:completed},(_,i)=>i+1)}));}catch{}
      status.textContent=`Portão ${ROMAN[run.level-1]} atravessado. Pista revelada: ${SINS[run.level-1].name}.`;collection();
    }else status.textContent=`Você perdeu o portão ${ROMAN[run.level-1]} ao tocar na parede. Tente esta fase novamente.`;
    describe();showVeil(run.phase);draw();
  }
  function tick(now){
    frame=0;if(run.phase!=='running')return;
    const previousMoves=run.moves;run=advanceRun(run,Math.min(90,Math.max(0,now-lastFrame)));lastFrame=now;draw();
    if(run.moves!==previousMoves)describe();
    if(['dead','won'].includes(run.phase)){finishRun();return;}
    frame=requestAnimationFrame(tick);
  }
  function schedule(){if(frame||run.phase!=='running')return;lastFrame=performance.now();frame=requestAnimationFrame(tick);}
  function resetLevel(level){
    stop();run=createRun(generateMaze(level));entered=true;veil.hidden=true;veil.classList.remove('is-solved','is-dead');
    status.textContent=`Portão ${ROMAN[level-1]}. Escolha uma direção para começar. A serpente seguirá sozinha.`;
    collection();describe();rebuildBoard();draw();canvas.focus({preventScroll:true});
  }
  function choose(dx,dy){
    if(!entered||!['ready','running'].includes(run.phase))return;
    run=setRunDirection(run,dx,dy);veil.hidden=true;describe();canvas.focus({preventScroll:true});
    status.textContent='A serpente está em movimento. Mude a direção antes da parede.';schedule();
  }
  function pauseGame(){if(run.phase!=='running')return;stop();run=pauseRun(run);status.textContent='Jogo pausado. Sua posição nesta fase foi preservada.';describe();showVeil('paused');}
  function continueGame(){if(run.phase!=='paused')return;run=resumeRun(run);veil.hidden=true;describe();canvas.focus({preventScroll:true});status.textContent='Você voltou ao caminho. Mude a direção antes da parede.';schedule();}
  function onStart(){
    if(run.phase==='paused')return continueGame();
    if(run.phase==='won')return resetLevel(run.level<7?run.level+1:1);
    resetLevel(run.level);
  }
  function onClick(event){
    const button=event.target.closest('button');if(!button||!root.contains(button))return;
    if(button.hasAttribute('data-start'))return onStart();
    if(button.hasAttribute('data-pause'))return run.phase==='paused'?continueGame():pauseGame();
    if(button.hasAttribute('data-retry'))return resetLevel(run.level);
    if(button.hasAttribute('data-reset')){if(!window.confirm('Apagar as pistas e recomeçar a jornada neste navegador?'))return;completed=0;try{localStorage.removeItem(STORAGE_KEY);}catch{}return resetLevel(1);}
    const vector={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]}[button.dataset.direction];if(vector)choose(...vector);
  }
  function onKey(event){
    if(event.target!==canvas||event.altKey||event.ctrlKey||event.metaKey)return;
    if(event.key===' '){event.preventDefault();if(!event.repeat)run.phase==='paused'?continueGame():pauseGame();return;}
    const vector=DIRECTIONS[event.key]||DIRECTIONS[event.key.toLowerCase()];if(!vector)return;
    event.preventDefault();if(!event.repeat)choose(...vector);
  }
  function touchBegin(event){if(!entered)return;const touch=event.changedTouches[0];touchStart={x:touch.clientX,y:touch.clientY};}
  function touchEnd(event){if(!touchStart)return;const touch=event.changedTouches[0],dx=touch.clientX-touchStart.x,dy=touch.clientY-touchStart.y;touchStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<15)return;if(Math.abs(dx)>Math.abs(dy))choose(Math.sign(dx),0);else choose(0,Math.sign(dy));}
  function visibility(){if(document.hidden)pauseGame();}
  function outside(event){if(!root.contains(event.target))pauseGame();}
  function resize(){const pixels=Math.min(window.devicePixelRatio||1,2),size=Math.max(240,Math.round(canvas.getBoundingClientRect().width*pixels));canvas.width=canvas.height=size;rebuildBoard();draw();}
  root.addEventListener('click',onClick);canvas.addEventListener('keydown',onKey);canvas.addEventListener('touchstart',touchBegin,{passive:true});canvas.addEventListener('touchend',touchEnd,{passive:true});
  window.addEventListener('blur',pauseGame);document.addEventListener('visibilitychange',visibility);document.addEventListener('pointerdown',outside,{passive:true});window.addEventListener('resize',resize);
  const sizes=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;sizes?.observe(canvas);
  const visible=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(entries=>{if(entries.some(entry=>!entry.isIntersecting))pauseGame();},{threshold:0}):null;visible?.observe(canvas);
  collection();describe();resize();if(run.phase==='won')showVeil('won');
  return()=>{stop();sizes?.disconnect();visible?.disconnect();root.removeEventListener('click',onClick);canvas.removeEventListener('keydown',onKey);canvas.removeEventListener('touchstart',touchBegin);canvas.removeEventListener('touchend',touchEnd);window.removeEventListener('blur',pauseGame);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize);};
}
