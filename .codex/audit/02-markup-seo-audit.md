# Pug / Semantic / SEO Audit

## Executive summary

Аудит охватил `src/order.json`, `src/markup/*.pug`, `src/markup/blocks/*.pug`, `pug.rc` и связанные selector/state contracts в JavaScript/SCSS. Проект поставляет фрагменты страницы в Coral host, поэтому document-level metadata и наличие host `<main>` нельзя подтвердить из репозитория.

Основа в целом content-first: один видимый `h1`, native lists, native buttons, реальные anchors для CTA, labeled navigation и пустые `alt` у декоративных native images. Главные проблемы одновременно функциональны и семантичны: все page-nav fragments ведут к отсутствующим IDs; большинство CTA разрешаются в `#`; country selector не реализует доступный tabs contract; China/Vietnam публикуют placeholder/empty content и отсутствующие assets; hotel-category controls не имеют поведения; carousel markup не передаёт отношения и current state.

## Critical findings

CRITICAL findings не обнаружены. Ниже перечислены HIGH и остальные findings.

### Broken page-navigation fragments

- **Severity:** HIGH
- **File:** `src/markup/navigation.pug`
- **Location:** lines 4–23; targets отсутствуют в `src/markup/**/*.pug`
- **Problem:** Links используют `#new-year-eve`, `#hotels`, `#holidays`, `#destinations`, но таких IDs нет; labels относятся к старой New Year campaign. Design handoff показывает пять items, markup — четыре.
- **Impact:** Native navigation и enhanced scrolling не работают; страдают keyboard/screen-reader/no-JS users, crawlability и content integrity.
- **Recommendation:** Заменить labels на утверждённые Asian Weeks sections и добавить стабильные IDs реальным sections/headings. Сохранить usable anchors без JS и подтвердить пятый item.

### Primary CTA links degrade to `#`

- **Severity:** HIGH
- **File:** `src/markup/three-country.pug`, `src/markup/blocks/country-cuisine.pug`, `country-massage.pug`, `country-places.pug`, `pug.rc`
- **Location:** `three-country.pug` 44–52; cuisine 25–31; massage 25–31; places 23–29; `pug.rc` 41–62, 277–278, 311–312, 339–340
- **Problem:** Templates используют `link || "#"`; partner records не содержат link, Thailand CTAs явно содержат `"#"`.
- **Impact:** Основные conversion actions ничего не делают, могут прокручивать страницу вверх и создают бессмысленные crawlable URLs.
- **Recommendation:** Требовать валидный URL до рендера anchor. Если action недоступен — не рендерить control/показывать disabled explanation; для application action использовать button с определённым JS contract.

### Country selector is not an accessible tabs interface

- **Severity:** HIGH
- **File:** `src/markup/three-country.pug`
- **Location:** lines 15–24, 54–59
- **Problem:** `aria-selected` задан обычным buttons внутри `nav`, но отсутствуют `tablist`, `tab`, `tabpanel`, IDs, `aria-controls`, `aria-labelledby`; inactive panels не имеют `hidden`. Switcher ошибочно создаёт navigation landmark.
- **Impact:** Assistive technology не получает tab relationships и корректный selected panel; до CSS доступны все panels.
- **Recommendation:** Реализовать WAI-ARIA tabs contract или выбрать более простой disclosure pattern. Для tabs нужны roles, stable IDs, roving tabindex и native hidden state.

### Tabs lack keyboard navigation and synchronized state

- **Severity:** HIGH
- **File:** `src/scripts/blocks/initTabs.js`, `src/markup/three-country.pug`
- **Location:** JS 5–22; Pug 19–24, 56–59
- **Problem:** Реализован только click; отсутствуют arrows, Home/End, focus, roving tabindex и `hidden` synchronization.
- **Impact:** Keyboard interaction не соответствует tabs pattern; все buttons остаются в tab order, visibility зависит только от CSS classes.
- **Recommendation:** Атомарно обновлять `aria-selected`, `tabindex`, class и panel `hidden`; добавить полный keyboard contract и scoped queries.

### China and Vietnam publish placeholder/empty content

