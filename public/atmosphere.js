const EASE_OUT='cubic-bezier(0.23,1,0.32,1)';
export const clampScroll=(value,max)=>Math.max(0,Math.min(max,value));
export function easeScrollStep(current,target,seconds){
  if(seconds<=0||current===target)return current;
  const difference=target-current;
  // Advance at least one CSS pixel so integer scroll offsets cannot stall at 120+ Hz.
  const distance=Math.min(Math.abs(difference),Math.max(1,Math.abs(difference)*(1-Math.exp(-22*Math.min(.05,seconds)))));
  return current+Math.sign(difference)*distance;
}

/** Pointer-wheel smoothing leaves touch, trackpads, text entry and reduced motion native. */
export function installSmoothScroll(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  let frame=0,target=scrollY,lastTime=0;
  const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;document.documentElement.removeAttribute('data-wheel-smoothing');}
  function tick(now){
    const dt=lastTime?(now-lastTime)/1000:1/60;lastTime=now;
    target=clampScroll(target,maximum());
    if(Math.abs(target-scrollY)<1.5){scrollTo({top:target,behavior:'instant'});stop();return;}
    const next=easeScrollStep(scrollY,target,dt);
    if(Math.abs(target-next)<.7){scrollTo({top:target,behavior:'instant'});stop();return;}
    scrollTo({top:next,behavior:'instant'});frame=requestAnimationFrame(tick);
  }
  function nestedScroller(node,delta){
    for(let element=node instanceof Element?node:null;element&&element!==document.body;element=element.parentElement){
      if(element.matches('input,textarea,select,canvas,[contenteditable="true"],[data-native-scroll]'))return true;
      const style=getComputedStyle(element);
      if(/auto|scroll/.test(style.overflowY)&&element.scrollHeight>element.clientHeight+1){
        if(delta<0&&element.scrollTop>0||delta>0&&element.scrollTop+element.clientHeight<element.scrollHeight-1)return true;
      }
    }
    return false;
  }
  function wheel(event){
    if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||reduced.matches||!fine.matches){stop();return;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    // Small precision-trackpad deltas already carry the OS's own smooth inertia.
    if(!delta||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.deltaMode===0&&Math.abs(delta)<50||nestedScroller(event.target,delta)){stop();return;}
    if(!frame)target=scrollY;
    const next=clampScroll(target+delta,maximum());
    if(next===target)return;
    event.preventDefault();target=next;
    if(!frame){document.documentElement.setAttribute('data-wheel-smoothing','');frame=requestAnimationFrame(tick);}
  }
  function key(event){if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))stop();}
  function clicked(event){if(event.target instanceof Element&&event.target.closest('a[href^="#"]'))stop();}
  window.addEventListener('wheel',wheel,{passive:false});
  window.addEventListener('keydown',key);window.addEventListener('pointerdown',stop,{passive:true});
  window.addEventListener('touchstart',stop,{passive:true});window.addEventListener('hashchange',stop);window.addEventListener('popstate',stop);document.addEventListener('click',clicked,true);
  reduced.addEventListener('change',stop);
  return()=>{stop();window.removeEventListener('wheel',wheel);window.removeEventListener('keydown',key);window.removeEventListener('pointerdown',stop);window.removeEventListener('touchstart',stop);window.removeEventListener('hashchange',stop);window.removeEventListener('popstate',stop);document.removeEventListener('click',clicked,true);reduced.removeEventListener('change',stop);};
}

