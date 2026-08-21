const mountedTabs = new WeakMap();

export function initTabs(root, {onActivate} = {}) {
    if (!root) return () => {};
    mountedTabs.get(root)?.();

    const belongsToRoot = (element) => element.closest('[data-tabs]') === root;
    const tabs = [...root.querySelectorAll('[role="tab"][data-tab]')].filter(belongsToRoot);
    const panels = [...root.querySelectorAll('[role="tabpanel"][data-tab-panel]')].filter(belongsToRoot);
    if (!tabs.length || !panels.length) return () => {};

    const controller = new AbortController();

    const activate = (tab, {moveFocus = false, notify = true} = {}) => {
        const value = tab.dataset.tab;

        tabs.forEach((item) => {
            const isActive = item === tab;
            item.classList.toggle('is-active', isActive);
            item.setAttribute('aria-selected', String(isActive));
            item.tabIndex = isActive ? 0 : -1;
        });

        let activePanel = null;
        panels.forEach((panel) => {
            const isActive = panel.dataset.tabPanel === value;
            panel.classList.toggle('is-active', isActive);
            panel.hidden = !isActive;
            if (isActive) activePanel = panel;
        });

        if (moveFocus) tab.focus();
        if (notify && activePanel) onActivate?.(activePanel, value);
    };

    const onKeydown = (event) => {
        const currentIndex = tabs.indexOf(event.currentTarget);
        if (currentIndex < 0) return;

        let nextIndex;
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % tabs.length;
                break;
            case 'Home':
                nextIndex = 0;
                break;
            case 'End':
                nextIndex = tabs.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        activate(tabs[nextIndex], {moveFocus: true});
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => activate(tab), {signal: controller.signal});
        tab.addEventListener('keydown', onKeydown, {signal: controller.signal});
    });

    activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0], {notify: false});

    const cleanup = () => {
        controller.abort();
        if (mountedTabs.get(root) === cleanup) mountedTabs.delete(root);
    };

    mountedTabs.set(root, cleanup);
    return cleanup;
}
