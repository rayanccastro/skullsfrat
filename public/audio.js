/** Original Skulls instrumental, composed and rendered locally after an explicit play action. */
export const TRACK = Object.freeze({title:'Nas sombras',bpm:76,bars:8,beatsPerBar:4});
const VOLUME_KEY='skulls-sound-volume-v1';
export function buildScore(){
  const beat=60/TRACK.bpm, duration=TRACK.bars*TRACK.beatsPerBar*beat;
  const roots=[40,40,36,36,33,33,35,35];
  const score=[];
  const add=(instrument,bar,position,settings={})=>score.push({instrument,time:(bar*4+position)*beat,...settings});
  roots.forEach((root,bar)=>{
    // A low, palm-muted eighth-note riff with a sustained chord above it.
    add('chord',bar,0,{note:root,length:beat*2.8,level:.23,pan:bar%2?.28:-.28});
    [0,.75,1.5,2.5,3,3.5].forEach((position,i)=>add('guitar',bar,position,{note:root+(i===4?7:0),length:beat*(i===5?.3:.43),level:i===0?.21:.16,pan:i%2?.36:-.36}));
    [0,1.5,2,3.5].forEach((position,i)=>add('bass',bar,position,{note:root-12,length:beat*(i%2?.42:1.25),level:.24}));
    [0,1.5,3.25].forEach((position,i)=>add('kick',bar,position,{level:i===0?.48:.31}));
    add('snare',bar,2,{level:.27});
    for(let i=0;i<8;i++)add('hat',bar,i*.5,{level:i%2?.045:.065,pan:i%2?.35:-.2});
    if(bar===3||bar===7){add('snare',bar,3.5,{level:.11});add('hat',bar,3.75,{level:.05,pan:.4});}
    add('pad',bar,0,{note:root+24,length:beat*4.1,level:.026});
    if(bar%2===1){
      const notes=bar===7?[66,64,59]:[64,67,66];
      notes.forEach((note,i)=>add('bell',bar,.5+i,{note,length:beat*1.7,level:.043,pan:i%2?-.25:.25}));
    }
  });
  return {duration,events:score.sort((a,b)=>a.time-b.time)};
}
export function normalizeVolume(value){
  if(value===null||value===undefined||value==='')return .25;
  const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(1,number)):.25;
}
const frequency=midi=>440*2**((midi-69)/12);
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function noiseBuffer(context,seconds,seed){
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*seconds),context.sampleRate),data=buffer.getChannelData(0),random=rng(seed);
  for(let i=0;i<data.length;i++)data[i]=random()*2-1;
  return buffer;
}
function stringBuffer(context,note,seconds=3){
  const size=Math.round(context.sampleRate/frequency(note)),ring=new Float32Array(size),random=rng(note*193+7);
  for(let i=0;i<size;i++)ring[i]=(random()*2-1)*.7;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*seconds),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++){
    const cursor=i%size,next=(cursor+1)%size,previous=ring[cursor];
    ring[cursor]=.9975*(previous+ring[next])*.5;
    data[i]=previous*Math.min(1,i/(context.sampleRate*.002));
  }
  return buffer;
}
function envelope(context,time,level,length,attack=.006){
  const gain=context.createGain();gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+attack);
  gain.gain.setValueAtTime(level,time+Math.max(attack,length*.62));gain.gain.exponentialRampToValueAtTime(.0001,time+length);gain.gain.setValueAtTime(0,time+length+.005);return gain;
}
function mixPan(context,node,pan,destination){
  if(context.createStereoPanner){const panner=context.createStereoPanner();panner.pan.value=pan||0;node.connect(panner);panner.connect(destination);}else node.connect(destination);
}
async function renderTrack(AudioOffline){
  const {duration,events}=buildScore(),rate=44100,loopLength=Math.round(duration*rate),tailLength=rate*4;
  const context=new AudioOffline(2,loopLength+tailLength,rate);
  const mix=context.createGain();mix.gain.value=.75;
  const compressor=context.createDynamicsCompressor();compressor.threshold.value=-17;compressor.knee.value=17;compressor.ratio.value=4;compressor.attack.value=.005;compressor.release.value=.22;mix.connect(compressor);compressor.connect(context.destination);
  const guitarBus=context.createGain(),distortion=context.createWaveShaper(),curve=new Float32Array(2048);
  for(let i=0;i<curve.length;i++){const x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*5)/Math.tanh(5)*.62;}
  distortion.curve=curve;distortion.oversample='2x';const guitarFilter=context.createBiquadFilter();guitarFilter.type='lowpass';guitarFilter.frequency.value=2900;guitarFilter.Q.value=.5;guitarBus.connect(distortion);distortion.connect(guitarFilter);guitarFilter.connect(mix);
  const space=context.createConvolver(),impulse=context.createBuffer(2,rate*2.6,rate),random=rng(151);
  for(let channel=0;channel<2;channel++){const data=impulse.getChannelData(channel);for(let i=0;i<data.length;i++)data[i]=(random()*2-1)*(1-i/data.length)**3*.22;}
  space.buffer=impulse;const wet=context.createGain();wet.gain.value=.16;space.connect(wet);wet.connect(mix);
  const noise=noiseBuffer(context,.8,901),strings=new Map();
  const pluck=(note,time,length,level,pan)=>{
    if(!strings.has(note))strings.set(note,stringBuffer(context,note));
    const source=context.createBufferSource();source.buffer=strings.get(note);const gain=envelope(context,time,level,length);source.connect(gain);mixPan(context,gain,pan,guitarBus);source.start(time);source.stop(time+length+.01);
  };
  for(const event of events){
    const {time,note,length,level,pan}=event;
    if(event.instrument==='guitar')pluck(note,time,length,level,pan);
    if(event.instrument==='chord')[0,7,12].forEach((interval,i)=>pluck(note+interval,time+i*.012,length,level*.53,i%2?-.25:.25));
    if(event.instrument==='bass'){
      const source=context.createOscillator();source.type='triangle';source.frequency.value=frequency(note);const gain=envelope(context,time,level,length,.015);source.connect(gain);gain.connect(mix);source.start(time);source.stop(time+length+.01);
    }
    if(event.instrument==='kick'){
      const source=context.createOscillator();source.frequency.setValueAtTime(112,time);source.frequency.exponentialRampToValueAtTime(43,time+.13);const gain=envelope(context,time,level,.31,.003);source.connect(gain);gain.connect(mix);source.start(time);source.stop(time+.33);
    }
    if(event.instrument==='snare'||event.instrument==='hat'){
      const source=context.createBufferSource();source.buffer=noise;const filter=context.createBiquadFilter();filter.type='highpass';filter.frequency.value=event.instrument==='hat'?6700:1400;
      const gain=envelope(context,time,level,event.instrument==='hat'?.065:.19,.001);source.connect(filter);filter.connect(gain);mixPan(context,gain,pan,mix);if(event.instrument==='snare')gain.connect(space);source.start(time);source.stop(time+.25);
      if(event.instrument==='snare'){const tone=context.createOscillator();tone.frequency.value=182;const thump=envelope(context,time,.075,.12,.002);tone.connect(thump);thump.connect(mix);tone.start(time);tone.stop(time+.13);}
    }
    if(event.instrument==='pad'||event.instrument==='bell'){
      const pad=event.instrument==='pad',gain=envelope(context,time,level,length,pad?.45:.015);gain.connect(mix);gain.connect(space);
      (pad?[0,7,12]:[0,12]).forEach((interval,i)=>{const oscillator=context.createOscillator();oscillator.type='sine';oscillator.frequency.value=frequency(note+interval);oscillator.detune.value=pad?(i-1)*5:0;oscillator.connect(gain);oscillator.start(time);oscillator.stop(time+length+.01);});
    }
  }
  const rendered=await context.startRendering();
  // Fold the reverberation tail back into the beginning for a continuous loop.
  const buffer=context.createBuffer(2,loopLength,rate);
  let peak=0;
  for(let channel=0;channel<2;channel++){
    const source=rendered.getChannelData(channel),data=buffer.getChannelData(channel);data.set(source.subarray(0,loopLength));
    for(let i=0;i<tailLength;i++)data[i]+=source[loopLength+i];
    for(let i=0;i<data.length;i++){data[i]=Math.tanh(data[i]*.9)*.85;peak=Math.max(peak,Math.abs(data[i]));}
  }
  const normalization=peak>0?Math.min(4,.72/peak):1;
  for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<data.length;i++)data[i]*=normalization;}
  return buffer;
}