- **Severity:** HIGH
- **File:** `pug.rc`
- **Location:** China 67–149; Vietnam 152–213; panels rendered by `three-country.pug` 55–67
- **Problem:** Literal `...`, empty descriptions/temperatures/images/lists/arrays публикуются в полноценных panels.
- **Impact:** Пользователь получает пустые sections; placeholder может индексироваться, ухудшая topical quality и accessibility tree.
- **Recommendation:** Не публиковать destination до прохождения schema validation; завершить данные либо условно исключить tab/sections.

### Missing and inconsistent country assets

- **Severity:** HIGH
- **File:** `pug.rc`
- **Location:** lines 71, 156; cuisine schema at 117/267
- **Problem:** `/images/china/decor.webp` и `/images/vietnam/decor.webp` отсутствуют в `public/`; data содержит unused banners; China cuisine использует `image`, mixin читает `phone_image`.
- **Impact:** Broken imagery и silent data failures.
- **Recommendation:** Build-time asset validation, единая schema, удаление legacy fields и запрет активации incomplete destinations.

### Hotel-category controls are dead

- **Severity:** HIGH
- **File:** `src/markup/blocks/country-hotels.pug`
- **Location:** lines 9–18
- **Problem:** Пять buttons не имеют panels/listings, state semantics или JS handler для `data-hotel-tab`.
- **Impact:** Controls выглядят интерактивными, но ничего не делают и не сообщают purpose/state.
- **Recommendation:** Скрыть до готовности. Затем выбрать tabs либо filter buttons с `aria-pressed`, labeled results и status updates.

## HTML semantics

### Inconsistent section/article naming

- **Severity:** MEDIUM
- **File:** `src/markup/contacts.pug`, `three-country.pug`, `blocks/country-story.pug`, `country-visa.pug`
- **Location:** contacts 1–2; three-country 10–27; story 2–11; visa 2–30
- **Problem:** Contacts section не имеет repository-visible heading; partner heading является sibling второго `h2`; country panels добавляют много `section > h2`; presentation cards размечены `article` без независимой ценности.
- **Impact:** Landmark/heading navigation становится перегруженной, hierarchy overview/offers/country subsections неясна.
- **Recommendation:** Явно назвать major regions; вынести partner offers в отдельный section; связать panel с country tab/heading; использовать `article` только для independently meaningful content.

### Missing repository-owned main/skip link

- **Severity:** MEDIUM
- **File:** composition from `src/order.json` and top-level Pug fragments
- **Location:** `src/order.json` 3–9
- **Problem:** Fragments начинаются с section и не определяют `<main>`/skip link.
- **Impact:** Если host их не добавляет, отсутствует primary landmark и direct keyboard route.
- **Recommendation:** Проверить rendered host. Добавить один `<main id="main-content">` и visible-on-focus skip link только если host их не предоставляет.

## SEO

Положительно: descriptive Russian `h1`, substantial Thailand copy и текстовый, а не image-baked content. SEO readiness блокируют broken fragments, placeholder China/Vietnam, missing assets и no-op CTAs.

В rendered host отдельно проверить `lang="ru"`, unique title, campaign meta description, canonical/robots, Open Graph/Twitter metadata, ровно один `<main>`, custom-element image alternatives и отсутствие индексируемых placeholder/inactive duplicates.

## Accessibility

### Carousel structure lacks relationships

- **Severity:** MEDIUM
- **File:** `src/markup/blocks/country-resorts.pug`, `country-places.pug`
- **Location:** resorts 6–24; places 6–31
- **Problem:** Generic slides без labeled region/list semantics, position labels и связи controls/slides; dots полностью JS-generated.
- **Impact:** Screen reader не понимает carousel, item count/current item/control target.
- **Recommendation:** Labeled region/group, list semantics, stable slide IDs, position context, `aria-controls`, current state и намеренное управление off-screen focusability.

### Carousel dots expose no selected state

- **Severity:** MEDIUM
- **File:** `src/scripts/blocks/initSlider.js`
- **Location:** lines 20–47, 73–100
- **Problem:** Active dot выражен только `.is-active`.
- **Impact:** Screen-reader users не получают current state.
- **Recommendation:** Синхронизировать `aria-current` либо `aria-pressed`, связать dots/slides и visibility/current semantics.

### Custom image elements lack explicit alt contract

- **Severity:** MEDIUM
- **File:** `welcome.pug`, `country-cuisine.pug`, `country-massage.pug`, `country-resorts.pug`, `country-places.pug`
- **Location:** welcome 3–13; cuisine/massage 9–16; resorts/places 11–19
- **Problem:** `coral-image` получает source, но explicit alt/decorative contract не определён в repo.
- **Impact:** Доступность зависит от undocumented host component defaults.
- **Recommendation:** Определить contract и проверить rendered accessibility tree; явно передавать localized alt либо decorative state.

