# Frontend Audit

## Executive summary

Проект имеет понятную блочную основу: Pug mixins, разделённые SCSS entrypoints/tokens и небольшой набор ES-module initializers. Визуальная система Figma последовательна на крайних desktop/mobile состояниях, а server-rendered content и native controls дают хорошую базу для SEO и progressive enhancement.

К релизу проект пока не готов. Наиболее значимые риски находятся на стыках слоёв: navigation markup не совпадает с реальными sections; CTA содержат no-op URLs; визуальные tabs не имеют полного semantic/keyboard contract; China/Vietnam публикуют incomplete content; hotel controls не имеют runtime behavior; mobile-only Embla запускается и на desktop. CRITICAL findings нет, но несколько независимых HIGH-проблем одновременно затрагивают conversion, accessibility, SEO и responsive correctness.

Исходный код во время аудита не изменялся. Аудит выполнен по текущему working tree, включая уже существовавшие пользовательские Pug/SCSS changes.

## Scores

| Area | Score |
|---|---:|
| Design consistency | 8/10 |
| Responsive implementation | 5/10 |
| HTML semantics | 6/10 |
| SEO | 5/10 |
| Accessibility | 4/10 |
| JavaScript quality | 5/10 |
| Performance | 6/10 |
| Maintainability | 6/10 |

Оценки отражают текущую реализацию, а не качество Figma-макета. Document-shell metadata и rendered behavior внешних `coral-*` components требуют отдельной проверки в host.

## Top issues

1. **HIGH:** page navigation ссылается только на отсутствующие IDs и содержит устаревшие campaign labels.
2. **HIGH:** основные CTA рендерятся как anchors с `href="#"`, поэтому conversion flow фактически не работает.
3. **HIGH:** country selector не реализует доступный tabs markup, keyboard behavior и native panel state.
4. **HIGH:** China и Vietnam содержат placeholder/empty data и ссылки на отсутствующие assets, но доступны пользователю.
5. **HIGH:** hotel category buttons не имеют panels/results/runtime handler.
6. **HIGH:** Resorts/places Embla создаётся на всех viewport widths, хотя desktop design требует rows/grid.
7. **MEDIUM:** sticky navigation использует stale geometry, не синхронизируется при initial load и неверно учитывает fixed top offset.
8. **MEDIUM:** carousels не сообщают current slide/control relationships assistive technology.
9. **MEDIUM:** GSAP и programmatic smooth scroll игнорируют `prefers-reduced-motion`.
10. **MEDIUM:** component initializers/readiness/Embla/GSAP не имеют общего cleanup, cancellation и remount contract.

## P0 — Critical

Подтверждённых CRITICAL findings нет.

## P1 — High priority

### P1.1 Restore valid page navigation

- **Files:** `src/markup/navigation.pug`, target sections, `src/scripts/navigation.js`
- Заменить stale labels/URLs, добавить unique section IDs и сохранить native fragment behavior без JavaScript.
- После исправления проверить deep links, keyboard activation, reload with hash и sticky offset.

### P1.2 Restore valid conversion destinations

- **Files:** `src/markup/three-country.pug`, cuisine/massage/places mixins, `pug.rc`
- Удалить `"#"` fallback. Anchor должен существовать только при валидном URL; application actions должны быть buttons с явным contract.
- Добавить validation required CTA fields.

### P1.3 Complete the country-tabs contract

- **Files:** `src/markup/three-country.pug`, `src/scripts/blocks/initTabs.js`
- Добавить tablist/tab/tabpanel relationships, stable IDs, `aria-controls`, `aria-labelledby`, `hidden`, roving tabindex, arrows/Home/End и component scoping.
- После activation координировать carousel `reInit()`/mount.

### P1.4 Remove incomplete destinations from published UI

- **Files:** `pug.rc`, `public/images`, conditional Pug rendering
- Завершить China/Vietnam copy/assets/schema либо не рендерить их controls и empty sections.
- Build-time проверять required copy, collections, asset paths и consistent keys.

### P1.5 Remove or implement hotel controls

