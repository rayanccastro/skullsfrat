import { acts, ceifadoraPrologue } from './lore.js?v=ceifadora1104';
import { mountGame } from './game.js?v=ceifadora1104';
import { mountRecruitment } from './recruitment.js?v=ceifadora1104';
import { mountAudio } from './audio.js?v=ceifadora1104';
import { mountAtmosphere } from './atmosphere.js?v=ceifadora1104';
import { mountEntrance } from './entrance.js?v=ceifadora1104';
import { mountBackgroundVideo } from './background-video.js?v=ceifadora1104';


const ceifadoraStyles = document.createElement('link');
ceifadoraStyles.rel = 'stylesheet';
ceifadoraStyles.href = '/ceifadora.css';
document.head.append(ceifadoraStyles);

const story = document.querySelector('#historia');
const storyLabel = story?.querySelector('.section-kicker');
const storyTitle = story?.querySelector('.section-heading h2');
const storyDescription = story?.querySelector('.section-heading p');
if (storyLabel) storyLabel.textContent = 'GRIMÓRIO DOS SKULLS · DOCUMENTO SAGRADO DA IRMANDADE';
if (storyTitle) storyTitle.innerHTML = 'A Ceifadora.<br><em>A Senhora do Último Véu.</em>';
if (storyDescription) storyDescription.textContent = 'Seis capítulos. Uma guardiã eterna. O pacto, o Véu e os juramentos que unem os Skulls.';
const storyNav = document.querySelector('.site-header nav a[href="#historia"]');
if (storyNav) storyNav.textContent = 'A Ceifadora';

const actsRoot = document.querySelector('#acts');
if (actsRoot) {
  actsRoot.setAttribute('aria-label','Os seis capítulos do Grimório da Ceifadora');
  const prologue = document.createElement('div');
  prologue.className = 'ceifadora-prologue';
  const mark = document.createElement('span');
  mark.className = 'ceifadora-prologue-mark';
  mark.textContent = '✧  A PRIMEIRA E A ÚLTIMA  ✧';
  prologue.append(mark);
  ceifadoraPrologue.forEach(text=>{
    const paragraph=document.createElement('p');paragraph.textContent=text;prologue.append(paragraph);
  });
  actsRoot.before(prologue);
}

const SCYTHE_SVG = '<svg viewBox="0 0 360 360" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg">'
+'<defs><linearGradient id="blade" x1="0" x2="1" y1="1" y2="0"><stop offset="0" stop-color="#211d1a"/><stop offset=".45" stop-color="#88827c"/><stop offset=".75" stop-color="#e5ddd0"/><stop offset="1" stop-color="#423834"/></linearGradient>'
+'<linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="#221512"/><stop offset=".5" stop-color="#603c2f"/><stop offset="1" stop-color="#1b1311"/></linearGradient></defs>'
+'<path d="M63 334C122 241 185 144 287 26" fill="none" stroke="#0c0a09" stroke-width="18" stroke-linecap="round"/>'
+'<path d="M63 334C122 241 185 144 287 26" fill="none" stroke="url(#wood)" stroke-width="11" stroke-linecap="round"/>'
+'<path d="M277 30C306 25 329 42 339 69C357 116 337 168 309 197C277 229 239 248 209 248C266 218 297 165 293 117C291 83 276 53 252 41Z" fill="url(#blade)" stroke="#100d0c" stroke-width="4"/>'
+'<path d="M209 248C274 215 308 163 305 109" fill="none" stroke="#f6e7d5" stroke-width="3" opacity=".8"/>'
+'<path d="M266 50L297 79" stroke="#0d0b0a" stroke-width="7" stroke-linecap="round"/>'
+'<circle cx="278" cy="45" r="7" fill="#a52d26" stroke="#100b0a" stroke-width="3"/></svg>';