## Pug architecture

### Raw HTML insertion boundary

- **Severity:** MEDIUM
- **File:** `country-resorts.pug`, `country-places.pug`
- **Location:** resorts 22; places 21
- **Problem:** Copy выводится через unescaped `!=`; template не закрепляет trust boundary.
- **Impact:** При переходе на CMS/feed возникает HTML injection/XSS risk и возможность сломать semantics.
- **Recommendation:** Использовать escaped copy/structured emphasis; rich text — только через allowlist sanitizer и documented contract.

### Data schema has unused/inconsistent fields

- **Severity:** LOW
- **File:** `pug.rc`
- **Location:** banners 76–81, 161–166, 225–230; country decor/background; cuisine keys 117/267
- **Problem:** Unused fields и разные property names для сходного content.
- **Impact:** Непонятен authoritative schema, stale assets сохраняются, typos silently render nothing.
- **Recommendation:** Валидируемая schema per mixin; убрать abandoned fields; build должен падать с path-specific error.

## Maintainability

### Inline presentation styles

- **Severity:** LOW
- **File:** `welcome.pug`, `country-resorts.pug`, `country-places.pug`
- **Location:** welcome 14; resorts/places 14
- **Problem:** Font family и dimensions зашиты в `style` attributes.
- **Impact:** Усложняются responsive/token/theme/CSP changes; repeated strings drift.
- **Recommendation:** Перенести presentation в modifier classes и SCSS tokens.

### Hero editorial defects

- **Severity:** LOW
- **File:** `src/markup/welcome.pug`
- **Location:** lines 14–16
- **Problem:** `h1` содержит Unicode line-separator; geotag начинается `ГБич Дон`.
- **Impact:** Возможны проблемы copy/search/screen-reader и видимая опечатка.
- **Recommendation:** Подтвердить copy, использовать normal whitespace/CSS wrapping и исправить geotag.

## Good practices already present

- Один campaign-level `h1`.
- В основном логичная `h2 → h3 → h4` hierarchy.
- Repeated content размечен native `ul/li`.
- Selectors — native `button type="button"`.
- CTA используют anchors, что станет правильным после реальных URLs.
- Page navigation имеет localized `aria-label`.
- Decorative native images используют empty `alt`, некоторые также `aria-hidden`.
- Below-fold native images используют `loading="lazy"`.
- Decorative parallax elements исключены из accessibility tree.
- Country content server-rendered.
- Без JS carousel content остаётся в document.
- Pug mixins уже централизуют повторяемые country structures.

## Recommendations

1. Исправить navigation model и target IDs.
2. Добавить валидные CTA destinations, убрать `#` fallback.
3. Завершить/скрыть China и Vietnam, исправить assets/schema.
4. Реализовать полный tabs markup и keyboard/state contract.
5. Убрать либо завершить hotel category controls.
6. Добавить carousel relationships/current-state semantics.
7. Проверить host metadata, landmarks и `coral-image` accessibility.
8. Harden rich-text и добавить schema validation.

## Handoff for JavaScript

- `.page-nav__link` должен вести к реальным unique IDs; normal anchor behavior сохраняется, enhanced scrolling optional. Sticky offset не должен ломать navigation.
- Scope tabs к одному `.destinations-tabs`. Contract: `[role="tablist"]`, `[role="tab"]#…[aria-controls]`, `[role="tabpanel"]#…[aria-labelledby]`.
- При activation синхронизировать `.is-active`, `aria-selected`, roving `tabindex`, panel `hidden`; поддержать Left/Right/Home/End.
- Не инициализировать sliders в hidden panels до появления размеров либо вызывать Embla `reInit()` после открытия. Destroy/recreate при responsive grid/slider transition.
- Для `.country-resorts__dot`/`.country-places__dot` поддерживать `aria-current`/`aria-pressed`, `aria-controls`, stable slide IDs и off-screen focus behavior.
- `[data-hotel-tab]` сейчас не имеет implementation/target. Не добавлять superficial styling до определения panels либо filter-results model.
- `href="#"` — content defect, не JavaScript action; не перехватывать для имитации navigation.
