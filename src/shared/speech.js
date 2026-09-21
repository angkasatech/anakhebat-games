export function createSpeech(onStatus, { lang = 'id-ID', languageName = 'Indonesia' } = {}) {
  const synth = globalThis.speechSynthesis;
  const voice = () => {
    const voices = synth?.getVoices() || [];
    return voices.find(v => v.lang.toLowerCase().replace('_', '-') === lang.toLowerCase())
      || voices.find(v => v.lang.toLowerCase().split(/[-_]/)[0] === lang.split('-')[0]);
  };
  return {
    available: () => Boolean(synth && globalThis.SpeechSynthesisUtterance && voice()),
    stop: () => synth?.cancel(),
    say(text, { onEnd } = {}) {
      if (!synth || !globalThis.SpeechSynthesisUtterance || !voice()) { onStatus(`Suara Bahasa ${languageName} belum tersedia. Yuk, lihat gambar atau baca bersama.`); return false; }
      onStatus('');
      synth.cancel();
      const message = new SpeechSynthesisUtterance(text);
      message.voice = voice(); message.lang = message.voice.lang; message.rate = 0.85;
      message.onend = () => onEnd?.();
      message.onerror = e => { if (!['interrupted', 'canceled'].includes(e.error)) { onStatus('Suara belum bisa diputar. Gambar tetap bisa membantu.'); onEnd?.(); } };
      synth.speak(message);
      return true;
    }
  };
}