export function mountAtmosphere(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const animations=new Set();const cleanups=[];
  function animate(element,frames,options){
    if(!element||typeof element.animate!=='function'||reduced.matches)return;
    const animation=element.animate(frames,options);animations.add(animation);
    animation.finished.then(()=>{animations.delete(animation);animation.cancel();},()=>animations.delete(animation));
    return animation;
  }
  const revealTargets=document.querySelectorAll('.manifesto-title,.manifesto-copy,.symbol-notes>p,.section-heading,.act,.invocation-content,.recruit-intro,.recruitment-form,.site-footer');
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;revealObserver.unobserve(entry.target);
      const stagger=entry.target.matches('.act')?[...entry.target.parentElement.children].indexOf(entry.target)*50:0;
      animate(entry.target,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:stagger,easing:EASE_OUT,fill:'both'});
    });
  },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  revealTargets.forEach(element=>revealObserver.observe(element));
  document.querySelectorAll('.hero-text>*').forEach((element,index)=>animate(element,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,delay:index*70,easing:EASE_OUT,fill:'both'}));
  animate(document.querySelector('.hero-art'),[{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}],{duration:1000,delay:130,easing:EASE_OUT,fill:'both'});
  const artObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-inview',entry.isIntersecting)),{threshold:.05});
  document.querySelectorAll('.hero-art,.invocation').forEach(element=>artObserver.observe(element));
  const heroArt=document.querySelector('.hero-art'),relief=heroArt?.querySelector('.hero-relief');
  const precise=matchMedia('(hover: hover) and (pointer: fine)');let tiltFrame=0,pointer;
  function resetTilt(){cancelAnimationFrame(tiltFrame);tiltFrame=0;if(relief)relief.style.transform='';}
  function tilt(event){
    if(reduced.matches||!precise.matches||!relief)return;
    pointer={x:event.clientX,y:event.clientY};if(tiltFrame)return;
    tiltFrame=requestAnimationFrame(()=>{tiltFrame=0;const rect=heroArt.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(pointer.x-rect.left)/rect.width*2-1));const y=Math.max(-1,Math.min(1,(pointer.y-rect.top)/rect.height*2-1));relief.style.transform=`perspective(1000px) rotateX(${-y*3}deg) rotateY(${x*3}deg)`;});
  }
  heroArt?.addEventListener('pointermove',tilt);heroArt?.addEventListener('pointerleave',resetTilt);
  cleanups.push(()=>{resetTilt();heroArt?.removeEventListener('pointermove',tilt);heroArt?.removeEventListener('pointerleave',resetTilt);});
  const activeNav=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    document.querySelectorAll('#navigation a').forEach(link=>{if(link.hash===`#${entry.target.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }),{rootMargin:'-20% 0px -55% 0px',threshold:0});
  document.querySelectorAll('#irmandade,#historia,#labirinto,#recrutamento').forEach(section=>activeNav.observe(section));
  document.querySelectorAll('.act').forEach(details=>{
    const summary=details.querySelector('summary');let current,wantsOpen=details.open;
    function click(event){
      if(event.detail===0||reduced.matches||typeof details.animate!=='function'){current?.cancel();current=null;details.style.overflow='';return;}
      event.preventDefault();wantsOpen=current?!wantsOpen:!details.open;
      const start=details.getBoundingClientRect().height;current?.cancel();
      details.style.height='';details.open=true;
      const end=wantsOpen?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
      details.style.overflow='hidden';
      current=details.animate([{height:`${start}px`},{height:`${end}px`}],{duration:220,easing:EASE_OUT});
      const thisAnimation=current;
      current.finished.then(()=>{if(current!==thisAnimation)return;details.open=wantsOpen;details.style.overflow='';current=null;},()=>{});
      if(wantsOpen)animate(details.querySelector('.act-content'),[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:EASE_OUT});
    }
    summary.addEventListener('click',click);
    cleanups.push(()=>{summary.removeEventListener('click',click);current?.cancel();details.style.overflow='';});
  });
  function formStep(){animate(document.querySelector('#skulls-recruitment'),[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:EASE_OUT});}
  document.addEventListener('skulls:form-step',formStep);
  // Mutation feedback only at rare state transitions, never on a serpent movement.
  const game=document.querySelector('#game-root');let previousClue='';
  const clueObserver=new MutationObserver(()=>{
    const clue=game?.querySelector('[data-revelation]');
    if(clue&&clue.textContent!==previousClue){previousClue=clue.textContent;animate(clue,[{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:EASE_OUT});}
  });
  if(game)clueObserver.observe(game,{subtree:true,childList:true});
  function visibility(){document.body.classList.toggle('motion-paused',document.hidden);}
  function reducedChanged(){if(reduced.matches){animations.forEach(a=>a.cancel());resetTilt();}}
  document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',reducedChanged);
  const removeSmooth=installSmoothScroll();
  return()=>{removeSmooth();revealObserver.disconnect();artObserver.disconnect();activeNav.disconnect();clueObserver.disconnect();animations.forEach(a=>a.cancel());cleanups.forEach(fn=>fn());document.removeEventListener('skulls:form-step',formStep);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',reducedChanged);};
}
