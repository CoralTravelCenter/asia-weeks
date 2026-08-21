import {initTabs} from './blocks/initTabs.js';
import {initCountrySliders} from './blocks/initSlider.js';
import {initDecorAnimations} from './blocks/initDecorAnimations.js';

function initPartnerCards(root) {
  const controller = new AbortController();

  const expand = (card) => {
    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    card.querySelector('.partner-card__content--preview')?.setAttribute('aria-hidden', 'true');
    card.querySelector('.partner-card__content--details')?.setAttribute('aria-hidden', 'false');
  };

  root.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-partner-action]');
    if (action) {
      event.stopPropagation();
      const promoCode = action.dataset.promoCode;
      if (!promoCode) return;

      await navigator.clipboard.writeText(promoCode);
      const originalLabel = action.textContent;
      action.textContent = 'Промокод скопирован';
      window.setTimeout(() => { action.textContent = originalLabel; }, 2000);
      return;
    }

    const card = event.target.closest('[data-partner-card]');
    if (card && root.contains(card)) expand(card);
  }, {signal: controller.signal});

  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('[data-partner-action]')) return;
    const card = event.target.closest('[data-partner-card]');
    if (!card || !root.contains(card)) return;
    event.preventDefault();
    expand(card);
  }, {signal: controller.signal});

  return () => controller.abort();
}

let currentCleanup = null;

export default async function three_country() {
  currentCleanup?.();
  currentCleanup = null;

  const root = document.querySelector('[data-country-tabs]');
  if (!root) return;

  const sliders = initCountrySliders(root);
  const decorAnimations = initDecorAnimations(root);
  const cleanupPartnerCards = initPartnerCards(root);
  const cleanupCountryTabs = initTabs(root, {
    onActivate(panel) {
      requestAnimationFrame(() => {
        sliders.reInit(panel);
        decorAnimations.rebuild();
      });
    },
  });
  const cleanupHotelTabs = [...root.querySelectorAll('[data-hotel-tabs]')]
    .map((tabsRoot) => initTabs(tabsRoot));

  const cleanup = () => {
    cleanupCountryTabs();
    cleanupHotelTabs.forEach((destroy) => destroy());
    sliders.destroy();
    decorAnimations.destroy();
    cleanupPartnerCards();
    if (currentCleanup === cleanup) currentCleanup = null;
  };

  currentCleanup = cleanup;
  return cleanup;
}
