# JavaScript Audit

## Executive summary

Проверены реальные entrypoints из `src/order.json`: `welcome.js`, `navigation.js`, `why-you-have-to.js`, `three-country.js`, `contacts.js`, а также `initTabs.js`, `initSlider.js`, `scroll-orchestrator.js`, `hostReactAppReady.js`.

CRITICAL не обнаружены. Основные проблемы: HIGH — Embla создаётся на всех ширинах без desktop destroy lifecycle; country tabs поддерживают только click и не синхронизируют native/ARIA/keyboard state; hotel controls не имеют implementation. MEDIUM — sticky geometry устаревает и не синхронизируется при старте; fixed offset рассчитан неверно для mobile/tablet; readiness polling бесконечен; GSAP/smooth scroll игнорируют reduced motion; listeners, triggers и carousel instances не имеют cleanup/idempotency contract.

Собственных Mutation/Intersection/ResizeObserver нет. Embla 8 имеет internal observers, поэтому hidden panels не объявлены гарантированно сломанными, но явная responsive/tab lifecycle координация отсутствует.

## Bugs / correctness

### Country tabs do not implement the advertised interaction model

- **Classification:** REAL BUG
- **Severity:** HIGH
- **File:** `src/scripts/blocks/initTabs.js`
- **Function:** `initTabs`
- **Location:** lines 1–23
- **Cause:** Только click; нет `tabindex`, `hidden`, focus, ARIA relationships, arrows/Home/End; selectors глобальны.
- **Impact:** Keyboard tabs pattern не работает, state только CSS-based; несколько instances будут переключать друг друга.
- **Recommendation:** Scope по component root; атомарно обновлять class, `aria-selected`, roving tabindex, panel hidden и focus; добавить keyboard contract.

### Fixed navigation lacks initial synchronization

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`
- **Function:** `navigation`, `onScroll`
- **Location:** lines 33–55
- **Cause:** `onScroll()` регистрируется, но не вызывается после mount.
- **Impact:** Reload/scroll restoration/deep link оставляет nav unfixed до первого scroll event.
- **Recommendation:** После listeners вызвать идемпотентную synchronization function.

### Sticky threshold becomes stale

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`
- **Function:** `navigation`, `onScroll`
- **Location:** lines 8–9, 41–55
- **Cause:** `anchorsOffsetTop` вычислен один раз; resize меняет только placeholder height.
- **Impact:** После fonts/images/reflow/orientation nav фиксируется слишком рано/поздно.
- **Recommendation:** Recalculate geometry после resize/orientation/load; устойчивый вариант — sentinel + IntersectionObserver с fallback.

### Enhanced scroll uses incomplete offset

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`, `src/styles/navigation.scss`
- **Function:** anchor click handler
- **Location:** JS 60–81; SCSS fixed top 18–26, 57–67
- **Cause:** Вычитается только nav height, хотя fixed nav имеет `top:57px` mobile, `41px` tablet и `0` desktop.
- **Impact:** Target оказывается под navigation/с неверным offset.
- **Recommendation:** Использовать фактический `getBoundingClientRect().bottom` либо CSS `scroll-margin-top`/custom property; тестировать `<768`, `768–992`, `>=993`.

### Hotel controls are dead

- **Classification:** REAL BUG
- **Severity:** HIGH
- **File:** `src/markup/blocks/country-hotels.pug`; runtime scripts
- **Function:** absent
- **Location:** markup 9–18; matching handler отсутствует
- **Cause:** `[data-hotel-tab]` не читается ни одним entrypoint.
- **Impact:** Buttons выглядят активными, но не меняют результат/state.
- **Recommendation:** Не рендерить до готовности; затем реализовать tabs либо filters с explicit results model.

## DOM lifecycle

### Readiness polling has no terminal state

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `src/utils/hostReactAppReady.js`
- **Function:** `hostReactAppReady`
- **Location:** lines 1–17
- **Cause:** `timeout` — polling interval; recursion бесконечна при отсутствии/нулевой высоте host root; нет abort/max wait.
- **Impact:** `three_country()`/`why_you_have_to()` не завершаются, timer переживает removal.
- **Recommendation:** Реальный max wait, `AbortSignal`, осмысленный fallback; лучше host readiness signal.

### Initializers are not idempotent

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** navigation, tabs, slider, why-you-have-to scripts
- **Function:** all initializers
- **Location:** full initialization paths
- **Cause:** Нет marker/registry/disposer; повторный mount дублирует listeners/placeholders/Embla/GSAP.
- **Impact:** Host remount/HMR/client navigation создают duplicated behavior и leaks.
- **Recommendation:** One-shot guard либо единый `mount(root) -> cleanup` contract.

### Hidden panels rely on library recovery

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `three-country.js`, `initSlider.js`, `initTabs.js`
- **Function:** related initializers
- **Location:** three-country 5–9; slider constructors; tab activation
- **Cause:** Sliders создаются, включая `display:none` panels; tabs не уведомляют instances.
- **Impact:** Embla может восстановиться через observer, но correctness зависит от timing/layout/custom elements; первый frame может иметь stale snaps.
- **Recommendation:** Инициализировать после появления размеров либо хранить instances и `reInit()` после activation; тестировать Safari/iOS.

## Events

### Window listeners have no ownership/removal

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`
- **Function:** `navigation`
- **Location:** lines 50–55
- **Cause:** Anonymous resize и unreturned scroll handlers.
- **Impact:** Remount оставляет listeners на detached DOM.
- **Recommendation:** Named handlers + AbortController либо cleanup function.

