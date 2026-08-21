import gsap from 'gsap';
import {addScrollAnimation} from './orchestrator/scroll-orchestrator.js';
import {initDecorAnimations} from './blocks/initDecorAnimations.js';

let currentCleanup = null;

export default async function why_you_have_to() {
  currentCleanup?.();
  currentCleanup = null;

  const section = document.querySelector('[data-gsap-section="why-you-have-to"]');
  if (!section) return () => {};

  const cardsList = section.querySelector('.why-travel__list');
  const cards = section.querySelectorAll('.why-travel__item');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const triggers = [];
  const animations = [];
  const decorAnimations = initDecorAnimations(section);

  const context = gsap.context(() => {
    if (reduceMotion) {
      if (cards.length) gsap.set(cards, {x: 0, autoAlpha: 1});
      return;
    }

    if (cards.length && cardsList) {
      const cardsAnimation = gsap.fromTo(
        cards,
        {x: -80, autoAlpha: 0},
        {x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', paused: true},
      );
      animations.push(cardsAnimation);
      triggers.push(addScrollAnimation({
        trigger: cardsList,
        animation: cardsAnimation,
        start: 'top 80%',
        once: true,
      }));
    }

  }, section);

  const cleanup = () => {
    triggers.filter(Boolean).forEach((trigger) => trigger.kill());
    animations.forEach((animation) => animation.kill());
    decorAnimations.destroy();
    context.revert();
    if (currentCleanup === cleanup) currentCleanup = null;
  };

  currentCleanup = cleanup;
  return cleanup;
}
