import { acts, ceifadoraPrologue } from './lore.js';
import { mountGame } from './game.js';
import { mountRecruitment } from './recruitment.js';
import { mountAudio } from './audio.js';
import { mountAtmosphere } from './atmosphere.js';
import { mountEntrance } from './entrance.js';
import { mountBackgroundVideo } from './background-video.js';

// O tema é um arquivo separado para não alterar o CSS das demais seções.
const ceifadoraStyles = document.createElement('link');
ceifadoraStyles.rel = 'stylesheet';
ceifadoraStyles.href = '/ceifadora.css';
document.head.append(ceifadoraStyles);

// Atualiza somente os títulos diretamente relacionados à história.
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
  actsRoot.setAttribute('aria-label', 'Os seis capítulos do Grimório da Ceifadora');
  const prologue = document.createElement('div');
  prologue.className = 'ceifadora-prologue';
  const prologueMark = document.createElement('span');
  prologueMark.className = 'ceifadora-prologue-mark';
  prologueMark.textContent = '✧  A PRIMEIRA E A ÚLTIMA  ✧';
  prologue.append(prologueMark);
  ceifadoraPrologue.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    prologue.append(paragraph);
  });
  actsRoot.before(prologue);
}

const SCYTHE_SVG = `
<svg viewBox="0 0 360 360" role="presentation" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ceifadora-blade" x1="0" x2="1" y1="1" y2="0">
      <stop offset="0" stop-color="#211d1a"/>
      <stop offset=".45" stop-color="#88827c"/>
      <stop offset=".75" stop-color="#e5ddd0"/>
      <stop offset="1" stop-color="#423834"/>
    </linearGradient>
    <linearGradient id="ceifadora-wood" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#221512"/>
      <stop offset=".5" stop-color="#603c2f"/>
      <stop offset="1" stop-color="#1b1311"/>
    </linearGradient>
  </defs>
  <path d="M63 334C122 241 185 144 287 26" fill="none" stroke="#0c0a09" stroke-width="18" stroke-linecap="round"/>
  <path d="M63 334C122 241 185 144 287 26" fill="none" stroke="url(#ceifadora-wood)" stroke-width="11" stroke-linecap="round"/>
  <path d="M277 30C306 25 329 42 339 69C357 116 337 168 309 197C277 229 239 248 209 248C266 218 297 165 293 117C291 83 276 53 252 41Z" fill="url(#ceifadora-blade)" stroke="#100d0c" stroke-width="4"/>
  <path d="M209 248C274 215 308 163 305 109" fill="none" stroke="#f6e7d5" stroke-width="3" opacity=".8"/>
  <path d="M266 50L297 79" stroke="#0d0b0a" stroke-width="7" stroke-linecap="round"/>
  <circle cx="278" cy="45" r="7" fill="#a52d26" stroke="#100b0a" stroke-width="3"/>
</svg>`;

const chapterElements = [];