### Per-element tab/dot listeners

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** LOW
- **File:** `initTabs.js`, `initSlider.js`
- **Function:** initializers
- **Location:** tabs 5–22; sliders 20–37, 73–90
- **Cause:** Per-control listeners без teardown.
- **Impact:** При малом числе controls performance несущественен; риск только при remount.
- **Recommendation:** Сначала cleanup; delegation — необязательная implementation choice.

## Observers

Собственных observers нет. Sticky state проверяется на каждом scroll по сохранённому offset.

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** LOW
- **File:** `src/scripts/navigation.js`
- **Function:** `onScroll`
- **Location:** lines 33–50
- **Cause:** Continuous checks и manual geometry.
- **Impact:** Чувствительность к layout shifts.
- **Recommendation:** Рассмотреть IntersectionObserver sentinel как correctness/lifecycle simplification.

## Performance

### Scroll handler repeats lookup/writes

- **Classification:** PERFORMANCE ISSUE
- **Severity:** LOW
- **File:** `src/scripts/navigation.js`
- **Function:** `hotelsNav`, `setFixed`, `onScroll`
- **Location:** lines 17–47
- **Cause:** Document-wide query каждый scroll; repeated class/style writes без state transition.
- **Impact:** Умеренная лишняя работа на low-end mobile.
- **Recommendation:** Cache relevant state, skip unchanged writes; rAF throttling только после измерения.

### Carousel instances remain active on desktop

- **Classification:** PERFORMANCE ISSUE / REAL BUG
- **Severity:** HIGH
- **File:** `src/scripts/blocks/initSlider.js`, `src/scripts/three-country.js`
- **Function:** slider initializers, `three_country`
- **Location:** full initialization paths
- **Cause:** Нет `matchMedia`/container condition или `destroy()`.
- **Impact:** Desktop получает carousel machinery/layout вместо alternating rows/grid и лишние observers/events.
- **Recommendation:** Controller создаёт Embla только в carousel mode, уничтожает на desktop и восстанавливает при возврате без duplicated DOM.

## Memory / cleanup

### Embla instances are discarded

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `src/scripts/blocks/initSlider.js`
- **Function:** `initResortsSlider`, `initPlacesSlider`
- **Location:** 13–53, 66–106
- **Cause:** Local instance не возвращается/не сохраняется.
- **Impact:** Нельзя вызвать destroy/reInit или coordinated teardown; repeat init сохраняет старые instances.
- **Recommendation:** Возвращать controller с `reInit()`/`destroy()` либо registry/WeakMap.

### GSAP/ScrollTriggers are never reverted

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `why-you-have-to.js`, `orchestrator/scroll-orchestrator.js`
- **Function:** `why_you_have_to`, `addScrollAnimation`
- **Location:** animations 24–91; triggers 6–23
- **Cause:** Instances не сохраняются для kill/revert.
- **Impact:** Remount оставляет triggers и inline styles.
- **Recommendation:** `gsap.context()` + disposer/context.revert(); kill standalone triggers.