- **Files:** `src/markup/blocks/country-hotels.pug`, future runtime/data layer
- До готовности убрать buttons. Для реализации выбрать tabs с panels либо filters с pressed state/results/status region.

### P1.6 Implement responsive carousel lifecycle

- **Files:** `src/scripts/blocks/initSlider.js`, `src/scripts/three-country.js`, related SCSS
- Mobile carousel: create and expose controls. Desktop rows/grid: destroy Embla and remove generated state. Recreate/reInit on reverse transition.
- Не дублировать mobile/desktop content DOM.

## P2 — Improvements

### P2.1 Stabilize sticky navigation

- Initial sync; geometry recalculation after resize/orientation/late layout; accurate fixed-bottom offset or CSS `scroll-margin-top`; optional IntersectionObserver sentinel.

### P2.2 Make carousels accessible

- Labeled region/list semantics, stable slide IDs, controls with `aria-controls`, current state, position context and intentional off-screen focus behavior. Build dots from Embla scroll snaps.

### P2.3 Add lifecycle ownership

- Standardize `mount(root, context) -> cleanup`; scope selectors; retain Embla instances; teardown window listeners, GSAP contexts and ScrollTriggers; make initialization idempotent.

### P2.4 Respect user motion preferences

- Disable GSAP entrance/parallax and use final visible state for reduced motion; programmatic scroll uses `auto`.

### P2.5 Make host readiness finite

- Replace unbounded polling with host signal or max-wait fallback; add AbortSignal and timer cleanup.

### P2.6 Verify host-owned semantics and metadata

- In rendered Coral host verify `lang="ru"`, title, description, canonical/robots, social metadata, one `<main>`, skip link and `coral-image` alt/decorative contract.

### P2.7 Harden content rendering

- Replace raw `!=` with escaped/structured content where possible; otherwise sanitize rich text through a documented allowlist.

### P2.8 Validate intermediate responsive states

- Figma supplies only 428 and 1920 px. Explicitly QA 768, 1024 and 1280 px, both resize directions, long Russian labels, card intrinsic heights and decorative overflow.

## P3 — Nice to have

- Consolidate duplicate slider implementations after lifecycle/accessibility behavior is correct.
- Move inline typography/image dimensions from Pug to modifier classes and SCSS tokens.
- Normalize unused/inconsistent `pug.rc` fields and remove legacy data.
- Consolidate near-duplicate primary colors only after verifying design intent.
- Define semantic radius tokens by component purpose rather than exporting every Figma number.
- Retain/remove empty block-script scaffolding according to actual build conventions.

## Design findings

- **MEASURED:** mobile frame `428 px`, content width `396 px`, gutter `16 px`; desktop frame `1920 px` with inferred content container near `1370 px`.
- **MEASURED:** coherent spacing scale `4/8/12/16/20/24/32/40/48/64` and Manrope body `16/24`, weights `400/600`.
- **MEASURED:** strong reusable patterns: hero, floating section navigation, feature cards, country tabs, editorial media panels, season cards, resort/place cards and hotel listing shell.
- **MEASURED:** layout changes structurally: hero crop, benefits `3×2 → list`, weather `4×1 → 2×2`, grids/rows → mobile carousels.
- **INFERRED:** tablet state is unspecified; exact desktop container/display heading values are not available from exposed Figma metadata.
- **RECOMMENDED:** preserve one semantic content order, use responsive presentation rather than duplicated markup, confirm desktop measurements before adding inferred tokens, and test intermediate widths.

## Pug / Semantic / SEO findings

- Good foundation: one `h1`, native list/button/anchor elements, mostly logical heading progression, server-rendered content and decorative image handling.
- Broken fragments and no-op CTAs are release-blocking HIGH content/semantics defects.
- Tabs and hotel controls expose incomplete interaction semantics.
- Placeholder country data harms user trust, indexable content quality and accessibility structure.
- Carousel markup and custom-image alternative contracts need explicit accessible relationships.
- The host owns document metadata/landmarks, so repository-only review cannot declare them valid.
- Pug mixins are a useful reuse layer, but `pug.rc` needs a validated, consistent content schema.

