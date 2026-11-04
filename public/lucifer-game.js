/* SKULLS FRATERNITY · Lucifer — Caça às Fraternidades
   Jogo arcade fictício 32-bit. As molotovs são efeitos de fantasia, sem mecânicas reais. */

const CAR_NAMES = [
 'Sharks Hunter','Cupids','Fraternidade Azul','Sirens','Enxamistas',
 'Neon Syndicate','Black Wolves','Hotties','Born to Die','Stardolls',
 'Obscury','Sparks','Envy','Blacklist','Fawn',
 'Shroom','Pearls','Obsession','The Roses','Underground'
];
const BASE_TIME = 120, MAX_BONUS = 6, SCORE_PER_CAR = 10, MISS_PENALTY = 35;
const WIDTH = 960, HEIGHT = 540, STORAGE_KEY = 'skulls-lucifer-ranking-v1';
const START_URL = '/api/lucifer-leaderboard';
const $ = (root, selector) => root.querySelector(selector);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const rand=(a,b)=>a+Math.random()*(b-a);

function localTop(){
 try{return (JSON.parse(localStorage.getItem(STORAGE_KEY))||[]).filter(x=>x&&typeof x.name==='string'&&Number.isFinite(x.score)).sort((a,b)=>b.score-a.score).slice(0,10);}catch{return [];}
}
function saveLocal(name,score){
 try{
  const arr=localTop();const old=arr.find(x=>x.name.toLowerCase()===name.toLowerCase());
  if(old)old.score=Math.max(old.score,score);else arr.push({name,score});
  localStorage.setItem(STORAGE_KEY,JSON.stringify(arr.sort((a,b)=>b.score-a.score).slice(0,10)));
 }catch{}
}
function timeText(seconds){const s=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}