export function mountAudio(){
  if(typeof document==='undefined')return()=>{};
  const existing=document.querySelector('.sk-audio');if(existing)return()=>{};
  const root=document.createElement('aside');root.className='sk-audio';root.setAttribute('aria-label','Trilha sonora dos Skulls');
  root.innerHTML='<button class="sk-audio__toggle" type="button" aria-label="Ativar trilha sonora" aria-pressed="false"><span class="sk-audio__icon" aria-hidden="true">▶</span></button><div class="sk-audio__copy"><strong>Nas sombras</strong><span data-audio-state>Ativar trilha · rock e suspense</span></div><div class="sk-audio__volume"><label for="sk-audio-volume">Volume da trilha</label><input id="sk-audio-volume" type="range" min="0" max="100" step="1" aria-label="Volume da trilha"></div><span class="sk-audio__announcement" role="status" aria-live="polite"></span>';
  document.body.append(root);
  const toggle=root.querySelector('button'),slider=root.querySelector('input'),subtitle=root.querySelector('[data-audio-state]'),announcement=root.querySelector('[role=status]');
  let volume=.25;try{volume=normalizeVolume(localStorage.getItem(VOLUME_KEY));}catch{}
  slider.value=String(Math.round(volume*100));
  const Audio=window.AudioContext||window.webkitAudioContext,Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  let context,output,source,buffer,preparation,playing=false,busy=false,disposed=false,offset=0,startedAt=0;
  let idleHandle,warmupTimer;
  function prepare(){
    if(disposed||!Offline)return Promise.resolve(null);
    if(!preparation)preparation=renderTrack(Offline).then(rendered=>{buffer=rendered;return rendered;}).catch(error=>{preparation=null;throw error;});
    return preparation;
  }
  function update(){toggle.setAttribute('aria-pressed',String(playing));toggle.setAttribute('aria-label',playing?'Pausar trilha sonora':'Ativar trilha sonora');toggle.querySelector('span').textContent=playing?'Ⅱ':'▶';root.classList.toggle('is-playing',playing);subtitle.textContent=playing?'Rock e suspense · tocando':'Ativar trilha · rock e suspense';}
  function pause(message='Trilha pausada.'){
    if(source){if(playing&&buffer)offset=(offset+context.currentTime-startedAt)%buffer.duration;try{source.stop();}catch{}source.disconnect();source=null;}
    playing=false;context?.suspend().catch(()=>{});update();announcement.textContent=message;
  }
  async function play(){
    if(busy||disposed||playing)return;
    if(!Audio||!Offline){announcement.textContent='Seu navegador não oferece suporte à trilha sonora.';subtitle.textContent='Áudio indisponível neste navegador';toggle.disabled=true;return;}
    busy=true;toggle.disabled=true;
    try{
      if(!context){context=new Audio();output=context.createGain();output.gain.value=volume*.45;output.connect(context.destination);}
      await context.resume();
      if(!buffer){subtitle.textContent='Preparando a trilha…';await prepare();}
      if(disposed||document.hidden){await context.suspend();if(!disposed)subtitle.textContent='Ativar trilha · rock e suspense';return;}
      source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(output);output.gain.setValueAtTime(0,context.currentTime);output.gain.linearRampToValueAtTime(volume*.45,context.currentTime+.8);startedAt=context.currentTime;source.start(0,offset);playing=true;update();announcement.textContent='Trilha ativada: Nas sombras, instrumental original.';
    }catch{pause('Não foi possível iniciar o áudio. Tente ativar a trilha novamente.');subtitle.textContent='Tentar ativar a trilha';}
    finally{busy=false;if(!disposed)toggle.disabled=false;}
  }
  function onToggle(){if(playing)pause();else void play();}
  function onVolume(){volume=normalizeVolume(Number(slider.value)/100);if(output&&context)output.gain.setTargetAtTime(volume*.45,context.currentTime,.04);try{localStorage.setItem(VOLUME_KEY,String(volume));}catch{}}
  function onVisibility(){if(document.hidden&&playing)pause('Trilha pausada ao sair da página.');}
  function onPageHide(event){if(event.persisted)pause();else cleanup();}
  function cleanup(){disposed=true;pause();clearTimeout(warmupTimer);if(idleHandle!==undefined)window.cancelIdleCallback?.(idleHandle);toggle.removeEventListener('click',onToggle);slider.removeEventListener('input',onVolume);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',onPageHide);context?.close().catch(()=>{});buffer=null;root.remove();}
  toggle.addEventListener('click',onToggle);slider.addEventListener('input',onVolume);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('pagehide',onPageHide);
  // Rendering is silent: the real AudioContext is still created inside the entrance click.
  if(window.requestIdleCallback)idleHandle=window.requestIdleCallback(()=>{void prepare().catch(()=>{});},{timeout:1200});
  else warmupTimer=setTimeout(()=>{void prepare().catch(()=>{});},500);
  return Object.assign(cleanup,{play,pause,prepare,isPlaying:()=>playing});
}