### Polling timer cannot be cancelled

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `src/utils/hostReactAppReady.js`
- **Function:** `hostReactAppReady`
- **Location:** 5–16
- **Cause:** Timer ID/cancellation interface отсутствуют.
- **Impact:** Pending promise/closure переживает teardown.
- **Recommendation:** AbortSignal, clear timeout, predictable completion result.

## GSAP / ScrollTrigger

### Reduced motion ignored

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/why-you-have-to.js`
- **Function:** `why_you_have_to`
- **Location:** 24–46, 52–91
- **Cause:** Нет reduced-motion branch/`gsap.matchMedia()`; CSS duration overrides не отменяют JS transforms/scrub.
- **Impact:** Reduced-motion users получают entrance motion и parallax.
- **Recommendation:** Сразу final visible state и без parallax при reduce; использовать `gsap.matchMedia()` с cleanup.

### Entrance animation may reverse visible state

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** LOW
- **File:** `src/scripts/why-you-have-to.js`
- **Function:** `why_you_have_to`
- **Location:** 6–39
- **Cause:** После readiness `fromTo` переводит уже server-visible cards в hidden start state.
- **Impact:** Возможен flash → disappearance → animation на slow device.
- **Recommendation:** Проверить throttled filmstrip; при подтверждении JS-ready enhancement class с no-JS fallback либо отказаться от hiding.

### ScrollTrigger wrapper

- **Classification:** STYLE PREFERENCE
- **Severity:** INFO
- **File:** `src/scripts/orchestrator/scroll-orchestrator.js`
- **Function:** `addScrollAnimation`
- **Location:** 6–23
- **Cause:** Тонкая обёртка над API.
- **Impact:** Вреда нет; пока не владеет lifecycle/reduced-motion policy.
- **Recommendation:** Оставлять, если станет lifecycle boundary; иначе direct API может быть яснее.

## Embla

### Responsive activation missing

- **Classification:** REAL BUG
- **Severity:** HIGH
- **File:** `src/scripts/blocks/initSlider.js`
- **Function:** both slider initializers
- **Location:** 3–53, 56–106
- **Cause:** Unconditional Embla; нет media/container query/destroy.
- **Impact:** Resorts/places не переходят в desktop rows/grid; dots генерируются везде.
- **Recommendation:** Lifecycle controller: mobile create/show controls; desktop destroy/remove generated state и CSS grid/rows.

### Dot state is visual only

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/blocks/initSlider.js`
- **Function:** both `updateDots`
- **Location:** 39–48, 92–101
- **Cause:** Только `.is-active`.
- **Impact:** Assistive technology не получает current slide/relationships.
- **Recommendation:** Stable slide IDs, `aria-controls`, `aria-current`/`aria-pressed`, position context и off-screen focus policy.

### Dot count uses slides, not scroll snaps

- **Classification:** REAL BUG
- **Severity:** LOW
- **File:** `src/scripts/blocks/initSlider.js`
- **Function:** dot builders
- **Location:** 20–37, 73–90
- **Cause:** Dot per slide вместо `scrollSnapList()`.
- **Impact:** Mapping ломается при multi-slide layouts/slidesToScroll.
- **Recommendation:** Строить из snaps и обновлять после `reInit`.

### Slider implementations duplicated

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** LOW
- **File:** `src/scripts/blocks/initSlider.js`
- **Function:** both initializers
- **Location:** full file
- **Cause:** Отличаются только selectors/classes.
- **Impact:** Lifecycle/accessibility fixes приходится дублировать.
- **Recommendation:** Один configurable carousel controller.

## Responsive behaviour

### No breakpoint lifecycle

- **Classification:** REAL BUG
- **Severity:** HIGH
- **File:** `three-country.js`, `initSlider.js`
- **Function:** `three_country`, slider initializers
- **Location:** three-country 5–9; slider file
- **Cause:** Design меняет carousel/non-carousel composition, JS state отсутствует.
- **Impact:** Desktop diverges from design; resize не переключает behavior.
- **Recommendation:** Tested mobile/intermediate/desktop states; prefer container width where embed differs from viewport; share JS/CSS breakpoint source.

