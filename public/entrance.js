export const SEAL_SHARDS=Object.freeze([
  {clip:'polygon(50% 48%,0 0,47% 0,44% 19%,53% 30%)',x:-70,y:-185,rotate:-17},
  {clip:'polygon(50% 48%,53% 30%,44% 19%,47% 0,100% 0,100% 17%,76% 27%,71% 38%)',x:105,y:-150,rotate:21},
  {clip:'polygon(50% 48%,71% 38%,76% 27%,100% 17%,100% 60%,80% 53%,67% 57%)',x:210,y:-35,rotate:28},
  {clip:'polygon(50% 48%,67% 57%,80% 53%,100% 60%,100% 100%,79% 100%,70% 78%)',x:155,y:150,rotate:19},
  {clip:'polygon(50% 48%,70% 78%,79% 100%,40% 100%,47% 81%,43% 65%)',x:25,y:210,rotate:-12},
  {clip:'polygon(50% 48%,43% 65%,47% 81%,40% 100%,0 100%,0 83%,24% 72%,29% 56%)',x:-135,y:170,rotate:-24},
  {clip:'polygon(50% 48%,29% 56%,24% 72%,0 83%,0 38%,23% 43%,33% 39%)',x:-205,y:25,rotate:-27},
  {clip:'polygon(50% 48%,33% 39%,23% 43%,0 38%,0 0)',x:-150,y:-115,rotate:14}
]);

export function mountEntrance({audio,onEnter=()=>{}}={}){
  const gate=document.querySelector('#skulls-gate');
  if(!gate){onEnter();return()=>{};}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const seal=gate.querySelector('.entry-seal'),fragments=gate.querySelector('.seal-fragments');
  let opening=false,finished=false,timeout;const active=[];
  const originalOverflow=document.body.style.overflow;
  document.body.classList.add('gate-locked');document.body.style.overflow='hidden';
  if(gate.open)gate.close();
  if(typeof gate.showModal==='function')gate.showModal();else gate.setAttribute('open','');
  const player=document.querySelector('.sk-audio');if(player)player.hidden=true;
  SEAL_SHARDS.forEach(({clip})=>{
    const shard=document.createElement('span');shard.className='seal-shard';shard.style.clipPath=clip;
    const image=document.createElement('img');image.src='/assets/crest-embroidered.png';image.alt='';image.width=1024;image.height=1024;
    shard.append(image);fragments.append(shard);
  });
  function finish(){
    if(finished)return;finished=true;clearTimeout(timeout);
    active.forEach(animation=>animation.cancel());
    gate.close?.();gate.hidden=true;gate.removeAttribute('open');
    document.body.classList.remove('gate-locked');document.body.style.overflow=originalOverflow;
    if(player)player.hidden=false;
    onEnter();
    let section;try{section=location.hash&&document.querySelector(location.hash);}catch{}
    const heading=(section||document).querySelector('h1,h2');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
    document.dispatchEvent(new CustomEvent('skulls:entered'));
  }
  function run(element,frames,options){
    if(typeof element?.animate!=='function')return null;
    const animation=element.animate(frames,options);active.push(animation);return animation;
  }
  function enter(event){
    event?.preventDefault();if(opening)return;opening=true;
    // Called synchronously from the seal activation so browser audio permission is obtained here.
    void audio?.play?.();
    seal.disabled=true;gate.classList.add('is-breaking');
    gate.querySelector('.entry-announcement').textContent='O selo se rompe. Bem-vindo aos Skulls.';
    if(reduced.matches||typeof gate.animate!=='function'){
      run(gate,[{opacity:1},{opacity:0}],{duration:180,easing:'ease',fill:'forwards'});timeout=setTimeout(finish,190);return;
    }
    [...fragments.children].forEach((shard,index)=>{
      const {x,y,rotate}=SEAL_SHARDS[index];
      run(shard,[{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${x*.2}px,${y*.2}px) rotate(${rotate*.15}deg)`,opacity:1,offset:.2},{transform:`translate(${x}px,${y}px) rotate(${rotate}deg)`,opacity:0}],{duration:860+index*15,easing:'cubic-bezier(0.23,1,0.32,1)',fill:'forwards'});
    });
    gate.querySelectorAll('.entry-copy,.entry-caption,.entry-eyebrow').forEach(element=>run(element,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-8px)'}],{duration:200,easing:'cubic-bezier(0.23,1,0.32,1)',fill:'forwards'}));
    run(gate.querySelector('.entry-curtain--left'),[{transform:'translateX(0)'},{transform:'translateX(-103%)'}],{duration:820,delay:130,easing:'cubic-bezier(0.77,0,0.175,1)',fill:'forwards'});
    run(gate.querySelector('.entry-curtain--right'),[{transform:'translateX(0)'},{transform:'translateX(103%)'}],{duration:820,delay:130,easing:'cubic-bezier(0.77,0,0.175,1)',fill:'forwards'});
    // A bounded timer also unlocks the page if an animation is interrupted by the browser.
    timeout=setTimeout(finish,1000);
  }
  const form=gate.querySelector('form');form.addEventListener('submit',enter);
  function preventCancel(event){event.preventDefault();}gate.addEventListener('cancel',preventCancel);
  function preference(){if(opening&&reduced.matches)finish();}reduced.addEventListener('change',preference);
  return()=>{finish();form.removeEventListener('submit',enter);gate.removeEventListener('cancel',preventCancel);reduced.removeEventListener('change',preference);};
}
