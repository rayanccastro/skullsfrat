/**
 * SKULLS • Grimório da Ceifadora — livro visual e folheável.
 * Texto íntegro importado de lore.js; a narrativa não foi reescrita.
 * Sem dependências e sem animação obrigatória para movimento reduzido.
 */
export function mountGrimoire({ acts, ceifadoraPrologue }) {
  const root = document.querySelector('#acts');
  if (!root) return;
  if (!document.querySelector('link[data-grimorio-visual]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet'; style.href = '/grimorio.css';
    style.dataset.grimorioVisual = '';
    document.head.append(style);
  }
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
    <div class="g-altar">
      <span class="g-glyph" aria-hidden="true">☽ ◉ ☾</span>
      <div class="g-display">
        <button class="g-book-launch" type="button" aria-label="Abrir o Grimório da Ceifadora">
          <span class="g-cover-pages" aria-hidden="true"></span>
          <span class="g-cover-book" aria-hidden="true">
            <span class="g-cover-art"></span>
            <span class="g-cover-gem">◆</span>
          </span>
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
  modal.setAttribute('aria-labelledby', 'g-dialog-title');
  modal.innerHTML = `
  <div class="g-modal-wrap">
    <header class="g-toolbar">
      <span class="g-toolbar-decor" aria-hidden="true">✢</span>
      <div class="g-toolbar-logo"><strong>SKULLS</strong><small>FRATERNITY · O ÚLTIMO VÉU</small></div>
      <div class="g-toolbar-links"><span>O GRIMÓRIO</span><button class="g-close" type="button" aria-label="Fechar o grimório">✕</button></div>
    </header>
    <div class="g-stage" id="g-dialog-title">
      <div class="g-spread" role="group" aria-label="Livro aberto, páginas da Ceifadora">
        <article class="g-folio g-folio-left"></article>
        <article class="g-folio g-folio-right"></article>
        <span class="g-book-binding" aria-hidden="true"></span>
        <div class="g-flip-sheet" aria-hidden="true"><div class="g-page-fold" aria-hidden="true"></div></div>
        <span class="g-cut-trail" aria-hidden="true"></span>
        <div class="g-cut-scythe g-live-flame" aria-hidden="true"><img src="/assets/foice-ceifadora-chamas.webp" alt=""></div>
        <button type="button" class="g-page-circle g-page-left" aria-label="Página anterior">←</button>
        <button type="button" class="g-page-circle g-page-right" aria-label="Próxima página">→</button>
      </div>
      <div class="g-launch-cover" aria-hidden="true"><span class="g-launch-cover-art"></span><span class="g-launch-cover-jewel">◆</span></div>
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
  // Animated sparks rise from the blade in the closed view, idle view and
  // cutting animation; no video, dependency or additional downloads.
  for (const holder of [root.querySelector('.g-hero-scythe'), ...modal.querySelectorAll('.g-live-flame')]) {
    if (!holder) continue;
    for (let i = 0; i < 13; i++) {
      const spark = document.createElement('i'); spark.className = 'g-fire-spark';
      const x = 13 + i * 4.6;
      const y = 10 + 2.7 * Math.sin(i * .83);
      spark.style.left = `${x}%`; spark.style.top = `${y}%`;
      spark.style.setProperty('--dx', `${(i % 2 ? 1 : -1) * (8 + i * 2)}px`);
      spark.style.setProperty('--dy', `${-20 - (i * 11) % 38}px`);
      spark.style.setProperty('--delay', `${(i * .137).toFixed(2)}s`);
      spark.style.setProperty('--duration', `${(1.12 + (i % 4) * .22).toFixed(2)}s`);
      holder.append(spark);
    }
  }
  const stage = modal.querySelector('.g-stage');
  const spread = modal.querySelector('.g-spread');
  const left = modal.querySelector('.g-folio-left');
  const right = modal.querySelector('.g-folio-right');
  const flip = modal.querySelector('.g-flip-sheet');
  const prev = modal.querySelector('.g-prev');
  const next = modal.querySelector('.g-next');
  const select = modal.querySelector('#g-chapter-select');
  const counter = modal.querySelector('.g-page-count');
  const close = modal.querySelector('.g-close');
  const narrow = window.matchMedia('(max-width: 760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let at = 0, ready = false, busy = false, timers = [], pointerStart = null;
  function timeout(f, delay) { const id = window.setTimeout(f, delay); timers.push(id); return id; }
  function clearTimers() { for(const id of timers)window.clearTimeout(id); timers=[]; }
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
    if (!obj) {el.classList.add('g-folio-empty');return;}
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
    modal.querySelector('.g-page-left').disabled=prev.disabled;
    modal.querySelector('.g-page-right').disabled=next.disabled;
    let chapterActive=chapters[0];
    for(const item of chapters) if(item.start<=at)chapterActive=item;
    select.value=String(chapterActive.start);
  }
  function resetTurning() {
    busy=false;
    flip.className='g-flip-sheet';
    flip.replaceChildren();
    const fold=document.createElement('div');fold.className='g-page-fold';flip.append(fold);
    stage.classList.remove('g-cut-active');
  }
  function turn(direction,index=null){
    if(!ready || busy)return;
    const destination=index===null ? at + direction*count() : align(index);
    if(destination<0 || destination>=pages.length || destination===at)return;
    if(reduced.matches){at=destination;render();return;}
    busy=true;
    const forward=destination>at;
    const page=forward?(narrow.matches?left:right):left;
    const clone=page.cloneNode(true);
    clone.classList.add('g-flip-inner');clone.removeAttribute('aria-label');
    flip.replaceChildren(clone);
    const fold=document.createElement('span');fold.className='g-page-fold';flip.append(fold);
    flip.className='g-flip-sheet '+(forward?'g-flip-next':'g-flip-previous');
    stage.classList.remove('g-cut-active');
    void stage.offsetWidth;
    // The scythe crosses the paper first, with moving embers and flame glow.
    stage.classList.add('g-cut-active');
    // The corner curls visibly before the 3D turn actually begins.
    flip.classList.add('g-curl-prep');
    timeout(()=>{flip.classList.remove('g-curl-prep');flip.classList.add('g-flip-animate');},450);
    timeout(()=>{at=destination;render();},1000);
    timeout(resetTurning,1560);
  }
  function openBook(){
    if(modal.open)return;
    modal.showModal();clearTimers();resetTurning();at=0;render();
    ready=false;stage.className='g-stage';
    if(reduced.matches){stage.classList.add('g-is-open');ready=true;close.focus();return;}
    stage.classList.add('g-arriving');
    timeout(()=>{stage.classList.remove('g-arriving');stage.classList.add('g-opening');},720);
    timeout(()=>{stage.classList.remove('g-opening');stage.classList.add('g-is-open');ready=true;close.focus();},2100);
  }
  function closeBook(){
    clearTimers();resetTurning();ready=false;
    if(modal.open)modal.close();
    bookTrigger.focus();
  }
  bookTrigger.addEventListener('click',openBook);
  openButton.addEventListener('click',openBook);
  modal.querySelector('.g-close').addEventListener('click',closeBook);
  prev.addEventListener('click',()=>turn(-1));
  next.addEventListener('click',()=>turn(1));
  modal.querySelector('.g-page-left').addEventListener('click',()=>turn(-1));
  modal.querySelector('.g-page-right').addEventListener('click',()=>turn(1));
  select.addEventListener('change',()=>turn(0,Number(select.value)));
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
  function onNarrow(){if(!modal.open)return;clearTimers();resetTurning();at=align(at);render();}
  if(narrow.addEventListener)narrow.addEventListener('change',onNarrow);
  else narrow.addListener(onNarrow);
  // Keep the standalone call to action in the invocation section functional.
  const invocation=document.querySelector('.invocation');
  const invQuote=invocation?.querySelector('blockquote');
  const invLine=invocation?.querySelector('.invocation-content > p');
  const invLink=document.querySelector('#read-fourth-act');
  if(invQuote)invQuote.innerHTML='“A coroa pertence a Ela.<br><em>O Véu jamais deve ser profanado.</em>”';
  if(invLine)invLine.textContent='Nenhum líder está acima da Ceifadora. A irmandade não abandona os seus.';
  if(invLink){
    invLink.textContent='Abra o Grimório da Ceifadora ↗';
    invLink.addEventListener('click',e=>{e.preventDefault();openBook();});
  }
  render();
  return {open:openBook,close:closeBook,pageCount:pages.length};
}

