# Frontend Refactor Plan

## Scope and constraints

- Phase 2 is explicitly approved by the user.
- Existing dirty changes in `src/markup/three-country.pug` and SCSS predate this pass and must be preserved.
- Figma changes are content-only in `pug.rc`; image fields and assets are out of scope.
- China source is node `2057:2248` in file `yOOPy1aHlRz8juFw7SalxN`.
- Vietnam content is **BLOCKED BY INCOMPLETE INPUT**: the supplied URL has no `node-id`; no node will be guessed or substituted.

## Finding 1 — Broken page navigation and unstable fixed state

- **Finding:** Navigation links target nonexistent campaign IDs; fixed state is not synchronized on mount; its threshold/offset can become stale; listeners and placeholder have no cleanup.
- **Severity:** HIGH (broken navigation), MEDIUM (geometry/lifecycle).
- **Verification:** CONFIRMED in `src/markup/navigation.pug` and `src/scripts/navigation.js`; no matching target IDs exist in current markup and geometry is captured only once.
- **Files:** `src/markup/navigation.pug`, page section Pug files, `src/scripts/navigation.js`, `src/styles/navigation.scss`.
- **Planned change:** Map links to real sections, add stable IDs, preserve native fragments, mount an idempotent scoped controller, synchronize initial state, recalculate geometry after layout changes, account for the fixed top edge, respect reduced motion, and expose cleanup.
- **Risk:** Host-owned fixed controls and late layout shifts may alter the effective top offset.
- **Validation:** Pug compilation via real project checks/build; focused DOM review for unique IDs/valid fragments; browser checks for initial load, hash/deep link, resize and keyboard activation if local host is available.

## Finding 2 — Incomplete country tabs contract

- **Finding:** Country controls lack `tablist`/`tab`/`tabpanel` relationships, native hidden state, roving tabindex and keyboard navigation; selectors are document-global.
- **Severity:** HIGH.
- **Verification:** CONFIRMED in `src/markup/three-country.pug` and `src/scripts/blocks/initTabs.js`.
- **Files:** `src/markup/three-country.pug`, `src/scripts/blocks/initTabs.js`, `src/scripts/three-country.js`, related SCSS if native `hidden` requires support.
- **Planned change:** Add stable IDs and ARIA relationships, `hidden`, roving tabindex, Arrow/Home/End behavior, root-scoped activation, idempotent mount/cleanup, and an activation callback for sliders.
- **Risk:** Hidden panels change initial layout and must remain compatible with server-rendered fallback.
- **Validation:** Markup compilation; focused DOM/unit-style check of state transitions and keyboard behavior; build/check.

## Finding 3 — Embla runs outside mobile and has no lifecycle

- **Finding:** Resorts/places Embla instances are created on every viewport, discarded, and not coordinated with hidden country panels.
- **Severity:** HIGH.
- **Verification:** CONFIRMED in `src/scripts/blocks/initSlider.js` and `src/scripts/three-country.js`.
- **Files:** `src/scripts/blocks/initSlider.js`, `src/scripts/three-country.js`, resorts/places markup and SCSS where needed.
- **Planned change:** Consolidate duplicated controllers only as needed for the fix; initialize on mobile, destroy on desktop, recreate when returning to mobile, rebuild accessible dots from scroll snaps, `reInit` on country activation, scope all selectors, and return cleanup.
- **Risk:** Breakpoint must match the existing CSS desktop switch; Embla must only measure visible panels.
- **Validation:** Focused lifecycle harness for mobile → desktop → mobile and panel activation; check/build; browser resize test if local host is available.

## Finding 4 — Motion preferences are ignored

- **Finding:** GSAP/ScrollTrigger animations and enhanced anchor scrolling ignore `prefers-reduced-motion`.
- **Severity:** MEDIUM.
- **Verification:** CONFIRMED in `src/scripts/why-you-have-to.js` and `src/scripts/navigation.js`.
- **Files:** `src/scripts/why-you-have-to.js`, `src/scripts/orchestrator/scroll-orchestrator.js`, `src/scripts/navigation.js`.
- **Planned change:** Skip entrance/parallax motion and render final visible state under reduced motion; use `auto` for programmatic scroll; retain/kill triggers and animations during cleanup.
- **Risk:** Cleanup must not leave hidden/transformed inline styles.
- **Validation:** Focused code/harness branches for reduce/no-preference; check/build.

## Finding 5 — Global, non-idempotent component initialization

- **Finding:** Navigation, tabs, sliders and GSAP initializers use global selectors and duplicate listeners/instances on remount.
- **Severity:** MEDIUM.
- **Verification:** CONFIRMED across current entrypoints.
- **Files:** affected scripts plus `src/utils/hostReactAppReady.js` where cancellation ownership is required.
- **Planned change:** Use component roots, WeakMap/marker ownership or returned disposers, named/abortable listeners, retained Embla instances and GSAP contexts/triggers; keep changes local to approved components.
- **Risk:** Entry-point host may ignore returned cleanup, so repeated invocation must proactively dispose the prior mount.
- **Validation:** Invoke initializers twice in a focused DOM harness and verify one active owner; check/build.

## Finding 6 — Hotel controls advertise unavailable behavior

- **Finding:** Hotel category buttons render without panels/results or a runtime handler.
- **Severity:** HIGH.
- **Verification:** CONFIRMED in `src/markup/blocks/country-hotels.pug`; no matching handler exists.
- **Files:** `src/markup/blocks/country-hotels.pug`, `pug.rc`, related hotel SCSS only if obsolete interactive styling becomes unreachable.
- **Planned change:** Preserve a future data contract but do not render interactive tabs until actual hotel panel/card content exists. No hotel cards will be implemented.
- **Risk:** Removing dead controls slightly changes unfinished section presentation but avoids false affordance.
- **Validation:** Markup/data inspection confirms no `[data-hotel-tab]` without a corresponding panel; check/build.

## Finding 7 — China/Vietnam content completeness

- **Finding:** `pug.rc` contains placeholder copy for China and Vietnam.
- **Severity:** HIGH for published content completeness.
- **Verification:** PARTIALLY CONFIRMED: placeholders exist for both; only China has a valid explicitly supplied Figma node. Vietnam is **BLOCKED BY INCOMPLETE INPUT**.
- **Files:** `pug.rc` only.
- **Planned change:** Extract and apply only textual content from China node `2057:2248`; do not alter any image path/asset. Leave Vietnam unchanged and record the blocker.
- **Risk:** Large Figma node context may require smaller explicitly identified descendant nodes, but descendants will only be derived from the supplied China node metadata.
- **Validation:** JSON parse; before/after assertion that all image-like fields remain unchanged; check/build.

## Finding 8 — Duplicate/stale implementation fields

- **Finding:** Slider implementations are duplicated and data contains legacy/inconsistent fields.
- **Severity:** LOW.
- **Verification:** PARTIALLY CONFIRMED; duplicate JS is directly involved in the lifecycle fix, while broad schema cleanup is not justified before functionality is stable.
- **Files:** `src/scripts/blocks/initSlider.js`; `pug.rc` only for fields proven unused and directly related.
- **Planned change:** Consolidate slider logic as part of Finding 3. Defer unrelated content/schema cleanup; remove only confirmed, safe stale fields after functional validation.
- **Risk:** Broad cleanup could erase user-prepared content or future contracts.
- **Validation:** Import/build checks and targeted searches for any removed field.

## Validation commands

- `npm run check`
- `npm run build`
- Focused syntax/markup/lifecycle checks using existing project dependencies only.
- Browser verification when the local host can render the affected flows.
