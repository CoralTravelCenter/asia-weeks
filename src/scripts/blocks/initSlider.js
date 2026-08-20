import EmblaCarousel from 'embla-carousel';

export function initResortsSlider() {
    const sliders = document.querySelectorAll('[data-resorts-slider]');

    sliders.forEach((slider) => {
        const viewport = slider.querySelector('.country-resorts__viewport');
        const slides = slider.querySelectorAll('.country-resorts__slide');
        const dotsContainer = slider.querySelector('.country-resorts__dots');

        if (!viewport || !slides.length || !dotsContainer) return;

        const embla = EmblaCarousel(viewport, {
            loop: false,
            align: 'start',
        });

        dotsContainer.innerHTML = '';

        const dots = [...slides].map((_, index) => {
            const dot = document.createElement('button');

            dot.type = 'button';
            dot.className = 'country-resorts__dot';
            dot.setAttribute(
                'aria-label',
                `Перейти к слайду ${index + 1}`,
            );

            dot.addEventListener('click', () => {
                embla.scrollTo(index);
            });

            dotsContainer.appendChild(dot);

            return dot;
        });

        const updateDots = () => {
            const selectedIndex = embla.selectedScrollSnap();

            dots.forEach((dot, index) => {
                dot.classList.toggle(
                    'is-active',
                    index === selectedIndex,
                );
            });
        };

        updateDots();

        embla.on('select', updateDots);
    });
}

export function initPlacesSlider() {
    const sliders = document.querySelectorAll('[data-places-slider]');

    sliders.forEach((slider) => {
        const viewport = slider.querySelector('.country-places__viewport');
        const slides = slider.querySelectorAll('.country-places__slide');
        const dotsContainer = slider.querySelector('.country-places__dots');

        if (!viewport || !slides.length || !dotsContainer) return;

        const embla = EmblaCarousel(viewport, {
            loop: false,
            align: 'start',
        });

        dotsContainer.innerHTML = '';

        const dots = [...slides].map((_, index) => {
            const dot = document.createElement('button');

            dot.type = 'button';
            dot.className = 'country-places__dot';
            dot.setAttribute(
                'aria-label',
                `Перейти к слайду ${index + 1}`,
            );

            dot.addEventListener('click', () => {
                embla.scrollTo(index);
            });

            dotsContainer.appendChild(dot);

            return dot;
        });

        const updateDots = () => {
            const selectedIndex = embla.selectedScrollSnap();

            dots.forEach((dot, index) => {
                dot.classList.toggle(
                    'is-active',
                    index === selectedIndex,
                );
            });
        };

        updateDots();

        embla.on('select', updateDots);
    });
}
