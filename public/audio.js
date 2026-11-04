const TRACK = Object.freeze({
  title: 'Feral Angel Waltz',
  source: 'https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN2100010',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  audio: 'https://www.incompetech.com/music/royalty-free/mp3-royaltyfree/Feral%20Angel%20Waltz%20.mp3'
});
const VOLUME_KEY = 'skulls-sound-volume-v1';

export function normalizeVolume(value) {
  if (value === null || value === undefined || value === '') return .25;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : .25;
}

export function mountAudio() {
  if (typeof document === 'undefined' || document.querySelector('.sk-audio')) return () => {};

  const root = document.createElement('aside');
  root.className = 'sk-audio';
  root.setAttribute('aria-label', 'Trilha sonora dos Skulls');
  root.innerHTML = `
    <button class="sk-audio__toggle" type="button" aria-label="Ativar trilha sonora" aria-pressed="false">
      <span class="sk-audio__icon" aria-hidden="true">▶</span>
    </button>
    <div class="sk-audio__copy">
      <strong>${TRACK.title}</strong>
      <span><a href="${TRACK.source}" target="_blank" rel="noopener noreferrer">Kevin MacLeod</a> · <a href="${TRACK.license}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></span>
      <span data-audio-state hidden></span>
    </div>
    <div class="sk-audio__volume">
      <label for="sk-audio-volume">Volume da trilha</label>
      <input id="sk-audio-volume" type="range" min="0" max="100" step="1" aria-label="Volume da trilha">
    </div>
    <span class="sk-audio__announcement" role="status" aria-live="polite"></span>
  `;
  const player = document.createElement('audio');
  player.preload = 'none';
  player.loop = true;
  player.src = TRACK.audio;
  root.append(player);
  document.body.append(root);

  const toggle = root.querySelector('button');
  const icon = toggle.querySelector('span');
  const slider = root.querySelector('input');
  const subtitle = root.querySelector('[data-audio-state]');
  const announcement = root.querySelector('[role=status]');
  let volume = .25;
  try { volume = normalizeVolume(localStorage.getItem(VOLUME_KEY)); } catch {}
  slider.value = String(Math.round(volume * 100));
  player.volume = volume * .45;
  player.muted = volume === 0;

  let attempt = 0;
  let disposed = false;
  function update(active, message = '') {
    toggle.setAttribute('aria-pressed', String(active));
    toggle.setAttribute('aria-label', active ? 'Pausar trilha sonora' : 'Ativar trilha sonora');
    icon.textContent = active ? 'Ⅱ' : '▶';
    root.classList.toggle('is-playing', active);
    subtitle.textContent = message;
    subtitle.hidden = !message;
  }

  function pause(message = 'Trilha pausada.') {
    attempt++;
    player.pause();
    update(false);
    announcement.textContent = message;
  }

  function onNativePause() {
    if (player.paused && root.classList.contains('is-playing')) pause();
  }

  function onError() {
    pause('Não foi possível iniciar a trilha sonora. Tente novamente.');
    update(false, 'Tentar tocar novamente');
  }

  async function play() {
    if (disposed || document.hidden || !player.paused) return;
    if (player.error) player.load();
    const current = ++attempt;
    update(true, 'Carregando…');
    try {
      await player.play();
      if (current !== attempt) return;
      update(true);
      announcement.textContent = `Tocando ${TRACK.title}.`;
    } catch {
      if (current === attempt) onError();
    }
  }

  function onToggle() {
    if (player.paused) void play();
    else pause();
  }

  function onVolume() {
    volume = normalizeVolume(Number(slider.value) / 100);
    player.volume = volume * .45;
    player.muted = volume === 0;
    try { localStorage.setItem(VOLUME_KEY, String(volume)); } catch {}
  }

  function onVisibility() {
    if (document.hidden && !player.paused) pause('Trilha pausada ao sair da página.');
  }

  function onPageHide(event) {
    if (event.persisted) pause();
    else cleanup();
  }

  function cleanup() {
    disposed = true;
    pause();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onPageHide);
    player.removeEventListener('error', onError);
    player.removeEventListener('pause', onNativePause);
    player.removeAttribute('src');
    player.load();
    root.remove();
  }

  toggle.addEventListener('click', onToggle);
  slider.addEventListener('input', onVolume);
  player.addEventListener('error', onError);
  player.addEventListener('pause', onNativePause);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  return Object.assign(cleanup, {play, pause, isPlaying: () => !player.paused});
}
