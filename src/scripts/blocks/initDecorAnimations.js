import gsap from 'gsap';
import {addScrollAnimation} from '../orchestrator/scroll-orchestrator.js';

const isInsideHiddenPanel = (element) => Boolean(element.closest('[role="tabpanel"][hidden]'));

export function initDecorAnimations(root) {
  const desktopMedia = window.matchMedia('(min-width: 993px)');
  const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context = null;
  let triggers = [];
  let animations = [];

  const clearAnimations = () => {
    triggers.filter(Boolean).forEach((trigger) => trigger.kill());
    animations.forEach((animation) => animation.kill());
    context?.revert();
    triggers = [];
    animations = [];
    context = null;
  };

  const rebuild = () => {
    clearAnimations();

    const elements = gsap.utils.toArray('[data-gsap-decor]', root)
      .filter((element) => !isInsideHiddenPanel(element));

    if (!elements.length) return;

    const desktop = desktopMedia.matches;
    const reduceMotion = reducedMotionMedia.matches;

    context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(elements, {clearProps: 'transform,opacity,visibility'});
        return;
      }

      elements.forEach((element) => {
        const section = element.closest('[data-gsap-section]') || element.parentElement;
        if (!section) return;

        const type = element.dataset.gsapDecor;
        const direction = Number(element.dataset.gsapDirection || 1);
        let animation;
        let trigger;

        if (type === 'reveal') {
          animation = gsap.fromTo(element,
            {autoAlpha: 0, scale: desktop ? 0.96 : 0.98},
            {
              autoAlpha: 1,
              scale: 1,
              duration: desktop ? 0.7 : 0.5,
              delay: Number(element.dataset.gsapDelay || 0),
              ease: 'power2.out',
              paused: true,
            },
          );
          trigger = addScrollAnimation({
            trigger: section,
            animation,
            start: 'top 82%',
            once: true,
          });
        } else if (type === 'drift') {
          const distanceY = desktop ? 24 : 18;
          const distanceX = desktop ? 14 : 10;
          const side = element.dataset.gsapSide === 'left' ? -1 : 1;

          animation = gsap.fromTo(element,
            {x: distanceX * side, y: -distanceY, rotation: desktop ? side : 0},
            {
              x: -distanceX * 0.5 * side,
              y: distanceY,
              rotation: desktop ? -side : 0,
              ease: 'none',
              paused: true,
            },
          );
          trigger = addScrollAnimation({
            trigger: section,
            animation,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          });
        } else {
          const distance = Number(desktop
            ? element.dataset.gsapDistanceDesktop || 6
            : element.dataset.gsapDistanceMobile || 4);

          animation = gsap.fromTo(element,
            {yPercent: -distance * direction},
            {yPercent: distance * direction, ease: 'none', paused: true},
          );
          trigger = addScrollAnimation({
            trigger: section,
            animation,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          });
        }

        animations.push(animation);
        triggers.push(trigger);
      });
    }, root);
  };

  const onMediaChange = () => rebuild();
  desktopMedia.addEventListener('change', onMediaChange);
  reducedMotionMedia.addEventListener('change', onMediaChange);
  rebuild();

  const destroy = () => {
    desktopMedia.removeEventListener('change', onMediaChange);
    reducedMotionMedia.removeEventListener('change', onMediaChange);
    clearAnimations();
  };

  return {rebuild, destroy};
}
