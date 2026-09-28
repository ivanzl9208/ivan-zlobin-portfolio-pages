// Reuse the homepage contact-island transition after a two-second pause.
// Initial visibility is CSS-controlled; without JS, the noscript rule shows links.
const navigation = document.querySelector('.case-navigation');
let navigationTimer;
function scheduleNavigation() {
  clearTimeout(navigationTimer);
  if (!navigation || navigation.classList.contains('is-visible')) return;
  navigationTimer = setTimeout(() => navigation.classList.add('is-visible'), 2000);
}
scheduleNavigation();
window.addEventListener('pagehide', () => clearTimeout(navigationTimer));
window.addEventListener('pageshow', (event) => { if (event.persisted) scheduleNavigation(); });

// Navigation works independently of the optional graphics module.
const back = document.querySelector('.case-back');
back?.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  let fromHome = false;
  try {
    const referrer = new URL(document.referrer);
    fromHome = referrer.origin === location.origin && /^\/(?:index\.html)?$/.test(referrer.pathname);
  } catch { /* Direct visits use the ordinary homepage link. */ }
  if (fromHome && history.length > 1) {
    event.preventDefault();
    history.back();
  }
});

const orb = document.querySelector('.case-orb');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let dispose;
let generation = 0;
let active = true;
async function updateOrb() {
  const ticket = ++generation;
  dispose?.();
  dispose = undefined;
  if (!active || motion.matches || !orb) return;
  try {
    const { mountThinkingOrb } = await import('./orb-21.js');
    if (ticket !== generation || !active || motion.matches) return;
    dispose = mountThinkingOrb(orb);
  } catch { /* The static orb remains visible if loading or graphics fail. */ }
}
motion.addEventListener('change', updateOrb);
window.addEventListener('pagehide', () => { active = false; ++generation; dispose?.(); dispose = undefined; });
window.addEventListener('pageshow', (event) => { if (event.persisted) { active = true; updateOrb(); } });
updateOrb();
