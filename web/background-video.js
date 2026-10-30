export const BACKGROUND_VIDEO_ID='uoe9E8KZH1I';
export function backgroundVideoURL(origin){
  const url=new URL(`https://www.youtube.com/embed/${BACKGROUND_VIDEO_ID}`);
  const parameters={autoplay:'0',mute:'1',controls:'0',disablekb:'1',fs:'0',playsinline:'1',loop:'1',playlist:BACKGROUND_VIDEO_ID,enablejsapi:'1',rel:'0',iv_load_policy:'3'};
  try{const host=new URL(origin);if(['https:','http:'].includes(host.protocol))parameters.origin=host.origin;}catch{}
  url.search=new URLSearchParams(parameters).toString();return url.href;
}
export function silencePlayer(player){player.mute();player.setVolume(0);}
let youtubePromise;
function youtubeAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(youtubePromise)return youtubePromise;
  youtubePromise=new Promise((resolve,reject)=>{
    const previous=window.onYouTubeIframeAPIReady;
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
    let settled=false;
    function finish(error){
      if(settled)return;settled=true;clearTimeout(timer);
      if(window.onYouTubeIframeAPIReady===ready)window.onYouTubeIframeAPIReady=previous;
      if(error){youtubePromise=undefined;script.remove();reject(error);}else resolve(window.YT);
    }
    function ready(){try{if(typeof previous==='function')previous();}finally{finish(window.YT?.Player?null:new Error('Player indisponível.'));}}
    const timer=setTimeout(()=>finish(new Error('O player não respondeu.')),15000);
    window.onYouTubeIframeAPIReady=ready;script.onerror=()=>finish(new Error('Não foi possível carregar o player.'));document.head.append(script);
  });return youtubePromise;
}

export function mountBackgroundVideo(){
  const root=document.querySelector('#site-video');if(!root)return()=>{};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=document.createElement('button');toggle.className='site-video-toggle';toggle.type='button';toggle.hidden=true;toggle.setAttribute('aria-pressed','false');toggle.textContent='Ativar fundo';toggle.setAttribute('aria-label','Ativar vídeo de fundo, sem áudio');document.body.append(toggle);
  let player,ready=false,entered=false,loading=false,disposed=false,userPaused=reduced.matches,readyTimer;
  const allowed=()=>entered&&!document.hidden&&!userPaused&&!disposed;
  function state(name){
    root.dataset.videoState=name;root.classList.toggle('is-playing',name==='playing');
    toggle.setAttribute('aria-pressed',String(name==='playing'));
    toggle.textContent=name==='playing'?'Pausar fundo':'Ativar fundo';toggle.setAttribute('aria-label',name==='playing'?'Pausar vídeo de fundo':'Ativar vídeo de fundo, sem áudio');
  }
  function failed(code){
    if(disposed)return;
    clearTimeout(readyTimer);root.dataset.videoError=String(code||'unavailable');state('unavailable');toggle.hidden=false;toggle.disabled=false;toggle.textContent='Recarregar fundo';toggle.setAttribute('aria-label','Tentar reproduzir o vídeo de fundo novamente');
    player?.destroy?.();player=undefined;ready=false;
  }
  function play(){if(!ready||!player)return;silencePlayer(player);if(allowed())player.playVideo();else player.pauseVideo();}
  async function load(){
    if(loading||player||disposed)return;loading=true;state('loading');toggle.disabled=true;
    delete root.dataset.videoError;
    try{
      const YT=await youtubeAPI();if(disposed)return;
      const frame=document.createElement('iframe');frame.className='site-video__iframe';frame.src=backgroundVideoURL(location.origin);frame.title='Vídeo da Fraternidade Skulls, sem áudio';frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');frame.allow='autoplay; encrypted-media; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';root.querySelector('.site-video__screen').append(frame);
      readyTimer=setTimeout(()=>failed('timeout'),15000);
      player=new YT.Player(frame,{events:{
        onReady:event=>{if(disposed)return;clearTimeout(readyTimer);player=event.target;ready=true;toggle.disabled=false;toggle.hidden=false;silencePlayer(player);if(allowed())play();else state('paused');},
        onStateChange:event=>{
          if(disposed)return;
          if(event.data===1){silencePlayer(event.target);if(!allowed()){event.target.pauseVideo();state('paused');return;}state('playing');root.dataset.videoMuted=String(event.target.isMuted()&&event.target.getVolume()===0);}
          else if(event.data===2)state('paused');
          else if(event.data===0&&allowed()){event.target.seekTo(0,true);play();}
        },
        onError:event=>failed(event.data),
        onAutoplayBlocked:()=>{state('blocked');toggle.disabled=false;toggle.hidden=false;}
      }});
    }catch{if(!disposed)failed('network');}
    finally{loading=false;}
  }
  function enter(){entered=true;toggle.hidden=false;if(!userPaused)void load();else state('paused');}
  function click(){
    if(root.dataset.videoState==='playing'){userPaused=true;player?.pauseVideo();state('paused');}
    else{userPaused=false;if(player)play();else void load();}
  }
  function visibility(){if(!ready)return;if(document.hidden){player.pauseVideo();state('paused');}else if(allowed())play();}
  function preference(){if(reduced.matches){userPaused=true;player?.pauseVideo();state('paused');}}
  toggle.addEventListener('click',click);document.addEventListener('skulls:entered',enter,{once:true});document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference);
  return()=>{disposed=true;clearTimeout(readyTimer);player?.destroy?.();toggle.remove();root.querySelector('.site-video__screen').replaceChildren();document.removeEventListener('skulls:entered',enter);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);};
}
