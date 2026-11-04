/**
 * SKULLS • Grimório da Ceifadora — livro visual e folheável.
 * Texto íntegro importado de lore.js; a narrativa não foi reescrita.
 * Sem dependências e sem animação obrigatória para movimento reduzido.
 */
export function mountGrimoire({ acts, ceifadoraPrologue }) {
  const root = document.querySelector('#acts');
  if (!root) return;
  const history = document.querySelector('#historia');
  const head = history?.querySelector('.section-heading');
  if (head) {
    head.querySelector('.section-kicker').textContent = 'SKULLS FRATERNITY  ·  O ÚLTIMO VÉU';
    head.querySelector('h2').innerHTML = 'O Grimório <em>da Ceifadora.</em>';
    head.querySelector('p').textContent = 'A história da Senhora do Último Véu. Uma relíquia que guarda a origem, os pactos e as leis da irmandade.';
  }
  const nav = document.querySelector('.site-header nav a[href="#historia"]');
  if (nav) nav.textContent = 'O Grimório';

  root.className = 'g-library';
  root.replaceChildren();
  root.innerHTML = `
    <svg class="g-outline-defs" width="0" height="0" aria-hidden="true"><defs>
    <clipPath id="g-cover-outline" clipPathUnits="objectBoundingBox"><path d="M0.05 0.03C0.24 0 0.74 0.03 0.94 0.01C0.96 0.01 0.99 0.03 0.98 0.07C0.96 0.32 0.96 0.67 0.98 0.91C1 0.95 0.97 0.98 0.94 0.98C0.65 0.95 0.32 1 0.05 0.99C0.02 0.99 0 0.96 0.01 0.93C0.03 0.7 0.02 0.34 0.01 0.09C0 0.06 0.03 0.03 0.05 0.03Z"/></clipPath>
    <clipPath id="g-paper-left" clipPathUnits="objectBoundingBox"><path d="M1 0.12C0.93 0.07 0.82 0.05 0.7 0.06C0.5 0.06 0.35 0.1 0.18 0.05C0.15 0.05 0.16 0.1 0.15 0.13C0.12 0.37 0.08 0.68 0.05 0.83C0.05 0.85 0.08 0.86 0.13 0.85C0.32 0.86 0.48 0.83 0.74 0.84C0.85 0.84 0.91 0.88 1 0.89Z"/></clipPath>
    <clipPath id="g-paper-right" clipPathUnits="objectBoundingBox"><path d="M0 0.12C0.08 0.07 0.17 0.05 0.29 0.06C0.47 0.06 0.65 0.09 0.8 0.05C0.83 0.04 0.86 0.1 0.86 0.14C0.87 0.35 0.89 0.67 0.92 0.83C0.92 0.85 0.89 0.86 0.85 0.85C0.67 0.85 0.48 0.82 0.29 0.83C0.15 0.83 0.08 0.88 0 0.89Z"/></clipPath>
    <clipPath id="g-paper-mobile" clipPathUnits="objectBoundingBox"><path d="M0.05 0.07C0.12 0.05 0.24 0.04 0.34 0.05C0.51 0.06 0.62 0.01 0.72 0.03C0.75 0.04 0.75 0.08 0.76 0.13C0.79 0.39 0.8 0.73 0.81 0.91C0.8 0.96 0.73 0.93 0.67 0.91C0.45 0.88 0.26 0.88 0.06 0.95C0.03 0.95 0.04 0.87 0.04 0.73C0.04 0.47 0.04 0.21 0.05 0.07Z"/></clipPath>
    <clipPath id="g-open-outline" clipPathUnits="objectBoundingBox">
      <path d="M.016 1 .024 .928 .02 .86Q.035 .79 .038 .702L.028 .61 .024 .553 .034 .517 .038 .38Q.044 .255 .067 .187L.057 .134 .093 .084Q.117 .035 .175 .037C.242 .009 .261 .095 .391 .059Q.447 .044 .5 .115Q.557 .035 .633 .057Q.737 .081 .795 .046Q.827 .017 .857 .055L.928 .016 .905 .067Q.963 .145 .997 .294L1 .539 .989 .449Q.974 .376 .952 .337L.964 .596 .964 .729Q.97 .832 .992 .906L.968 .957 .966 1Z"/>
    </clipPath>
    <clipPath id="g-mobile-outline" clipPathUnits="objectBoundingBox">
      <path d="M.017 .047Q.064 .032 .09 .046Q.196 .025 .286 .046Q.431 .065 .591 .028Q.685 .006 .746 .036L.804 .016 .882 0 .859 .056Q.934 .111 1 .218L1 .348Q.973 .314 .929 .287L.962 .76Q.969 .92 .989 .989L.917 1 .079 1 .011 .976 0 .925 .014 .67Z"/>
    </clipPath>
    </defs></svg>
    <div class="g-altar">
      <span class="g-glyph" aria-hidden="true">☽ ◉ ☾</span>
      <div class="g-display">
        <button class="g-book-launch" type="button" aria-label="Abrir o Grimório da Ceifadora">
          <span class="g-cover-volume" aria-hidden="true"></span>
        </button>
        <div class="g-hero-scythe g-live-flame" aria-hidden="true"><img src="/assets/foice-ceifadora-chamas.webp" alt=""></div>
      </div>
      <h3 class="g-altar-title">O Grimório da Ceifadora</h3>
      <p class="g-altar-description">A história d'Aquela que caminha entre os mundos,<br> guia os Skulls e recolhe o que pertence ao Véu.</p>
      <button type="button" class="g-open-button"><span aria-hidden="true">✦</span> ABRIR O GRIMÓRIO <span aria-hidden="true">✦</span></button>
      <p class="g-altar-footnote">TOQUE NO LIVRO PARA DESPERTAR SEUS REGISTROS</p>
    </div>`;
  const bookTrigger = root.querySelector('.g-book-launch');
  const openButton = root.querySelector('.g-open-button');

  // Page-by-page text. Only creates an illustration-only first leaf; all source
  // paragraphs are kept, in their original order, without truncation.
  const pages = [{ illustration: true, title: 'A Primeira e a Última', roman: '✦', items: [] }];
  const chapters = [];
  const limit = 270;
  function fragments(s) {
    const words = s.split(/\s+/).filter(Boolean);
    const output = []; let buf = '';
    for (const word of words) {
      if (buf.length + word.length + 1 > limit && buf) { output.push(buf); buf = ''; }
      buf += (buf ? ' ' : '') + word;
    }
    if (buf) output.push(buf);
    return output;
  }
  function chapter(roman, title, paragraphs, isPrologue = false) {
    const start = pages.length;
    chapters.push({ start, roman, title, isPrologue });
    let page = { roman, title, isPrologue, isFirst: true, items: [], length: 0 };
    function next() {
      if (page.items.length) pages.push(page);
      page = { roman, title, isPrologue, isFirst: false, items: [], length: 0 };
    }
    for (const paragraph of paragraphs) {
      for (const piece of fragments(paragraph)) {
        const max = page.isFirst ? 255 : 335;
        if (page.length > 0 && page.length + piece.length > max) next();
        page.items.push(piece); page.length += piece.length + 9;
      }
    }
    next();
  }
  chapter('I', 'A Origem da Ceifadora', ceifadoraPrologue, true);
  for (const a of acts) chapter(a.roman, a.title, a.paragraphs);
  if (pages.length % 2) pages.push({roman:'✦',title:'O Véu permanece',isFirst:true,items:['A coroa pertence a Ela. A irmandade não abandona os seus.']});

  const modal = document.createElement('dialog');
  modal.className = 'g-dialog';
  modal.setAttribute('aria-label', 'Grimório da Ceifadora');
  modal.innerHTML = `
  <div class="g-modal-wrap">
    <header class="g-toolbar">
      <span class="g-toolbar-decor" aria-hidden="true">✢</span>
      <div class="g-toolbar-logo"><strong>SKULLS</strong><small>FRATERNITY · O ÚLTIMO VÉU</small></div>
      <div class="g-toolbar-links"><span>O GRIMÓRIO</span><button class="g-close" type="button" aria-label="Fechar o grimório">✕</button></div>
    </header>
    <div class="g-stage">
      <div class="g-spread" role="group" aria-label="Livro aberto, páginas da Ceifadora">
        <article class="g-folio g-folio-left"></article>
        <article class="g-folio g-folio-right"></article>
        <span class="g-book-binding" aria-hidden="true"></span>
        <div class="g-flip-sheet" aria-hidden="true" hidden></div>
        <svg class="g-cut-trail" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
          <path d="M -30 265 Q 470 248 1040 103" pathLength="1"/>
        </svg>
        <div class="g-cut-scythe g-live-flame" aria-hidden="true"><img src="/assets/foice-ceifadora-chamas.webp" alt=""></div>
        <button type="button" class="g-page-circle g-page-left" aria-label="Página anterior">←</button>
        <button type="button" class="g-page-circle g-page-right" aria-label="Próxima página">→</button>
      </div>
      <div class="g-launch-cover" aria-hidden="true" hidden><span class="g-cover-volume"></span></div>
      <span class="g-stage-scythe g-live-flame" aria-hidden="true"><img src="/assets/foice-ceifadora-chamas.webp" alt=""></span>
    </div>
    <footer class="g-controls">
      <button type="button" class="g-page-arrow g-prev">‹  ANTERIOR</button>
      <div class="g-chapter-controls"><label for="g-chapter-select">ÍNDICE</label><select id="g-chapter-select" class="g-chapter-select" aria-label="Escolher capítulo"></select><span class="g-page-count" aria-live="polite"></span></div>
      <button type="button" class="g-page-arrow g-next">PRÓXIMA  ›</button>
    </footer>
    <p class="g-reader-hint">Use as setas, deslize ou toque nas bordas do livro para folhear.</p>
  </div>`;
  document.body.append(modal);
  const blade = [[.19,.18],[.24,.143],[.30,.116],[.37,.096],[.44,.082],[.52,.075],
    [.60,.074],[.68,.077],[.76,.089],[.83,.105],[.89,.124],[.94,.143]];
  for (const holder of document.querySelectorAll('.g-live-flame')) {
    const fire = document.createElement('span');
    fire.className = 'g-blade-fire';
    blade.forEach(([x, y], i) => {
      const tongue = document.createElement('i');
      tongue.className = 'g-flame-tongue';
      const spark = document.createElement('i');
      spark.className = 'g-fire-spark';
      for (const part of [tongue, spark]) {
        part.style.left = `${x * 100}%`;
        part.style.top = `${y * 100}%`;
        part.style.setProperty('--phase', `${-(i * .239) % 1.7}s`);
      }
      tongue.style.setProperty('--height', `${2.6 + (i * 7 % 5) * .72}%`);
      tongue.style.setProperty('--pace', `${.37 + (i * 7 % 6) * .087}s`);
      spark.style.setProperty('--dx', `${(i * 17 % 45) - 12}px`);
      spark.style.setProperty('--pace', `${.8 + (i * 7 % 11) * .13}s`);
      fire.append(tongue, spark);
    });
    holder.append(fire);
  }
  const hero = root.querySelector('.g-hero-scythe');
  const stage = modal.querySelector('.g-stage');
  const spread = modal.querySelector('.g-spread');
  const left = modal.querySelector('.g-folio-left');
  const right = modal.querySelector('.g-folio-right');
  const flip = modal.querySelector('.g-flip-sheet');
  const cover = modal.querySelector('.g-launch-cover');
  const slash = modal.querySelector('.g-cut-scythe');
  const edgePrev = modal.querySelector('.g-page-left');
  const edgeNext = modal.querySelector('.g-page-right');
  const prev = modal.querySelector('.g-prev');
  const next = modal.querySelector('.g-next');
  const select = modal.querySelector('#g-chapter-select');
  const counter = modal.querySelector('.g-page-count');
  const close = modal.querySelector('.g-close');
  const narrow = window.matchMedia('(max-width: 760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const warmedArt = new Set();
  function warmPageArt() {
    const names = narrow.matches
      ? ['grimorio-folha', 'grimorio-folha-ilustrada']
      : ['grimorio-aberto-paginas', 'grimorio-aberto-primeira'];
    for (const name of names) {
      if (warmedArt.has(name)) continue;
      warmedArt.add(name);
      const image = new Image();
      image.src = `/assets/${name}.webp`;
    }
  }
  const flames = new IntersectionObserver(([entry]) => {
    hero.classList.toggle('g-flame-running', entry.isIntersecting);
    if (entry.isIntersecting) warmPageArt();
  });
  flames.observe(hero);
  let at = 0;
  let ready = false;
  let motion = null;
  let pointerStart = null;
  for (const item of chapters) {
    const opt = document.createElement('option');
    opt.value = String(item.start);
    opt.textContent = item.isPrologue ? 'Prólogo' : `${item.roman} · ${item.title.split(' — ')[0]}`;
    select.append(opt);
  }
  function count() {return narrow.matches ? 1 : 2;}
  function align(i) {return Math.floor(i/count())*count();}
  function renderPage(el, obj, index) {
    el.replaceChildren();
    if (!obj) {el.classList.add('g-folio-empty');el.removeAttribute('aria-label');return;}
    el.classList.remove('g-folio-empty');
    el.setAttribute('aria-label', `Página ${index+1}: ${obj.title}`);
    if(obj.illustration){
      el.classList.add('g-illustration');
      const caption=document.createElement('span');caption.className='g-illustration-caption';caption.textContent='A PRIMEIRA E A ÚLTIMA';
      el.append(caption);return;
    }
    el.classList.remove('g-illustration');
    const inside = document.createElement('div'); inside.className='g-folio-inner';
    const meta = document.createElement('span'); meta.className='g-folio-meta'; meta.textContent = obj.isPrologue ? '✦  ANTES DO FIM  ✦' : `✧  CAPÍTULO ${obj.roman}  ✧`;
    inside.append(meta);
    const title = document.createElement('h3');
    title.className = obj.isFirst ? 'g-folio-title' : 'g-folio-continued';
    title.textContent = obj.title;
    inside.append(title);
    const body = document.createElement('div');body.className='g-folio-text';
    for(const t of obj.items){
      const p=document.createElement('p');p.textContent=t;
      if(t.startsWith('“'))p.classList.add('g-folio-quote');
      if(/^[1-4]\. /.test(t))p.classList.add('g-folio-oath');
      if(t==='AS TRÊS LEIS SAGRADAS')p.classList.add('g-folio-laws');
      body.append(p);
    }
    inside.append(body);
    const foot=document.createElement('span');foot.className='g-folio-number';foot.textContent=String(index+1).padStart(2,'0');inside.append(foot);
    el.append(inside);
    el.scrollTop=0;
  }
  function render() {
    spread.classList.toggle('g-first-spread',at===0);
    renderPage(left,pages[at],at);
    renderPage(right,narrow.matches?null:pages[at+1],at+1);
    const currentCount=count();
    counter.textContent = currentCount===1 ? `PÁGINA ${at+1} / ${pages.length}` : `PÁGINAS ${at+1} — ${Math.min(at+2,pages.length)} / ${pages.length}`;
    prev.disabled=at===0;
    next.disabled=at+currentCount>=pages.length;
    edgePrev.disabled=prev.disabled;
    edgeNext.disabled=next.disabled;
    let chapterActive=chapters[0];
    for(const item of chapters) if(item.start<at+currentCount)chapterActive=item;
    select.value=String(chapterActive.start);
    select.dataset.currentChapter=select.value;
  }
  function clearMotion() {
    const running = motion;
    motion = null;
    if (running) running.animations.forEach(animation => animation.cancel());
    flip.hidden = true;
    flip.replaceChildren();
    cover.hidden = true;
    stage.classList.remove('g-cut-active', 'g-opening');
    select.removeAttribute('aria-disabled');
    spread.removeAttribute('aria-busy');
  }

  function play(animations, destination, finish) {
    const running = { animations, destination };
    motion = running;
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (motion !== running) return;
      finish();
      clearMotion();
    }).catch(() => {
      if (motion === running) settleMotion();
    });
  }

  function settleMotion(destination = motion?.destination ?? at) {
    at = destination;
    clearMotion();
    ready = true;
    stage.classList.add('g-is-open');
    render();
  }

  function sheetFace(side, back, content, index, illustration) {
    const face = document.createElement('div');
    face.className = `g-sheet-face g-sheet-${back ? 'back' : 'front'}`;
    const print = document.createElement('div');
    print.className = `g-sheet-print g-print-${side}`;
    print.classList.toggle('g-print-illustrated', illustration);
    const art = document.createElement('div');
    art.className = 'g-sheet-art';
    const folio = content?.cloneNode(true) || document.createElement('article');
    folio.className = `g-folio g-folio-${side}`;
    if (!content) renderPage(folio, pages[index], index);
    else folio.classList.toggle('g-illustration', content.classList.contains('g-illustration'));
    art.append(folio);
    print.append(art);
    face.append(print);
    return { face, folio };
  }

  function turn(direction, index = null) {
    if (!ready || motion) return;
    const destination = index === null ? at + direction * count() : align(index);
    if (destination < 0 || destination >= pages.length || destination === at) return;
    if (reduced.matches || typeof flip.animate !== 'function') {
      at = destination;
      render();
      return;
    }

    spread.setAttribute('aria-busy', 'true');
    const mobile = narrow.matches;
    const forward = destination > at;
    const sign = forward ? -1 : 1;
    const source = mobile || !forward ? left : right;
    const sourceScroll = source.scrollTop;
    const side = source === left ? 'left' : 'right';
    const reverseSide = forward ? 'left' : 'right';
    const reverseIndex = destination + (forward ? 0 : 1);

    flip.classList.toggle('g-turn-next', forward);
    flip.classList.toggle('g-turn-previous', !forward);
    flip.hidden = false;
    const tip = document.createElement('div');
    tip.className = 'g-sheet-tip';
    const fronts = [];
    // The outer edge hinges independently so the paper bends before the spine moves.
    for (const strip of ['body', 'edge']) {
      const piece = document.createElement('div');
      piece.className = `g-sheet-strip g-sheet-${strip}`;
      const front = sheetFace(side, false, source, null, at === 0);
      piece.append(front.face);
      fronts.push(front.folio);
      if (!mobile) {
        const back = sheetFace(reverseSide, true, null, reverseIndex, destination === 0);
        piece.append(back.face);
      }
      if (strip === 'edge') tip.append(piece);
      else flip.append(piece);
    }
    flip.append(tip);
    for (const folio of fronts) folio.scrollTop = sourceScroll;
    if (mobile) {
      spread.classList.toggle('g-first-spread', destination === 0);
      renderPage(left, pages[destination], destination);
    } else {
      const exposedIndex = destination + (forward ? 1 : 0);
      renderPage(source, pages[exposedIndex], exposedIndex);
      if (!forward && destination === 0) spread.classList.add('g-first-spread');
    }
    select.setAttribute('aria-disabled', 'true');
    stage.classList.add('g-cut-active');
    const sweep = stage.clientWidth / slash.offsetWidth;
    const fall = stage.clientHeight / slash.offsetHeight;
    const duration = mobile ? 670 : 820;
    const animations = [
      flip.animate([
        { transform: 'rotateY(0deg)', offset: 0, easing: 'ease-in' },
        { transform: `rotateY(${sign * 8}deg)`, offset: .22, easing: 'cubic-bezier(.38,.04,.28,1)' },
        { transform: `rotateY(${sign * (mobile ? 102 : 180)}deg)`, offset: 1 }
      ], { duration, fill: 'both' }),
      tip.animate([
        { transform: 'rotateY(0deg)', offset: 0, easing: 'ease-out' },
        { transform: `rotateY(${sign * 29}deg)`, offset: .24, easing: 'ease-in-out' },
        { transform: `rotateY(${sign * -9}deg)`, offset: .68, easing: 'ease-out' },
        { transform: 'rotateY(0deg)', offset: 1 }
      ], { duration, fill: 'both' }),
      slash.animate([
        { transform: `translate3d(${-38 * sweep}%, ${57 * fall}%, 0) rotate(-47deg) scale(.84)`, opacity: 0, offset: 0 },
        { opacity: 1, offset: .22 },
        { transform: `translate3d(${43 * sweep}%, ${42 * fall}%, 0) rotate(19deg) scale(1.04)`, opacity: .94, offset: .69 },
        { transform: `translate3d(${105 * sweep}%, ${24 * fall}%, 0) rotate(46deg) scale(.85)`, opacity: 0, offset: 1 }
      ], { duration: duration * .75, delay: 35, easing: 'cubic-bezier(.47,.02,.29,1)', fill: 'both' })
    ];
    play(animations, destination, () => {
      at = destination;
      render();
    });
  }

  let returnFocus = bookTrigger;
  function openBook(event) {
    if (modal.open) return;
    warmPageArt();
    returnFocus = event?.currentTarget || bookTrigger;
    const origin = bookTrigger.getBoundingClientRect();
    modal.showModal();
    at = 0;
    render();
    close.focus();
    if (reduced.matches || typeof cover.animate !== 'function') {
      settleMotion();
      return;
    }

    ready = false;
    stage.classList.remove('g-is-open');
    stage.classList.add('g-opening');
    cover.hidden = false;
    const target = cover.getBoundingClientRect();
    const fromBook = origin.bottom > 0 && origin.top < innerHeight && origin.width > 0;
    const travelX = fromBook ? origin.left + origin.width / 2 - target.left - target.width / 2 : 0;
    const travelY = fromBook ? origin.top + origin.height / 2 - target.top - target.height / 2 : 66;
    const scale = fromBook ? Math.min(.94, origin.width / target.width) : .7;
    const animations = [
      cover.animate([
        { transform: `translate3d(${travelX}px,${travelY}px,0) scale(${scale}) rotateZ(-6deg)`, opacity: .8, offset: 0, easing: 'cubic-bezier(.18,.73,.25,1)' },
        { transform: 'translate3d(0,0,34px) scale(1.025) rotateZ(-2deg)', opacity: 1, offset: .41, easing: 'cubic-bezier(.55,.04,.19,1)' },
        { transform: 'translate3d(0,0,5px) rotateY(-163deg) rotateZ(0deg)', opacity: 0, offset: 1 }
      ], { duration: 880, fill: 'both' }),
      spread.animate([
        { opacity: 0, transform: 'scale(.975) translateY(10px)', offset: 0 },
        { opacity: 0, transform: 'scale(.975) translateY(10px)', offset: .40, easing: 'cubic-bezier(.18,.7,.2,1)' },
        { opacity: 1, transform: 'scale(1) translateY(0)', offset: 1 }
      ], { duration: 880, fill: 'both' })
    ];
    play(animations, null, () => {
      ready = true;
      stage.classList.add('g-is-open');
    });
  }

  function closeBook() {
    clearMotion();
    ready = false;
    pointerStart = null;
    if (modal.open) modal.close();
    returnFocus.focus({ preventScroll: true });
  }

  bookTrigger.addEventListener('click', openBook);
  openButton.addEventListener('click', openBook);
  close.addEventListener('click', closeBook);
  prev.addEventListener('click',()=>turn(-1));
  next.addEventListener('click',()=>turn(1));
  edgePrev.addEventListener('click',()=>turn(-1));
  edgeNext.addEventListener('click',()=>turn(1));
  select.addEventListener('change',()=>{
    if (!ready || motion) { select.value = select.dataset.currentChapter; return; }
    turn(0,Number(select.value));
  });
  modal.addEventListener('cancel',event=>{event.preventDefault();closeBook();});
  modal.addEventListener('click',event=>{if(event.target===modal)closeBook();});
  document.addEventListener('keydown',event=>{
    if(!modal.open || !ready || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))return;
    if(event.key==='ArrowRight'){event.preventDefault();turn(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();turn(-1);}
  });
  spread.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')pointerStart={x:e.clientX,y:e.clientY};});
  spread.addEventListener('pointerup',e=>{
    if(!pointerStart)return;
    const dx=e.clientX-pointerStart.x;const dy=e.clientY-pointerStart.y;
    if(Math.abs(dx)>65 && Math.abs(dx)>Math.abs(dy)*1.35)turn(dx<0?1:-1);
    pointerStart=null;
  });
  spread.addEventListener('pointercancel', () => { pointerStart = null; });
  narrow.addEventListener('change', () => {
    if (!modal.open) return;
    settleMotion(align(motion?.destination ?? at));
  });
  reduced.addEventListener('change', () => { if (modal.open && motion) settleMotion(); });
  // Keep the standalone call to action in the invocation section functional.
  const invocation=document.querySelector('.invocation');
  const invQuote=invocation?.querySelector('blockquote');
  const invLine=invocation?.querySelector('.invocation-content > p');
  const invLink=document.querySelector('#read-fourth-act');
  if(invQuote)invQuote.innerHTML='“A coroa pertence a Ela.<br><em>O Véu jamais deve ser profanado.</em>”';
  if(invLine)invLine.textContent='Nenhum líder está acima da Ceifadora. A irmandade não abandona os seus.';
  if(invLink){
    invLink.textContent='Abra o Grimório da Ceifadora ↗';
    invLink.addEventListener('click',e=>{e.preventDefault();openBook(e);});
  }
  render();
  return {open:openBook,close:closeBook,pageCount:pages.length};
}