const chapters=[];
acts.forEach((act,index)=>{
  if(!actsRoot)return;
  const details=document.createElement('details');
  details.className='act ceifadora-chapter';
  details.id='ato-'+(index+1);
  const summary=document.createElement('summary');
  const number=document.createElement('span');number.className='act-number';number.textContent=act.roman;
  const heading=document.createElement('div');heading.className='act-heading';
  const title=document.createElement('h3');title.textContent=act.title;
  const teaser=document.createElement('p');teaser.textContent=act.teaser;heading.append(title,teaser);
  const toggle=document.createElement('span');toggle.className='act-toggle';toggle.textContent='+';toggle.setAttribute('aria-hidden','true');
  summary.append(number,heading,toggle);

  const body=document.createElement('div');body.className='act-content ceifadora-act-content';
  const scroll=document.createElement('div');scroll.className='ceifadora-scroll';
  const copy=document.createElement('div');copy.className='ceifadora-scroll-copy';
  const caption=document.createElement('div');caption.className='ceifadora-scroll-caption';
  caption.textContent='GRIMÓRIO DOS SKULLS  •  CAPÍTULO '+act.roman;
  const chapterTitle=document.createElement('h4');chapterTitle.textContent=act.title;
  copy.append(caption,chapterTitle);
  act.paragraphs.forEach(text=>{
    const p=document.createElement('p');p.textContent=text;
    if(text.startsWith('“'))p.classList.add('ceifadora-quote');
    if(/^[1-4]\. /.test(text))p.classList.add('ceifadora-oath');
    if(text==='AS TRÊS LEIS SAGRADAS')p.classList.add('ceifadora-laws-title');
    copy.append(p);
  });
  const fin=document.createElement('div');fin.className='ceifadora-scroll-fin';fin.textContent='✦  A COROA PERTENCE A ELA  ✦';copy.append(fin);
  const top=document.createElement('div');top.className='ceifadora-paper ceifadora-paper-upper';
  const bottom=document.createElement('div');bottom.className='ceifadora-paper ceifadora-paper-lower';
  const slash=document.createElement('span');slash.className='ceifadora-slash';
  const scythe=document.createElement('div');scythe.className='ceifadora-scythe';
  [top,bottom,slash,scythe].forEach(el=>el.setAttribute('aria-hidden','true'));
  scythe.innerHTML=SCYTHE_SVG.replaceAll('id="blade"','id="blade-'+index+'"').replaceAll('url(#blade)','url(#blade-'+index+')').replaceAll('id="wood"','id="wood-'+index+'"').replaceAll('url(#wood)','url(#wood-'+index+')');
  scroll.append(copy,top,bottom,slash,scythe);body.append(scroll);details.append(summary,body);actsRoot.append(details);
  chapters.push(details);
  details.addEventListener('toggle',()=>{
    if(details.open){
      chapters.forEach(other=>{if(other!==details)other.open=false;});
      scroll.classList.remove('ceifadora-revealing');
      void scroll.offsetWidth;
      scroll.classList.add('ceifadora-revealing');
    }else scroll.classList.remove('ceifadora-revealing');
  });
});

const invocation=document.querySelector('.invocation');
const invocationQuote=invocation?.querySelector('blockquote');
const invocationLine=invocation?.querySelector('.invocation-content > p');
if(invocationQuote)invocationQuote.innerHTML='“A coroa pertence a Ela.<br><em>O Véu jamais deve ser profanado.</em>”';
if(invocationLine)invocationLine.textContent='Nenhum líder está acima da Ceifadora. A irmandade não abandona os seus.';
const storyLink=document.querySelector('#read-fourth-act');
if(storyLink){
  storyLink.textContent='Abra o Grimório da Ceifadora  ↗';
  storyLink.addEventListener('click',event=>{
    event.preventDefault();
    const first=chapters[0];if(!first)return;
    first.open=true;
    first.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
}

const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}});
try{mountGame(document.querySelector('#game-root'));}catch{document.querySelector('#game-root').textContent='Não foi possível iniciar o labirinto. Atualize a página para tentar novamente.';}
mountRecruitment(document.querySelector('#recruitment-root'));
const audio=mountAudio();
mountBackgroundVideo();
mountEntrance({audio,onEnter:()=>mountAtmosphere()});
