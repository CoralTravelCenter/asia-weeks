import gsap from 'gsap';
import {addScrollAnimation} from "./orchestrator/scroll-orchestrator.js";
import {hostReactAppReady} from "../utils/hostReactAppReady.js";


export default async function why_you_have_to() {
  await hostReactAppReady();

  const section = document.querySelector('.why-you-have-to');

  if (!section) return;

  const cardsList = section.querySelector('.why-travel__list');
  const cards = section.querySelectorAll('.why-travel__item');

  const dragon = section.querySelector('[data-parallax="dragon"]');
  const flower = section.querySelector('[data-parallax="flower"]');

  /**
   * Cards
   * Слева → в исходное положение.
   * В начальной точке полностью скрыты.
   */
  if (cards.length && cardsList) {
    const cardsAnimation = gsap.fromTo(
      cards,
      {
        x: -80,
        autoAlpha: 0,
      },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        paused: true,
      },
    );

    addScrollAnimation({
      trigger: cardsList,
      animation: cardsAnimation,
      start: 'top 80%',
      once: true,
    });
  }

  /**
   * Decorative parallax
   */
  if (dragon || flower) {
    const parallaxAnimation = gsap.timeline({
      paused: true,
    });

    if (dragon) {
      parallaxAnimation.fromTo(
        dragon,
        {
          yPercent: -5,
        },
        {
          yPercent: 5,
          ease: 'none',
        },
        0,
      );
    }

    if (flower) {
      parallaxAnimation.fromTo(
        flower,
        {
          yPercent: -5,
        },
        {
          yPercent: 5,
          ease: 'none',
        },
        0,
      );
    }

    addScrollAnimation({
      trigger: section,
      animation: parallaxAnimation,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    });
  }
}