### Resize updates only placeholder height

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`
- **Function:** resize listener
- **Location:** 51–55
- **Cause:** Не пересчитывает threshold/offset и не resync fixed state.
- **Impact:** Orientation/reflow оставляют stale behavior.
- **Recommendation:** Debounced/rAF geometry recalculation и state update.

### Intermediate-width behavior undefined

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** behavior architecture
- **Function:** responsive controllers absent
- **Location:** carousel/navigation initialization
- **Cause:** Figma даёт 428/1920, scripts не определяют intermediate behavior.
- **Impact:** `768–1280` получает случайный mode.
- **Recommendation:** Проверить 768/1024/1280 и оба направления resize.

## Browser compatibility

### Smooth scroll ignores reduced motion

- **Classification:** REAL BUG
- **Severity:** MEDIUM
- **File:** `src/scripts/navigation.js`
- **Function:** anchor click handler
- **Location:** 76–81
- **Cause:** `behavior:'smooth'` unconditional; CSS не переопределяет explicit JS option.
- **Impact:** Reduced-motion users получают animation.
- **Recommendation:** `behavior:'auto'` при matching media query.

Touch CSS (`pan-y pinch-zoom`) выглядит корректно; прямой touch bug не доказан. Проверить current iOS Safari: drag vs page scroll, hidden panel activation, orientation и breakpoint transitions. Unsupported syntax/очевидных Safari exceptions не найдено.

## Architecture

### No common component lifecycle contract

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** `src/scripts/*.js`, `src/scripts/blocks/*.js`
- **Function:** all entrypoints
- **Location:** exports/init
- **Cause:** Inconsistent returns/readiness/cleanup.
- **Impact:** Host assumptions implicit; remount/testing/responsive control сложны.
- **Recommendation:** `mount(root, context) -> cleanup`, scoped queries и deterministic abort/teardown.

### Document-global selectors couple components

- **Classification:** ARCHITECTURAL IMPROVEMENT
- **Severity:** MEDIUM
- **File:** tabs, slider, navigation scripts
- **Function:** initializers
- **Location:** initial queries
- **Cause:** `document` вместо owned root.
- **Impact:** Multiple embeds/previews/tests конфликтуют.
- **Recommendation:** Передавать roots; host-global queries изолировать adapter.

### Empty block scripts

- **Classification:** STYLE PREFERENCE
- **Severity:** INFO
- **File:** `contacts.js`, `country-story.js`
- **Function:** default exports
- **Location:** complete files
- **Cause:** Только query/return.
- **Impact:** Negligible; возможно build convention scaffolding.
- **Recommendation:** Оставить, если требует tooling; иначе удалить при подтверждении.

## Good practices already present

- Guards optional top-level elements.
- Anchor enhancement не перехватывает missing targets/CTA `#`.
- Slider init проверяет viewport/slides/dots container.
- Embla `loop:false` подходит finite editorial collections.
- Dots — native labeled buttons.
- Selection updates event-driven.
- GSAP modules и plugin registration explicit.
- Scroll animation construction централизовано.
- Decorative parallax non-interactive; CSS `pointer-events:none`.
- Touch CSS сохраняет vertical pan/pinch zoom.
- Content остаётся server-rendered без JS.
- `preventDefault()` только после найденного target.
- Optional chaining защищает отсутствие nav.

## Recommended improvements

1. Responsive Embla controller: create/destroy/reInit/cleanup.
2. Accessible component-scoped country tabs.
3. Initial/reflow synchronization sticky navigation и корректный offset.
4. Reduced-motion GSAP и scroll branch.
5. Finite cancellable host readiness.
6. Единый `mount(root) -> cleanup` lifecycle.
7. Accessible dots из scroll snaps.
8. Hide/remove hotel controls до results model.
9. Host QA: reload-with-scroll, deep link, late fonts/images, 768/1024/1280, orientation, iOS Safari, reduced motion.
10. Integration tests для tabs, breakpoint crossing, repeated mount/unmount, sticky recalculation.

## JS summary

| Severity | Count | Main areas |
|---|---:|---|
| CRITICAL | 0 | — |
| HIGH | 3 | responsive Embla lifecycle, incomplete country tabs, dead hotel controls |
| MEDIUM | 13 | sticky geometry, lifecycle/cleanup, readiness polling, reduced motion, slider semantics |
| LOW | 6 | scroll work, snap-derived dots, duplication, refinements |
| INFO | 3 | wrapper, touch baseline, scaffolding |

Authored JavaScript небольшой и понятный, без очевидных immediate runtime crashes в normal one-shot mount. Главный долг — lifecycle boundaries: responsive create/destroy, host readiness, remount cleanup, accessible state synchronization и motion preferences.
