import EmblaCarousel from 'embla-carousel';

const MOBILE_QUERY = '(max-width: 1023px)';
const mountedGroups = new WeakMap();

const sliderConfigs = [
    {root: '[data-resorts-slider]', viewport: '.country-resorts__viewport', slide: '.country-resorts__slide', dots: '.country-resorts__dots', dotClass: 'country-resorts__dot'},
    {root: '[data-places-slider]', viewport: '.country-places__viewport', slide: '.country-places__slide', dots: '.country-places__dots', dotClass: 'country-places__dot'},
];

function createSliderController(slider, config, mediaQuery) {
    const viewport = slider.querySelector(config.viewport);
    const slides = [...slider.querySelectorAll(config.slide)];
    const dotsContainer = slider.querySelector(config.dots);
    if (!viewport || !slides.length || !dotsContainer) return null;

    const listenerController = new AbortController();
    let embla = null;
    let dots = [];

    const clearDots = () => {
        dotsContainer.replaceChildren();
        dots = [];
    };

    const updateDots = () => {
        if (!embla) return;
        const selectedIndex = embla.selectedScrollSnap();
        dots.forEach((dot, index) => {
            const isCurrent = index === selectedIndex;
            dot.classList.toggle('is-active', isCurrent);
            dot.setAttribute('aria-current', isCurrent ? 'true' : 'false');
        });
    };

    const buildDots = () => {
        clearDots();
        if (!embla) return;

        dots = embla.scrollSnapList().map((_, index) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = config.dotClass;
            dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            if (slides[index]?.id) dot.setAttribute('aria-controls', slides[index].id);
            dot.addEventListener('click', () => embla?.scrollTo(index), {signal: listenerController.signal});
            dotsContainer.appendChild(dot);
            return dot;
        });
        updateDots();
    };

    const init = () => {
        if (embla || !mediaQuery.matches || slider.closest('[hidden]')) return;
        embla = EmblaCarousel(viewport, {loop: false, align: 'start'});
        embla.on('select', updateDots);
        embla.on('reInit', buildDots);
        buildDots();
    };

    const destroyEmbla = () => {
        embla?.destroy();
        embla = null;
        clearDots();
    };

    const sync = () => mediaQuery.matches ? init() : destroyEmbla();
    const reInit = () => {
        if (!mediaQuery.matches) return;
        if (!embla) init();
        else embla.reInit();
    };

    mediaQuery.addEventListener('change', sync, {signal: listenerController.signal});
    sync();

    return {
        element: slider,
        reInit,
        destroy() {
            listenerController.abort();
            destroyEmbla();
        },
    };
}

export function initCountrySliders(root) {
    if (!root) return {reInit: () => {}, destroy: () => {}};
    mountedGroups.get(root)?.destroy();

    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const controllers = sliderConfigs.flatMap((config) =>
        [...root.querySelectorAll(config.root)]
            .map((slider) => createSliderController(slider, config, mediaQuery))
            .filter(Boolean),
    );

    const group = {
        reInit(panel) {
            controllers.forEach((controller) => {
                if (!panel || panel.contains(controller.element)) controller.reInit();
            });
        },
        destroy() {
            controllers.forEach((controller) => controller.destroy());
            if (mountedGroups.get(root) === group) mountedGroups.delete(root);
        },
    };

    mountedGroups.set(root, group);
    return group;
}
