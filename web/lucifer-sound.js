// Short, synthesized arcade effects. The context starts inside a player gesture.
export function createLuciferSounds() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let context, output, buffers, enabled = true, disposed = false;
  const voices = new Set();

  function makeBuffer(explosion) {
    const duration = explosion ? .44 : .14;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    let register = 1, noise = 0, phase = 0;
    const noiseStep = Math.max(1, Math.round(context.sampleRate / 7000));
    for (let i = 0; i < data.length; i++) {
      const progress = i / data.length;
      if (i % noiseStep === 0) {
        register = (register >>> 1) | (((register ^ (register >>> 1)) & 1) << 14);
        noise = (register & 1) ? 1 : -1;
      }
      const step = Math.floor(progress * 14) / 14;
      const frequency = explosion ? 38 + 155 * (1 - step) ** 2 : 190 + 640 * (1 - step);
      phase += frequency / context.sampleRate;
      const square = phase % 1 < .5 ? 1 : -1;
      const mix = explosion ? noise * .7 + square * .3 : noise * .2 + square * .8;
      const attack = Math.min(1, i / (context.sampleRate * .003));
      const envelope = attack * (1 - progress) ** (explosion ? 2.2 : 1.7);
      // Quantized amplitude and stepped pitch give both effects an 8-bit character.
      data[i] = Math.round(mix * envelope * 32) / 32;
    }
    return buffer;
  }

  function unlock() {
    if (!AudioContext || !enabled || disposed) return;
    try {
      if (!context) {
        context = new AudioContext();
        output = context.createGain();
        output.gain.value = .15;
        output.connect(context.destination);
        buffers = { launch: makeBuffer(false), explosion: makeBuffer(true) };
      }
      if (context.state === 'suspended') void context.resume().catch(() => {});
    } catch {
      // Audio failure must never interrupt a throw, explosion or score update.
    }
  }

  function play(name) {
    if (!enabled || disposed || document.hidden || context?.state !== 'running' || voices.size >= 4) return;
    try {
      const source = context.createBufferSource();
      source.buffer = buffers[name];
      source.connect(output);
      voices.add(source);
      source.onended = () => {
        voices.delete(source);
        source.disconnect();
      };
      source.start();
    } catch {}
  }

  function stop() {
    for (const source of voices) {
      try { source.stop(); } catch {}
      source.disconnect();
    }
    voices.clear();
  }

  function setEnabled(value) {
    enabled = value;
    if (enabled) unlock();
    else stop();
  }

  function onVisibility() {
    if (document.hidden) {
      stop();
      void context?.suspend().catch(() => {});
    } else if (context && enabled) unlock();
  }

  function dispose() {
    disposed = true;
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
    void context?.close().catch(() => {});
    buffers = null;
  }

  document.addEventListener('visibilitychange', onVisibility);
  return {
    supported: Boolean(AudioContext),
    unlock,
    launch() { unlock(); play('launch'); },
    explode() { play('explosion'); },
    setEnabled,
    stop,
    dispose
  };
}
