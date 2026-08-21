# Frontend Refactor Log

## Finding 1 — Page navigation and fixed state

- **Status:** COMPLETE.
- **Files changed:** `src/markup/navigation.pug`, `src/markup/why-you-have-to.pug`, `src/markup/three-country.pug`, `src/markup/contacts.pug`, `src/scripts/navigation.js`, `src/styles/navigation.scss`.
- **What was changed:** Replaced broken fragments with `#why-asia`, `#destinations`, `#partner-offers`, and `#contacts`; added those unique IDs; added initial fixed-state synchronization, live geometry recalculation, host-affix guard, deep-link offset correction, delegated link handling, and disposer-owned listeners/placeholder/observer.
- **Why:** Previous links had no targets and sticky geometry was captured once without initial synchronization or cleanup.
- **Validation:** `npm run check` PASS; `npm run build` PASS; generated `@CMS` markup contains every target and matching href; `git diff --check` PASS.
- **Remaining risk:** Host-owned affix geometry requires integrated host QA; standalone dev browser testing was unavailable because port 5173 was already occupied and this runner ignored a requested alternate port.

## Finding 2 — Country tabs accessibility

- **Status:** COMPLETE.
- **Files changed:** `src/markup/three-country.pug`, `src/scripts/blocks/initTabs.js`, `src/styles/three-country.scss`.
- **What was changed:** Added a scoped component root, `tablist`/`tab`/`tabpanel`, stable ID relationships, `aria-selected`, native `hidden`, roving tabindex, Arrow keys, Home/End, focus movement, idempotent ownership and cleanup.
- **Why:** The old controls only supported click and CSS classes and switched every matching tab in the document.
- **Validation:** Production Pug output contains three complete tab/panel relationships, exactly one initially selected/focusable/visible panel; `npm run check` PASS; `npm run build` PASS.
- **Remaining risk:** Full screen-reader/browser matrix remains host-integration QA.

## Finding 3 — Responsive Embla lifecycle

- **Status:** COMPLETE.
- **Files changed:** `src/scripts/blocks/initSlider.js`, `src/scripts/three-country.js`, `src/markup/blocks/country-resorts.pug`, `src/markup/blocks/country-places.pug`, `src/styles/blocks/_resorts.scss`, `src/styles/blocks/_places.scss`.
- **What was changed:** Consolidated duplicated slider implementations into one scoped controller; mobile creates Embla, desktop destroys it, mobile return creates it again, and activated country panels initialize/reInit their sliders. Instances are retained and destroyed on remount. Dots come from scroll snaps and expose `aria-current`/`aria-controls`; desktop fallback uses grids.
- **Why:** Embla previously initialized unconditionally, including hidden panels and desktop layouts, and instances could not be coordinated or cleaned up.
- **Validation:** Bundling PASS in `npm run build`; breakpoint and hidden-panel branches inspected in built output; generated slides have stable IDs/group labels.
- **Remaining risk:** Resize-direction behavior needs integrated visual QA on real Coral custom elements, especially iOS Safari.

## Finding 4 — Reduced motion

- **Status:** COMPLETE.
- **Files changed:** `src/scripts/navigation.js`, `src/scripts/why-you-have-to.js`.
- **What was changed:** Programmatic anchor scrolling uses `auto` under reduced motion; GSAP entrance/parallax animations are skipped and final visible transforms are applied.
- **Why:** CSS motion rules cannot override explicit JavaScript scroll behavior or GSAP transforms.
- **Validation:** Both preference branches compile and bundle; `npm run build` PASS.
- **Remaining risk:** OS-level preference toggle during an already mounted session is applied on the next component mount, not dynamically to an animation already in progress.

## Finding 5 — Scoped/idempotent initialization and cleanup

- **Status:** COMPLETE for approved interactive components.
- **Files changed:** `src/scripts/navigation.js`, `src/scripts/three-country.js`, `src/scripts/blocks/initTabs.js`, `src/scripts/blocks/initSlider.js`, `src/scripts/why-you-have-to.js`, `src/utils/hostReactAppReady.js`.
- **What was changed:** Added mount ownership, proactive disposal before remount, scoped descendant queries, AbortController listeners, ResizeObserver disposal, Embla destroy, GSAP animation/ScrollTrigger kill/context revert, and finite/cancellable host readiness support.
- **Why:** Repeated host mounts previously duplicated listeners, placeholders, Embla observers and ScrollTriggers; readiness polling could run forever.
- **Validation:** `npm run check` PASS; `npm run build` PASS; source inspection confirms named ownership/disposal for each allocated resource.
- **Remaining risk:** The host entrypoint contract does not itself call returned disposers, so proactive cleanup on repeat invocation remains the safety mechanism.