export function mountLuciferGame(after=document.querySelector('#labirinto')){
 if(!after||document.getElementById('lucifer-game'))return()=>{};
 if(!document.querySelector('link[data-lucifer-css]')){
  const css=document.createElement('link');css.rel='stylesheet';css.href='/lucifer-game.css?v=lucifer-cars-v2-20261104';css.dataset.luciferCss='';document.head.append(css);
 }
 const section=document.createElement('section');section.id='lucifer-game';section.className='lucifer-section section-space';
 section.innerHTML=`<div class="shell">
  <div class="lucifer-head"><div><span class="section-kicker">SKULLS ARCADE · 32 BITS</span><h2>LUCIFER <em>— Caça às Fraternidades</em></h2><p>O bode dos Skulls tem dois minutos para acumular pontos. Escolha seu nome, mire nos carros e sobreviva ao relógio.</p></div><span class="lucifer-sigil" aria-hidden="true">⛧</span></div>
  <div class="lucifer-cabinet">
    <header class="lucifer-hud"><div><span>JOGADOR</span><strong data-l-player>SEM REGISTRO</strong></div><div><span>PONTOS</span><strong data-l-score>0000</strong></div><div><span>TEMPO</span><strong data-l-time>02:00</strong></div><div><span>COMBO</span><strong data-l-combo>×0</strong></div></header>
    <div class="lucifer-stage"><canvas width="960" height="540" tabindex="0" role="application" aria-label="Lucifer — jogo arcade. Use as setas para mover a mira e a barra de espaço para lançar." data-l-canvas></canvas>
      <div class="lucifer-notice" data-l-notice aria-live="polite"></div>
      <div class="lucifer-overlay" data-l-overlay>
       <div class="lucifer-intro-art"><img src="/assets/lucifer-sprite.png" alt="Lucifer: pequeno bode escuro de olhos vermelhos e pentagrama na testa"></div>
       <div class="lucifer-overlay-content"><span class="lucifer-eyebrow">◆ SISTEMA SKULLS ◆</span><h3 data-l-title>O bode está pronto.</h3><p data-l-message>Registre seu nome para entrar no placar. Use as setas para mirar e ESPAÇO para lançar. Cada carro vale 10 pontos; acertos em sequência dão até 6 segundos extras por alvo. Cada Molotov que errar retira 35 segundos do seu tempo.</p>
        <form data-l-form autocomplete="off"><label for="lucifer-player-name">NOME DO JOGADOR</label><input id="lucifer-player-name" name="player" maxlength="24" minlength="2" placeholder="Digite seu nome" required><button type="submit">COMEÇAR PARTIDA <span aria-hidden="true">↗</span></button></form>
        <div class="lucifer-result" data-l-result hidden><b data-l-final>0</b><span data-l-final-text>pontos</span><button type="button" data-l-again>JOGAR NOVAMENTE ↗</button></div>
       </div>
      </div>
    </div>
    <div class="lucifer-controls"><p><b>↑ ↓ ← →</b> Mover a mira <b>ESPAÇO</b> Lançar a Molotov</p><div class="lucifer-dpad" aria-label="Controles para celular"><button type="button" data-l-dir="up" aria-label="Mirar para cima">↑</button><button type="button" data-l-dir="left" aria-label="Mirar para esquerda">←</button><button type="button" data-l-dir="down" aria-label="Mirar para baixo">↓</button><button type="button" data-l-dir="right" aria-label="Mirar para direita">→</button><button type="button" class="lucifer-throw" data-l-throw aria-label="Lançar a Molotov">LANÇAR ⛧</button></div></div>
    <div class="lucifer-footer"><p>20 carros das fraternidades • 10 pontos por acerto • bônus até +6s • erro: −35s</p><button type="button" data-l-reset>REINICIAR</button></div>
  </div>
  <div class="lucifer-ranking"><div><span class="section-kicker">OS NOMES QUE SOBREVIVERAM</span><h3>Ranking dos Skulls</h3><p data-l-ranking-status>Carregando o placar…</p></div><div class="lucifer-ranking-table" data-l-ranking><p>Buscando jogadores…</p></div><button type="button" data-l-refresh>ATUALIZAR RANKING</button></div>
 </div>`;
 after.insertAdjacentElement('afterend',section);
 const nav=document.querySelector('.site-header nav');
 if(nav&&!nav.querySelector('a[href="#lucifer-game"]')){const a=document.createElement('a');a.href='#lucifer-game';a.textContent='Lucifer';const last=nav.querySelector('.nav-join');last?nav.insertBefore(a,last):nav.append(a);}
 const stage = $(section,'.lucifer-stage');
 const rankButton = document.createElement('button');
 rankButton.type='button';
 rankButton.className='lucifer-ranking-floating';
 rankButton.setAttribute('aria-haspopup','dialog');
 rankButton.setAttribute('aria-controls','lucifer-ranking-dialog');
 rankButton.innerHTML='<span aria-hidden="true">♛</span><span>VER RANKING</span>';
 const rankDialog=document.createElement('dialog');
 rankDialog.id='lucifer-ranking-dialog';
 rankDialog.className='lucifer-ranking-dialog';
 rankDialog.setAttribute('aria-labelledby','lucifer-ranking-dialog-title');
 rankDialog.innerHTML=`<div class="lucifer-ranking-dialog-inner">
   <div class="lucifer-ranking-dialog-head">
     <div><span class="lucifer-ranking-dialog-kicker">SKULLS ARCADE · HALL DA FAMA</span>
       <h2 id="lucifer-ranking-dialog-title">Ranking do Lucifer</h2>
     </div>
     <button type="button" class="lucifer-ranking-dialog-close" data-l-popup-close aria-label="Fechar ranking">✕</button>
   </div>
   <p class="lucifer-ranking-dialog-status" data-l-popup-ranking-status aria-live="polite">Carregando pontuações…</p>
   <div class="lucifer-ranking-table lucifer-ranking-dialog-list" data-l-popup-ranking></div>
   <button type="button" class="lucifer-ranking-dialog-refresh" data-l-popup-refresh>↻ ATUALIZAR PLACAR</button>
 </div>`;
 document.body.append(rankButton,rankDialog);
 function openRanking(){
   if(!rankDialog.open)rankDialog.showModal();
   void loadRanking();
 }
 rankButton.addEventListener('click',openRanking);
 rankDialog.addEventListener('click',event=>{
   if(event.target===rankDialog || event.target.closest('[data-l-popup-close]')){rankDialog.close();return;}
   if(event.target.closest('[data-l-popup-refresh]'))void loadRanking();
 });
 const canvas=$(section,'[data-l-canvas]'),ctx=canvas.getContext('2d');
 if(!ctx)return()=>{rankButton.remove();rankDialog.remove();section.remove();};
 const overlay=$(section,'[data-l-overlay]'),form=$(section,'[data-l-form]'),input=$(section,'#lucifer-player-name');
 const images={};
 for(const [key,url] of Object.entries({cars:'/assets/lucifer-carros-v2.webp',goat:'/assets/lucifer-sprite.png'})){
  const image=new Image();image.src=url;images[key]=image;
 }
 const keys={left:false,right:false,up:false,down:false};
 let phase='welcome',player='',runToken=null,ranked=false,score=0,hits=0,shots=0,misses=0,combo=0,extraTime=0;
 let remaining=BASE_TIME,aim={x:WIDTH/2,y:205},cars=[],shotsInFlight=[],particles=[],effects=[], last=0,raf=0,elapsed=0,spawnClock=0,shotCooldown=0;
 let messageEnd=0,touchStart=null,remoteRanking=false,carBag=[],easterTimer=0;
 function showObscuryEgg(x,y){
  stage.querySelector('.lucifer-obscury-bubble')?.remove();
  clearTimeout(easterTimer);
  const bubble=document.createElement('div');
  bubble.className='lucifer-obscury-bubble';
  bubble.setAttribute('role','status');
  bubble.textContent='Maldito Protagonista';
  bubble.style.left=(clamp(x,145,WIDTH-145)/WIDTH*100).toFixed(2)+'%';
  bubble.style.top=(clamp(y-62,46,HEIGHT-100)/HEIGHT*100).toFixed(2)+'%';
  stage.append(bubble);
  easterTimer=setTimeout(()=>bubble.remove(),2300);
 }
 const groundLines=[158,248,339],scenePattern=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 function canPlay(){return phase==='playing';}
 function showNotice(message,seconds=1.25,penalty=false){messageEnd=performance.now()+seconds*1000;const notice=$(section,'[data-l-notice]');notice.textContent=message;notice.classList.toggle('is-penalty',penalty);}
 function updateHUD(){
  $(section,'[data-l-player]').textContent=player||'SEM REGISTRO';
  $(section,'[data-l-score]').textContent=String(score).padStart(4,'0');
  $(section,'[data-l-time]').textContent=timeText(remaining);
  $(section,'[data-l-time]').classList.toggle('is-critical',remaining<20);
  $(section,'[data-l-combo]').textContent='×'+combo;
 }
 function drawPixelCity(t){
  scenePattern(0,0,WIDTH,HEIGHT,'#0b0b13');
  for(let layer=0;layer<2;layer++){
   ctx.fillStyle=layer?'#17131b':'#201521';
   for(let i=0;i<20;i++){
    const x=i*65-layer*30,y=63+Math.round(Math.sin(i*6.17)*18)+layer*18;
    ctx.fillRect(x,y,50,95);
    ctx.fillStyle=layer?'#5e2228':'#40202c';
    for(let wx=x+9;wx<x+49;wx+=14)for(let wy=y+10;wy<y+70;wy+=15){if((i+wx+wy)%3!==1)ctx.fillRect(wx,wy,6,7);}
    ctx.fillStyle=layer?'#17131b':'#201521';
   }
  }
  // asphalt road
  const road=ctx.createLinearGradient(0,140,0,HEIGHT);
  road.addColorStop(0,'#29252b');road.addColorStop(.5,'#393239');road.addColorStop(1,'#1c171b');
  ctx.fillStyle=road;ctx.fillRect(0,142,WIDTH,HEIGHT-142);
  for(let i=0;i<100;i++){
    const x=(i*137)%WIDTH,y=150+(i*53)%(HEIGHT-164);
    ctx.fillStyle=i%4?'#46353a':'#5d4345';ctx.fillRect(x,y,2+i%7,2);
  }
  for(const y of [210,298,386]){
    for(let x=-50;x<WIDTH;x+=105)scenePattern(x,y,54,5,'#796452');
  }
  // pavement in the bottom
  scenePattern(0,444,WIDTH,96,'#171416');scenePattern(0,440,WIDTH,6,'#635054');
  for(let x=0;x<WIDTH;x+=90)scenePattern(x+9,463,2,77,'#2e2227');
  for(let i=0;i<7;i++){
   const x=65+i*135;scenePattern(x,440,17,36,'#3c2e2b');scenePattern(x+2,441,12,4,'#6a413b');
  }
  // animated background torches
  for(const x of [70,890]){
    ctx.fillStyle='#1b1013';ctx.fillRect(x-12,397,24,55);
    ctx.fillStyle='#b63a17';ctx.beginPath();ctx.arc(x,408,9+Math.sin(t/130+x)*2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffbd40';ctx.beginPath();ctx.arc(x,411,5,0,Math.PI*2);ctx.fill();
  }
  ctx.strokeStyle='#8c272b';ctx.lineWidth=3;ctx.strokeRect(4,4,WIDTH-8,HEIGHT-8);
  ctx.strokeStyle='#000a';ctx.lineWidth=8;ctx.strokeRect(0,0,WIDTH,HEIGHT);
 }
 function spawnCar(){
  if(cars.length>=6)return;
  const lane=Math.floor(rand(0,3)),dir=lane===1?-1:Math.random()<.5?-1:1;
  if(!carBag.length){carBag=Array.from({length:CAR_NAMES.length},(_,i)=>i);for(let i=carBag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[carBag[i],carBag[j]]=[carBag[j],carBag[i]];}}
  const index=carBag.pop();
  const speed=rand(38,85)+Math.min(35,score/30);
  const x=dir===1?-160:WIDTH+160;
  cars.push({x,y:groundLines[lane],dir,index,speed,scale:rand(.9,1.13),wiggle:Math.random()*10});
 }
 function drawCar(car){
  const w=177*car.scale,h=65*car.scale;
  if(images.cars.complete&&images.cars.naturalWidth){
   ctx.save();ctx.translate(car.x,car.y);if(car.dir<0)ctx.scale(-1,1);
   ctx.drawImage(images.cars,(car.index%5)*192,Math.floor(car.index/5)*72,192,72,-w/2,-h/2,w,h);
   ctx.restore();
  }else{
   ctx.save();ctx.translate(car.x,car.y);ctx.fillStyle=['#2d73c7','#b52754','#b5272b','#6728a9','#ffd122'][car.index%5];
   ctx.fillRect(-72,-28,144,48);ctx.fillStyle='#0a090d';ctx.fillRect(-50,10,28,28);ctx.fillRect(30,10,28,28);ctx.restore();
  }
 }
 function drawLucifer(){
  const x=WIDTH/2,y=426;
  // Goat shadows
  ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(x,495,64,13,0,0,Math.PI*2);ctx.fill();
  if(images.goat.complete&&images.goat.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(images.goat,x-68,y-62,136,150);ctx.imageSmoothingEnabled=true;}
  else{ctx.fillStyle='#434145';ctx.beginPath();ctx.arc(x,y,46,0,Math.PI*2);ctx.fill();}
 }
 function drawAim(t){
  const pulse=1+Math.sin(t/165)*.08;
  ctx.save();ctx.translate(aim.x,aim.y);ctx.scale(pulse,pulse);
  ctx.strokeStyle='#ff3a39';ctx.lineWidth=4;ctx.shadowColor='#ff1414';ctx.shadowBlur=14;
  ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(-10,0);ctx.moveTo(10,0);ctx.lineTo(30,0);ctx.moveTo(0,-30);ctx.lineTo(0,-10);ctx.moveTo(0,10);ctx.lineTo(0,30);ctx.stroke();
  ctx.restore();
 }
 function drawProjectiles(dt){
  for(let i=shotsInFlight.length-1;i>=0;i--){
   const p=shotsInFlight[i];p.p+=dt/.48;
   if(p.p>=1){impact(p);shotsInFlight.splice(i,1);continue;}
   const a=p.p,x=p.x+(p.tx-p.x)*a,y=p.y+(p.ty-p.y)*a-Math.sin(Math.PI*a)*90;
   ctx.save();ctx.translate(x,y);ctx.rotate(a*6);
   ctx.fillStyle='#5a8e61';ctx.fillRect(-5,-11,10,19);ctx.fillStyle='#a63b22';ctx.fillRect(-3,-13,6,5);
   ctx.fillStyle='#ffdc78';ctx.beginPath();ctx.arc(0,-17,6+rand(-2,2),0,Math.PI*2);ctx.fill();
   ctx.restore();
   if(Math.random()<.55)particles.push({x,y:y-12,vx:rand(-40,40),vy:rand(-90,-20),life:.28,max:.28,size:rand(3,7),color:'#ff721e'});
  }
 }
 function makeExplosion(x,y,full){
  effects.push({x,y,r:8,life:full?.65:.32,max:full?.65:.32});
  for(let i=0;i<(full?56:14);i++){
   const a=rand(0,Math.PI*2),v=rand(42,full?250:90),life=rand(.25,full?1.05:.48);
   particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-55,life,max:life,size:rand(3,full?14:7),color:['#ffdd54','#fa6c19','#df261a','#4d3737'][i%4]});
  }
 }
 function impact(projectile){
  const candidates=cars.filter(c=>Math.abs(c.x-projectile.tx)<88*c.scale&&Math.abs(c.y-projectile.ty)<34*c.scale);
  const target=candidates.sort((a,b)=>Math.abs(a.x-projectile.tx)-Math.abs(b.x-projectile.tx))[0];
  if(target){
   cars.splice(cars.indexOf(target),1);
   hits++;combo++;score+=SCORE_PER_CAR;
   const bonus=Math.min(MAX_BONUS,combo);remaining+=bonus;extraTime+=bonus;
   makeExplosion(target.x,target.y,true);if(target.index===CAR_NAMES.indexOf('Obscury'))showObscuryEgg(target.x,target.y);showNotice(`+10 PONTOS   +${bonus}s   COMBO ×${combo}`,.95);
  }else{misses++;combo=0;remaining=Math.max(0,remaining-MISS_PENALTY);makeExplosion(projectile.tx,projectile.ty,false);showNotice(`ERROU A MOLOTOV!  −${MISS_PENALTY}s`,1.35,true);}
  updateHUD();
 }
 function renderParticles(dt){
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=80*dt;
   ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.color;ctx.fillRect(Math.round(p.x),Math.round(p.y),p.size,p.size);
  }ctx.globalAlpha=1;
  effects=effects.filter(e=>e.life>0);
  for(const e of effects){e.life-=dt;const t=1-e.life/e.max;
   ctx.strokeStyle=`rgba(255,110,30,${Math.max(0,.85-t)})`;ctx.lineWidth=7*(1-t);ctx.beginPath();ctx.arc(e.x,e.y,6+t*75,0,Math.PI*2);ctx.stroke();
  }
 }
 function draw(t,dt){
  ctx.imageSmoothingEnabled=false;
  drawPixelCity(t);cars.forEach(drawCar);drawLucifer();drawProjectiles(dt);renderParticles(dt);drawAim(t);
  ctx.imageSmoothingEnabled=true;
 }
 function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
 function tick(t){
  raf=0;if(!canPlay())return;
  const realDt=Math.max(0,(t-last)/1000),dt=Math.min(.085,realDt);last=t;
  elapsed+=realDt;remaining=Math.max(0,remaining-realDt);shotCooldown=Math.max(0,shotCooldown-realDt);
  const amount=dt*280;
  aim.x=clamp(aim.x+((keys.right?1:0)-(keys.left?1:0))*amount,38,WIDTH-38);
  aim.y=clamp(aim.y+((keys.down?1:0)-(keys.up?1:0))*amount,170,397);
  spawnClock-=dt;
  if(spawnClock<=0){spawnClock=rand(.55,1.25);spawnCar();}
  cars.forEach(car=>car.x+=car.speed*car.dir*dt);
  cars=cars.filter(car=>car.x>-210&&car.x<WIDTH+210);
  draw(t,dt);
  if(messageEnd<t)$(section,'[data-l-notice]').textContent='';
  updateHUD();
  if(remaining<=0||elapsed>=900){void finish();return;}
  raf=requestAnimationFrame(tick);
 }
 function throwBottle(){
  if(!canPlay()||shotCooldown>0)return;
  shotCooldown=.4;shots++;shotsInFlight.push({x:WIDTH/2,y:435,tx:aim.x,ty:aim.y,p:0});
 }
 function moveAim(dir,amount=35){
  if(!canPlay())return;
  if(dir==='left')aim.x-=amount;if(dir==='right')aim.x+=amount;
  if(dir==='up')aim.y-=amount;if(dir==='down')aim.y+=amount;
  aim.x=clamp(aim.x,38,WIDTH-38);aim.y=clamp(aim.y,170,397);
 }
 async function requestJSON(url,options={},timeout=5000){
  const controller=new AbortController();const task=setTimeout(()=>controller.abort(),timeout);
  try{const result=await fetch(url,{...options,signal:controller.signal});const data=await result.json();return {...data,httpStatus:result.status};}
  finally{clearTimeout(task);}
 }
 function showIntro(){
  overlay.hidden=false;$(section,'[data-l-title]').textContent='O bode está pronto.';
  $(section,'[data-l-message]').textContent='Registre seu nome para entrar no placar. Mire nos carros com as setas e lance com ESPAÇO. Cada carro vale 10 pontos; combos concedem até +6 segundos por acerto. Errou a Molotov? Você perde 35 segundos.';
  form.hidden=false;$(section,'[data-l-result]').hidden=true;updateHUD();
 }
 async function start(){
  if(canPlay())return;
  const nickname=input.value.trim().replace(/\s+/g,' ');
  if(nickname.length<2||nickname.length>24){input.setCustomValidity('Digite um nome entre 2 e 24 caracteres.');input.reportValidity();return;}
  input.setCustomValidity('');player=nickname;
  const btn=form.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='PREPARANDO…';
  try{
   const session=await requestJSON(START_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'start',name:player})},2200);
   ranked=!!(session.ok&&session.token);runToken=ranked?session.token:null;
  }catch{ranked=false;runToken=null;}
  btn.disabled=false;btn.textContent='COMEÇAR PARTIDA ↗';
  phase='playing';score=0;hits=0;shots=0;misses=0;combo=0;extraTime=0;remaining=BASE_TIME;elapsed=0;spawnClock=.35;shotCooldown=0;
  aim={x:WIDTH/2,y:230};cars=[];shotsInFlight=[];effects=[];particles=[];carBag=[];last=performance.now();
  overlay.hidden=true;updateHUD();canvas.focus({preventScroll:true});
  if(!ranked)showNotice('MODO LOCAL · RANKING GLOBAL NÃO CONFIGURADO',2.6);
  raf=requestAnimationFrame(tick);
 }
 async function finish(){
  if(phase!=='playing')return;
  phase='finished';stop();remaining=0;saveLocal(player,score);updateHUD();
  overlay.hidden=false;form.hidden=true;$(section,'[data-l-result]').hidden=false;
  $(section,'[data-l-title]').textContent='FIM DE JOGO';
  $(section,'[data-l-message]').textContent='Lucifer concluiu sua caça. Volte ao mapa para superar o placar.';
  $(section,'[data-l-final]').textContent=String(score);
  $(section,'[data-l-final-text]').textContent=`${hits} carros atingidos · ${shots} lançamentos`;
  if(ranked&&runToken){
   $(section,'[data-l-message]').textContent='Registrando seus pontos no ranking global…';
   try{
    const result=await requestJSON(START_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'finish',token:runToken,name:player,score,hits,shots,misses,bonusSec:extraTime,elapsedMs:Math.round(elapsed*1000)})},6500);
    $(section,'[data-l-message]').textContent=result.ok?'Pontuação registrada no ranking global!':'Sua pontuação ficou salva neste navegador. Ranking global indisponível.';
   }catch{$(section,'[data-l-message]').textContent='Sua pontuação ficou salva neste navegador. Não foi possível enviar ao ranking global.';}
  }else $(section,'[data-l-message]').textContent='Pontuação salva neste navegador. O ranking global requer configuração do banco.';
  await loadRanking();
 }
 async function loadRanking(){
  const node=$(section,'[data-l-ranking]'),status=$(section,'[data-l-ranking-status]'),popupNode=$(rankDialog,'[data-l-popup-ranking]'),popupStatus=$(rankDialog,'[data-l-popup-ranking-status]');
  let entries=localTop();let mode='local';
  try{
   const result=await requestJSON(START_URL,{},4000);
   if(result.enabled&&Array.isArray(result.entries)){entries=result.entries;mode='global';}
  }catch{}
  remoteRanking=mode==='global';
  status.textContent=remoteRanking?'Placar global, salvo com segurança no banco de dados.':'Placar local deste navegador · configure o Redis na Vercel para ativar o ranking global.';
  popupStatus.textContent=status.textContent;
  for(const target of [node,popupNode]){
   target.replaceChildren();
   if(!entries.length){
    const empty=document.createElement('p');empty.textContent='Ainda não há pontuações. Seja a primeira pessoa a jogar!';target.append(empty);continue;
   }
   entries.slice(0,10).forEach((entry,i)=>{
    const row=document.createElement('div');row.className='lucifer-ranking-row';
    const rank=document.createElement('b');rank.textContent=i===0?'♛':String(i+1);
    const name=document.createElement('span');name.textContent=String(entry.name).slice(0,24);
    const points=document.createElement('strong');points.textContent=String(Math.max(0,Number(entry.score)||0));
    row.append(rank,name,points);target.append(row);
   });
  }
 }
 function onKeyDown(event){
  if(!canPlay()||event.altKey||event.ctrlKey||event.metaKey)return;
  if(document.activeElement!==canvas&&!section.contains(document.activeElement))return;
  if(event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)return;
  const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[event.key];
  if(dir){event.preventDefault();keys[dir]=true;moveAim(dir,12);}
  if(event.code==='Space'){event.preventDefault();if(!event.repeat)throwBottle();}
 }
 function onKeyUp(event){const dir={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[event.key];if(dir)keys[dir]=false;}
 function reset(){clearTimeout(easterTimer);stage.querySelector('.lucifer-obscury-bubble')?.remove();if(phase==='playing')stop();phase='welcome';ranked=false;runToken=null;player='';score=0;remaining=BASE_TIME;combo=0;Object.keys(keys).forEach(k=>keys[k]=false);showIntro();draw(performance.now(),0);}
 function onClick(event){
  const b=event.target.closest('button');if(!b)return;
  if(b.matches('[data-l-again]')){reset();input.focus();}
  if(b.matches('[data-l-refresh]'))void loadRanking();
  if(b.matches('[data-l-reset]'))reset();
  if(b.matches('[data-l-throw]')){throwBottle();canvas.focus({preventScroll:true});}
  const dir=b.dataset.lDir;if(dir){moveAim(dir,37);canvas.focus({preventScroll:true});}
 }
 function onTouchStart(event){const t=event.changedTouches[0];touchStart={x:t.clientX,y:t.clientY};}
 function onTouchEnd(event){if(!touchStart||!canPlay())return;const t=event.changedTouches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;touchStart=null;const rect=canvas.getBoundingClientRect();if(Math.abs(dx)+Math.abs(dy)<11){aim.x=clamp((t.clientX-rect.left)*WIDTH/rect.width,38,WIDTH-38);aim.y=clamp((t.clientY-rect.top)*HEIGHT/rect.height,170,397);return;}aim.x=clamp(aim.x+dx*WIDTH/rect.width,38,WIDTH-38);aim.y=clamp(aim.y+dy*HEIGHT/rect.height,170,397);}
 form.addEventListener('submit',e=>{e.preventDefault();void start();});
 input.addEventListener('input',()=>input.setCustomValidity(''));
 section.addEventListener('click',onClick);
 window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);
 canvas.addEventListener('touchstart',onTouchStart,{passive:true});canvas.addEventListener('touchend',onTouchEnd,{passive:true});
 window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
 images.goat.addEventListener('load',()=>{if(phase!=='playing')draw(performance.now(),0)});
 images.cars.addEventListener('load',()=>{if(phase!=='playing')draw(performance.now(),0)});
 showIntro();draw(performance.now(),0);void loadRanking();
 return()=>{stop();clearTimeout(easterTimer);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);if(rankDialog.open)rankDialog.close();rankButton.remove();rankDialog.remove();section.remove();};
}
