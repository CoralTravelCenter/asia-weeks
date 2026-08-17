import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function addScrollAnimation({
                                     trigger,
                                     animation,
                                     start = 'top 80%',
                                     end,
                                     scrub = false,
                                     once = false,
                                   }) {
  if (!trigger || !animation) return;

  return ScrollTrigger.create({
    trigger,
    animation,
    start,
    end,
    scrub,
    once,
  });
}