## Finding 6 — Hotel tabs contract

- **Status:** COMPLETE (contract prepared; cards intentionally not implemented).
- **Files changed:** `src/markup/blocks/country-hotels.pug`, `src/styles/blocks/_hotels.scss`.
- **What was changed:** Preserved `data.tabs` in `pug.rc` as the future category contract, but stopped rendering interactive controls until corresponding panels/cards exist; removed now-unreachable interactive styling.
- **Why:** Buttons without results or panels were dead controls.
- **Validation:** No `[data-hotel-tab]` exists in generated `@CMS/three-country.html`; `npm run build` PASS.
- **Remaining risk:** Future hotel cards must add a full tab/panel or filter/results contract together with runtime behavior.

## Finding 7 — China and Vietnam copy

- **Status:** BLOCKED; no content or image fields changed.
- **Files changed:** none (`pug.rc` intentionally unchanged).
- **What was changed:** Nothing was guessed. Figma `get_design_context` was called on the explicitly supplied China node `2057:2248`; it returned only sparse frame `2057:2249`, and drilling into that frame returned no descendants/text. Read-only browser inspection of the same node exposed the canvas but not text layers. Vietnam remains **BLOCKED BY INCOMPLETE INPUT** because its supplied URL has no `node-id`.
- **Why:** The user required Figma-sourced text only and explicitly prohibited guessing/reusing other nodes; image paths/assets are out of scope.
- **Validation:** `git diff -- pug.rc` is empty.
- **Remaining risk:** China and Vietnam placeholders remain until accessible node-specific text input is available. Vietnam requires a complete node URL; China requires a smaller text-bearing node URL or restored Figma layer access.

## Finding 8 — Duplicates and stale fields

- **Status:** COMPLETE only where directly related; broad schema cleanup deferred.
- **Files changed:** `src/scripts/blocks/initSlider.js`, `src/styles/blocks/_hotels.scss`.
- **What was changed:** Removed duplicated slider implementations and obsolete hotel-control CSS after functional replacement.
- **Why:** These duplicates/stale rules were confirmed and directly tied to approved fixes; unrelated `pug.rc` cleanup was not safely justified.
- **Validation:** `rg` confirms old slider exports and hotel control selectors are no longer referenced; check/build PASS.
- **Remaining risk:** Other inconsistent legacy data fields remain intentionally untouched.

## Final validation

- `npm run check` — PASS.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- Generated markup check for fragment targets, tab roles/relationships and absence of hotel dead controls — PASS.
- Integrated browser interaction/responsive visual QA — NOT RUN: port 5173 was occupied and the project dev wrapper did not honor `--port 5174`.

## Independent-review remediation — HIGH findings

### No-op tour CTAs

- **Status:** REMEDIATED.
- **Files changed:** `src/markup/blocks/country-cuisine.pug`, `src/markup/blocks/country-places.pug`, `src/markup/blocks/country-massage.pug`, `pug.rc`.
- **What was changed:** Removed all `"#"` URL fallbacks. CTA anchors/button groups now render only when their supplied string URL is non-empty after trimming and is not `#`. Removed the three confirmed stale `"link": "#"` fields from Thailand data; no destination was invented.
- **Validation:** `jq empty pug.rc` PASS; generated `@CMS/three-country.html` contains no `href="#"`; `npm run check` PASS; `npm run build` PASS; `git diff --check` PASS.
- **Remaining risk:** CTA controls remain intentionally absent until meaningful destination URLs are supplied.

### Incomplete China/Vietnam destinations

- **Status:** REMEDIATED FOR PUBLICATION.
- **Files changed:** `pug.rc`, `src/markup/three-country.pug`.
- **What was changed:** Added explicit `published: false` flags only to China and Vietnam and filtered both the tablist and panels through the same minimal rule. Thailand is now the first/only published country and is server-rendered selected, focusable and visible. Placeholder data remains preserved for future completion.
- **Validation:** Generated markup contains no China/Vietnam country tab or panel; it contains exactly one Thailand tab with `aria-selected="true"`/`tabindex="0"` and one visible Thailand tabpanel; `npm run check` PASS; `npm run build` PASS; `git diff --check` PASS.
- **Remaining risk:** China/Vietnam require authoritative copy and image completion before their publication flags can be enabled.

### Remediation validation

- `jq empty pug.rc` — PASS.
- `npm run check` — PASS.
- `npm run build` — PASS.
- Generated markup assertion: zero `href="#"` — PASS.
- Generated markup assertion: zero China/Vietnam country tabs and panels — PASS.
- Generated markup assertion: Thailand is the selected, focusable, visible country — PASS.
- `git diff --check` — PASS.
