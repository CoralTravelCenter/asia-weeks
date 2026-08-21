import {hostReactAppReady} from '../utils/hostReactAppReady.js';

let currentCleanup = null;
let mountToken = 0;

export default async function navigation() {
  const token = ++mountToken;
  currentCleanup?.();
  currentCleanup = null;

  await hostReactAppReady();
  if (token !== mountToken) return () => {};

  const anchors = document.querySelector('.js-anchor');
  if (!anchors) return () => {};

  const controller = new AbortController();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const placeholder = document.createElement('div');
  let isFixed = false;

  placeholder.className = 'page-nav__placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  anchors.before(placeholder);

  const hasHostHotelsNav = () =>
    Boolean(document.querySelector('.el-affix--fixed .controls'));

  const setFixed = (nextFixed) => {
    if (isFixed === nextFixed) {
      if (isFixed) placeholder.style.height = `${anchors.offsetHeight}px`;
      return;
    }

    isFixed = nextFixed;
    anchors.classList.toggle('page-nav--fixed', isFixed);
    placeholder.style.height = isFixed ? `${anchors.offsetHeight}px` : '0px';
  };

  const sync = () => {
    const threshold = placeholder.getBoundingClientRect().top + window.scrollY;
    setFixed(!hasHostHotelsNav() && window.scrollY >= threshold);
  };

  const fixedTop = () => {
    const value = Number.parseFloat(getComputedStyle(anchors).top);
    return Number.isFinite(value) ? value : 0;
  };

  const targetForHash = (hash) => {
    if (!hash?.startsWith('#') || hash.length < 2) return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  };

  const scrollToTarget = (target, enhanceMotion = true) => {
    const offset = anchors.offsetHeight + fixedTop();
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({
      top,
      behavior: enhanceMotion && !reducedMotion.matches ? 'smooth' : 'auto',
    });
  };

  const onClick = (event) => {
    const link = event.target.closest('.page-nav__link');
    if (!link || !anchors.contains(link)) return;

    const target = targetForHash(link.hash);
    if (!target) return;

    event.preventDefault();
    history.pushState(null, '', link.hash);
    scrollToTarget(target);
  };

  const onLayoutChange = () => {
    if (isFixed) placeholder.style.height = `${anchors.offsetHeight}px`;
    sync();
  };

  anchors.addEventListener('click', onClick, {signal: controller.signal});
  window.addEventListener('scroll', sync, {passive: true, signal: controller.signal});
  window.addEventListener('resize', onLayoutChange, {passive: true, signal: controller.signal});
  window.addEventListener('orientationchange', onLayoutChange, {passive: true, signal: controller.signal});
  window.addEventListener('load', onLayoutChange, {once: true, signal: controller.signal});

  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver(onLayoutChange);
  resizeObserver?.observe(anchors);

  sync();

  const initialTarget = targetForHash(window.location.hash);
  if (initialTarget) requestAnimationFrame(() => scrollToTarget(initialTarget, false));

  const cleanup = () => {
    controller.abort();
    resizeObserver?.disconnect();
    setFixed(false);
    placeholder.remove();
    if (currentCleanup === cleanup) currentCleanup = null;
  };

  currentCleanup = cleanup;
  return cleanup;
}