acts.forEach((act, index) => {
  if (!actsRoot) return;
  const details = document.createElement('details');
  details.className = 'act ceifadora-chapter';
  details.id = `ato-${index + 1}`;

  const summary = document.createElement('summary');
  const roman = document.createElement('span');
  roman.className = 'act-number';
  roman.textContent = act.roman;
  const heading = document.createElement('div');
  heading.className = 'act-heading';
  const title = document.createElement('h3');
  title.textContent = act.title;
  const teaser = document.createElement('p');
  teaser.textContent = act.teaser;
  heading.append(title, teaser);
  const toggle = document.createElement('span');
  toggle.className = 'act-toggle';
  toggle.textContent = '+';
  toggle.setAttribute('aria-hidden', 'true');
  summary.append(roman, heading, toggle);

  const body = document.createElement('div');
  body.className = 'act-content ceifadora-act-content';
  const scroll = document.createElement('div');
  scroll.className = 'ceifadora-scroll';
  const copy = document.createElement('div');
  copy.className = 'ceifadora-scroll-copy';

  const caption = document.createElement('div');
  caption.className = 'ceifadora-scroll-caption';
  caption.textContent = `GRIMÓRIO DOS SKULLS  •  CAPÍTULO ${act.roman}`;
  const copyTitle = document.createElement('h4');
  copyTitle.textContent = act.title;
  copy.append(caption, copyTitle);
  act.paragraphs.forEach((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (text.startsWith('“')) paragraph.classList.add('ceifadora-quote');
    if (/^[1-4]\. /.test(text)) paragraph.classList.add('ceifadora-oath');
    if (text === 'AS TRÊS LEIS SAGRADAS') paragraph.classList.add('ceifadora-laws-title');
    copy.append(paragraph);
  });
  const fin = document.createElement('div');
  fin.className = 'ceifadora-scroll-fin';
  fin.textContent = '✦  A COROA PERTENCE A ELA  ✦';
  copy.append(fin);

  // Duas metades do pergaminho se separam quando a foice realiza o corte.
  const paperUpper = document.createElement('div');
  paperUpper.className = 'ceifadora-paper ceifadora-paper-upper';
  paperUpper.setAttribute('aria-hidden', 'true');
  const paperLower = document.createElement('div');
  paperLower.className = 'ceifadora-paper ceifadora-paper-lower';
  paperLower.setAttribute('aria-hidden', 'true');
  const slash = document.createElement('span');
  slash.className = 'ceifadora-slash';
  slash.setAttribute('aria-hidden', 'true');
  const blade = document.createElement('div');
  blade.className = 'ceifadora-scythe';
  blade.setAttribute('aria-hidden', 'true');
  blade.innerHTML = SCYTHE_SVG
    .replaceAll('ceifadora-blade', `ceifadora-blade-${index}`)
    .replaceAll('ceifadora-wood', `ceifadora-wood-${index}`);
  scroll.append(copy, paperUpper, paperLower, slash, blade);
  body.append(scroll);
  details.append(summary, body);
  actsRoot.append(details);
  chapterElements.push(details);

  details.addEventListener('toggle', () => {
    if (details.open) {
      // Um capítulo por vez: deixa a navegação clara, especialmente no celular.
      chapterElements.forEach((other) => { if (other !== details) other.open = false; });
      scroll.classList.remove('ceifadora-revealing');
      // Reinicia o efeito se o mesmo capítulo for aberto novamente.
      void scroll.offsetWidth;
      scroll.classList.add('ceifadora-revealing');
    } else {
      scroll.classList.remove('ceifadora-revealing');
    }
  });
});

// A invocação inferior agora direciona ao primeiro capítulo do grimório.
const invocation = document.querySelector('.invocation');
const invocationQuote = invocation?.querySelector('blockquote');
const invocationLine = invocation?.querySelector('.invocation-content > p');
if (invocationQuote) invocationQuote.innerHTML = '“A coroa pertence a Ela.<br><em>O Véu jamais deve ser profanado.</em>”';
if (invocationLine) invocationLine.textContent = 'Nenhum líder está acima da Ceifadora. A irmandade não abandona os seus.';
const storyLink = document.querySelector('#read-fourth-act');
if (storyLink) {
  storyLink.textContent = 'Abra o Grimório da Ceifadora  ↗';
  storyLink.addEventListener('click', (event) => {
    event.preventDefault();
    const first = chapterElements[0];
    if (!first) return;
    first.open = true;
    first.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
}

// Restante do site preservado: menu, labirinto, formulário, som, fundo e entrada.
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach((anchor) => anchor.addEventListener('click', () => {
  menu.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  }
});
try {
  mountGame(document.querySelector('#game-root'));
} catch {
  document.querySelector('#game-root').textContent = 'Não foi possível iniciar o labirinto. Atualize a página para tentar novamente.';
}
mountRecruitment(document.querySelector('#recruitment-root'));
const audio = mountAudio();
mountBackgroundVideo();
mountEntrance({ audio, onEnter: () => mountAtmosphere() });
