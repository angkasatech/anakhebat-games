const key = 'anakhebat-games:settings:v1';
export function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem(key)) || {}; return { level: 'beginner', sound: s.sound === true }; }
  catch { return { level: 'beginner', sound: false }; }
}
export function saveSettings(settings) { try { localStorage.setItem(key, JSON.stringify({ sound: settings.sound })); } catch { /* Playing still works without storage. */ } }
