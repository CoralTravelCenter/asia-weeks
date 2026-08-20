export function initTabs() {
    const tabs = document.querySelectorAll('[data-country-tab]');
    const panels = document.querySelectorAll('[data-country-panel]');

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const country = tab.dataset.countryTab;

            tabs.forEach((item) => {
                const isActive = item === tab;

                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-selected', String(isActive));
            });

            panels.forEach((panel) => {
                panel.classList.toggle(
                    'is-active',
                    panel.dataset.countryPanel === country,
                );
            });
        });
    });
}