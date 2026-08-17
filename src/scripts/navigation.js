import {hostReactAppReady} from "../utils/hostReactAppReady.js";

export default async function navigation() {
  await hostReactAppReady()
  const anchors = document.querySelector('.js-anchor');

  if (anchors) {
    const container = anchors.querySelector('.page-nav__container');
    const anchorsOffsetTop = anchors.getBoundingClientRect().top + window.scrollY;

    const placeholder = document.createElement('div');
    placeholder.className = 'page-nav__placeholder';
    placeholder.style.display = 'none';

    anchors.parentNode.insertBefore(placeholder, anchors);

    function hotelsNav() {
      const fixedNav = document.querySelector('.el-affix--fixed');
      return !!(fixedNav && fixedNav.querySelector('.controls'));
    }

    function setFixed(isFixed) {
      anchors.classList.toggle('page-nav--fixed', isFixed);
      container?.classList.toggle('layout-container-limit', isFixed);
      container?.classList.toggle('center', isFixed);
      placeholder.style.display = isFixed ? '' : 'none';

      if (isFixed) {
        placeholder.style.height = `${anchors.offsetHeight}px`;
      }
    }

    function onScroll() {
      const scrollY = window.scrollY;

      if (hotelsNav()) {
        setFixed(false);
        return;
      }

      if (scrollY >= anchorsOffsetTop) {
        if (!anchors.classList.contains('page-nav--fixed')) {
          setFixed(true);
        }
      } else {
        setFixed(false);
      }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', () => {
      if (anchors.classList.contains('page-nav--fixed')) {
        placeholder.style.height = `${anchors.offsetHeight}px`;
      }
    });
  }

  const anchorLinks = anchors?.querySelectorAll('.page-nav__link') ?? [];

  anchorLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (!hash || hash.length < 2) return;

      const target = document.querySelector(hash);
      if (!target) return;

      let offset = anchors.offsetHeight;

      if (anchors.classList.contains('page-nav--fixed')) {
        offset = anchors.offsetHeight;
      }

      const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;

      e.preventDefault();

      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
    });
  });
}
