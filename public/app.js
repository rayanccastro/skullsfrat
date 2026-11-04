import { acts, ceifadoraPrologue } from './lore.js?v=6488160f7ac7';
import { mountGrimoire } from './grimorio.js?v=6488160f7ac7';
import { mountGame } from './game.js?v=6488160f7ac7';
import { mountLuciferGame } from './lucifer-game.js?v=6488160f7ac7';
import { mountRecruitment } from './recruitment.js?v=6488160f7ac7';
import { mountAudio } from './audio.js?v=6488160f7ac7';
import { mountAtmosphere } from './atmosphere.js?v=6488160f7ac7';
import { mountEntrance } from './entrance.js?v=6488160f7ac7';
import { mountBackgroundVideo } from './background-video.js?v=6488160f7ac7';



mountGrimoire({acts,ceifadoraPrologue});
const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.setAttribute('aria-expanded','false');navigation.classList.remove('is-open');}});
try{mountGame(document.querySelector('#game-root'));}catch{document.querySelector('#game-root').textContent='Não foi possível iniciar o labirinto. Atualize a página para tentar novamente.';}
mountLuciferGame(document.querySelector('#labirinto'));
mountRecruitment(document.querySelector('#recruitment-root'));
const audio=mountAudio();
mountBackgroundVideo();
mountEntrance({audio,onEnter:()=>mountAtmosphere()});
