import { acts } from './lore.js?v=7980f4328abe';
import { mountGame } from './game.js?v=7980f4328abe';
import { mountRecruitment } from './recruitment.js?v=7980f4328abe';
import { mountAudio } from './audio.js?v=7980f4328abe';
import { mountAtmosphere } from './atmosphere.js?v=7980f4328abe';
import { mountEntrance } from './entrance.js?v=7980f4328abe';
import { mountBackgroundVideo } from './background-video.js?v=7980f4328abe';

const actsRoot = document.querySelector('#acts');
acts.forEach((act,index)=>{
  const details=document.createElement('details');
  details.className='act'; details.id=`ato-${index+1}`;
  const summary=document.createElement('summary');
  const roman=document.createElement('span'); roman.className='act-number'; roman.textContent=act.roman;
  const heading=document.createElement('div'); heading.className='act-heading';
  const h=document.createElement('h3');h.textContent=act.title;
  const p=document.createElement('p');p.textContent=act.teaser;
  heading.append(h,p);
  const toggle=document.createElement('span');toggle.className='act-toggle';toggle.textContent='+';toggle.setAttribute('aria-hidden','true');
  summary.append(roman,heading,toggle);
  const body=document.createElement('div');body.className='act-content';
  act.paragraphs.forEach(text=>{const p=document.createElement('p');p.textContent=text;body.append(p);});
  details.append(summary,body);actsRoot.append(details);
});
document.querySelector('#read-fourth-act').addEventListener('click',()=>{document.querySelector('#ato-4').open=true;});
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