## JavaScript findings

- Source is small and readable; no immediate runtime crash was found for normal one-shot mount.
- Highest-risk defect is unconditional Embla initialization across responsive modes.
- Tabs state is incomplete and document-global; hotel buttons have no runtime path.
- Navigation geometry becomes stale after layout changes and initially restored scroll state.
- Async readiness, window listeners, Embla and GSAP do not expose cancellation/cleanup.
- Reduced-motion is not honored by GSAP or explicit smooth scrolling.
- Existing guards, native controls, event-driven Embla selection, server fallback and modular imports are good practices.

## Cross-layer findings

### Figma → CSS / JavaScript

- Figma requires grid/alternating rows on desktop and carousel on mobile, but JS always enables Embla. This is a confirmed design-to-runtime mismatch.
- Only endpoint screens exist; current implementation needs explicit intermediate-state decisions rather than guessing one breakpoint.
- Decorative assets and fixed card dimensions create horizontal overflow/text-scaling risk; implementation should use bounded decoration and intrinsic heights.

### HTML → JavaScript

- Navigation JS correctly refuses missing targets, exposing that markup anchors are the root defect rather than hiding it.
- Markup advertises country-tab state with `aria-selected`, while JS updates only classes/selection and leaves native visibility/focus unsynchronized.
- Hotel markup creates interactive controls with no execution path.

### Accessibility → JavaScript

- Carousel dots are native buttons, but JS expresses selection only visually.
- Reduced-motion CSS cannot override explicit GSAP transforms or `window.scrollTo({behavior:'smooth'})`; JS branch is required.
- Any tabs semantic fix must be implemented together with keyboard/focus/state code, not as markup-only ARIA.

### Responsive → JavaScript

- Embla needs create/destroy/reInit lifecycle; tabs should notify sliders after hidden panel activation.
- Sticky threshold and offset must be recalculated on orientation/resize/late image/font layout.

### SEO → interactive content

- Country content is server-rendered, which is positive, but incomplete inactive panels and placeholder text remain source-visible.
- CTA `#` and broken page anchors are crawlable but semantically empty.
- Hiding incomplete countries must remove unavailable controls/content coherently rather than merely visually concealing them.

## Existing strengths

- Strong, recognizable visual system and coherent extreme-breakpoint designs.
- SCSS is organized by settings/tokens/tools/objects/base/blocks and page entrypoints, which is an appropriate layout-oriented structure.
- Pug separates top-level fragments and reusable country block mixins.
- JavaScript is split by block/behavior and uses ES modules.
- Essential content remains server-rendered without JavaScript.
- Native buttons/lists/anchors are used more often than generic clickable containers.
- Defensive element guards reduce failures when optional host fragments are absent.
- The dependency set is small and appropriate to the implemented interactions.

## Recommended refactoring order

1. Freeze approved content/navigation/CTA requirements; decide whether incomplete countries and hotel filters ship.
2. Add data/asset/URL validation and remove incomplete/no-op UI.
3. Fix semantic Pug contracts and real section IDs before changing behavior.
4. Implement component-scoped accessible tabs together with keyboard/native state.
5. Replace unconditional sliders with a retained responsive carousel controller and accessible controls.
6. Correct sticky navigation initial/reflow geometry and reduced-motion behavior.
7. Introduce finite host readiness and component cleanup/idempotency without broad architectural rewrite.
8. Validate existing `check` and `build` scripts, then perform focused host/browser QA at endpoint/intermediate widths and iOS Safari.
9. Only after functional fixes, consolidate duplicate slider logic, inline presentation and stale schema fields.

## Final assessment

Вёрстка имеет хорошую визуальную и модульную базу, но текущая реализация содержит несколько HIGH gaps между дизайном, markup semantics и runtime lifecycle. Риск сосредоточен не в объёме или сложности кода, а в незавершённых content contracts и адаптивных интеракциях.

Рекомендуемый статус: **audit complete; refactoring required before production release**. Начинать изменения следует только после human checkpoint, подтверждения content destinations/URLs и отдельной команды на Phase 2.
