const base = new URL(document.documentElement.dataset.appRoot || './', location.href).pathname;
export const hubUrl = `${base}member/games/`;
export const gameUrl = id => `${hubUrl}${id}/`;
export function currentGame() {
  const path = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  return path.startsWith(hubUrl) ? path.slice(hubUrl.length) : '';
}
