# Design Audit

## Screens inspected

1. [Mobile node `2433:5250`](https://www.figma.com/design/yOOPy1aHlRz8juFw7SalxN/%D0%90%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D0%B8?node-id=2433-5250&m=dev)
   - **MEASURED:** frame `428 × 13 020 px`.
   - **MEASURED:** основной контент преимущественно расположен в контейнере шириной `396 px` с внешними полями `16 px`.
   - **MEASURED:** анализ выполнен по структуре node, Figma variables и полному render.
2. [Desktop node `2057:2808`](https://www.figma.com/design/yOOPy1aHlRz8juFw7SalxN/%D0%90%D0%B7%D0%B8%D0%B0%D1%82%D1%81%D0%BA%D0%B8%D0%B5-%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D0%B8?node-id=2057-2808&m=dev)
   - **MEASURED:** frame `1920 × 9 830 px`.
   - **MEASURED:** анализ выполнен по полному render и Figma variables.
   - Внутренние desktop layers находятся внутри плоского `Screen` frame и не раскрываются metadata API, поэтому значения ширины desktop-контейнера, колонок и отдельных отступов ниже обозначены как **INFERRED**, а не как точные измерения.

Оба node интерпретированы как mobile- и desktop-варианты одной страницы.

## Layout system

### Global layout

- **MEASURED:** mobile canvas — `428 px`; системный горизонтальный gutter — `16 px`; основной контейнер — `396 px`.
- **MEASURED:** mobile hero — `396 × 520 px`, расположен с `x = 16`; внутренний контент hero имеет padding `24 px`, полезную ширину `348 px`.
- **MEASURED:** после browser chrome верх hero начинается с `y = 68`; высота browser chrome в макете — `52 px`.
- **INFERRED:** browser chrome — презентационная оболочка макета, не часть интерфейса страницы.
- **INFERRED:** desktop использует центрированный content container примерно `1368–1370 px` при canvas `1920 px`, то есть боковые поля около `275 px`. В ряде полноширинных секций фон и hero выходят на всю ширину viewport, а текст и карточки остаются в контейнере.
- **INFERRED:** desktop layout построен на 12-колоночной или эквивалентной композиционной сетке; фактические модули чаще выражены через группы из 3 и 4 равных карточек.
- **RECOMMENDED:** подтвердить desktop `max-width` через непосредственное измерение внутренних layers перед pixel-perfect реализацией. Не фиксировать приблизительные `1370 px` как design token без проверки.

### Repeated layout patterns

- **MEASURED:** mobile benefits grid — две колонки по `186 px` с промежутком `24 px`.
- **MEASURED:** mobile country tabs — три элемента по `108 px`, gap `17 px`, внутри панели `396 × 86 px`.
- **MEASURED:** mobile “why travel” items занимают всю ширину `396 px`, внутренний padding карточки — `24 px`, полезная ширина — `348 px`.
- **MEASURED:** mobile cards в горизонтальных каруселях имеют ширину `396 px`; gap: partner cards — приблизительно `32 px`; resorts cards — `16 px`; places-to-visit cards — `24 px`.
- **MEASURED:** mobile resort card — `396 × 614 px`, image — `396 × 250 px`.
- **MEASURED:** mobile places card — `396 × 496 px`, image — `396 × 184 px`.
- **MEASURED:** carousel dots — `10 × 10 px` с шагом `18 px`.
- **MEASURED:** weather cards — `186 × 227 px`, grid `2 × 2`, row gap `24 px`.
- **INFERRED:** desktop “why travel” — сетка `3 × 2`; weather — одна строка из четырёх карточек; partner offers и places-to-visit — три карточки в строку; resorts — полноширинные чередующиеся media/text rows.
- **INFERRED:** длинные editorial sections чередуют полноширинную декоративную поверхность, центрированный текстовый контейнер, media/content split, карточные группы и horizontal carousel на mobile.
- **RECOMMENDED:** реализовать это как ограниченный набор layout primitives: `.container`, `.section`, `.card-grid`, `.media-split`, `.carousel-track`, а не как уникальную сетку для каждой секции.

### Section rhythm

- **MEASURED:** на mobile встречаются вертикальные интервалы `16`, `24`, `32`, `40`, `48`, `56`, `64 px`.
- **MEASURED:** hero → floating navigation: `64 px`; navigation → intro: `64 px`; intro heading → body: `16 px`; section heading → content: чаще `24–32 px`; card padding: `16` или `24 px`.
- **INFERRED:** desktop основные секции используют вертикальный ритм приблизительно `64–80 px`, локальные gaps — `16–32 px`.
- **RECOMMENDED:** не переносить абсолютные `y`-координаты из Figma. Секции должны формировать поток через padding/margin и intrinsic content height.

## Typography

### Font family and weights

- **MEASURED:** основной интерфейсный шрифт — `Manrope`.
- **MEASURED:** стандартные веса — Regular `400`, SemiBold `600`.
- **MEASURED:** letter-spacing предоставленных text styles — `0`.
- **MEASURED:** крупные display-заголовки используют отдельный декоративный шрифт с угловатыми формами.
- **INFERRED:** название декоративной гарнитуры не предоставлено variable definitions; она должна рассматриваться как отдельный display family, а не имитироваться Manrope.
- **RECOMMENDED:** проверить наличие и корректность webfont-файла декоративной гарнитуры, его preload и fallback. Не использовать декоративный шрифт для длинного текста.

### Measured type scale

| Role | Font | Size | Weight | Line-height |
|---|---|---:|---:|---:|
| Body | Manrope | 16 px | 400 | 24 px |
| Label | Manrope | 12 px | 400 | 20 px |
| Base normal | Manrope | 14 px | 400 | 22 px |
| Base strong | Manrope | 14 px | 600 | 22 px |
| Heading 5 | Manrope | 20 px | 600 | 28 px |
| Heading 4 | Manrope | 24 px | 600 | 32 px |
| Heading 3 | Manrope | 28 px | 600 | 36 px |
| Heading 2 | Manrope | 32 px | 600 | 40 px |
| Heading 1 | Manrope | 36 px | 600 | 44 px |
| KV title small | display family | 32 px | not exposed | 40 px |
| KV subline medium | Manrope | 16 px | 400 | 24 px |
| Desktop KV subline | Manrope | not fully exposed | 400 | 28 px |

- **MEASURED:** mobile hero title occupies `348 × 80 px`; subtitle — `348 × 48 px`.
- **MEASURED:** mobile section titles commonly occupy line boxes of `40` or `44 px`.
- **INFERRED:** desktop hero title is substantially larger than mobile `32/40`, visually approximately `64–72 px`; exact size is not exposed.
- **INFERRED:** desktop body text appears close to `16/24`, consistent with variables.
- **RECOMMENDED:** keep body type stable between breakpoints and switch display-heading tokens at defined breakpoints. Avoid fluid scaling of every text level.

### Hierarchy

- **MEASURED:** hierarchy combines decorative display headings for campaign-level sections and Manrope headings for informational subsections.
- **INFERRED:** this distinction separates brand storytelling from practical travel content.
- **Potential inconsistency:** similar semantic section levels alternate between decorative and Manrope typography. HTML heading levels must not be inferred from font treatment.
- **RECOMMENDED:** map semantic headings independently from visual classes.

## Spacing

### Confirmed values

- **MEASURED:** `4 px` — XXS.
- **MEASURED:** `8 px` — XS.
- **MEASURED:** `12 px` — SM.
- **MEASURED:** `16 px` — base/mobile gutter.
- **MEASURED:** `20 px` — MD.
- **MEASURED:** `24 px` — LG/common card padding.
- **MEASURED:** `32 px` — XL.
- **MEASURED:** `40 px` — XXL.
- **MEASURED:** `48 px` — XXXL/desktop margin token.
- **MEASURED:** `64 px` — XXXXL.

### Assessment

- **INFERRED:** это последовательная базовая scale, хотя `20 px` является промежуточным продуктовым значением.
- **MEASURED:** макет также содержит `56`, `60`, `72`, `76`, `80`, `88`, `104`, `120 px`; часть образуется суммой tokens и размеров элементов.
- **RECOMMENDED:** токенизировать `4/8/12/16/20/24/32/40/48/64`; не создавать глобальные tokens для каждого крупного единичного расстояния.
- **RECOMMENDED:** отдельные section-spacing tokens оправданы только для повторяющихся mobile/desktop gaps.

## Responsive behaviour

### Elements that reflow

- **MEASURED:** hero: desktop full-bleed landscape, текст слева и geotag справа снизу → mobile portrait card, текст сверху и geotag слева снизу.
- **MEASURED:** navigation: один ряд из пяти пунктов → `2 + 2 + 1` grid `396 × 152 px`.
- **MEASURED:** “why travel”: `3 × 2` → вертикальный список из шести карточек.
- **MEASURED:** partner offers: три карточки → одна карточка в viewport горизонтального track.
- **MEASURED:** country overview: landscape с центральной glass-card → высокий background section с карточкой ближе к верху.
- **MEASURED:** weather: четыре карточки в строку → `2 × 2`.
- **MEASURED:** cuisine/massage: horizontal image/content → overlay/card поверх изображения с последующим текстом.
- **MEASURED:** resorts: четыре чередующихся media/text rows → одна resort card и carousel dots.
- **MEASURED:** places: три карточки → одна карточка и carousel dots.
- **MEASURED:** hotels: четыре horizontal rows → сложная hotel card, компактные filters и pagination.
- **MEASURED:** footer/contact присутствуют на desktop render, но отсутствуют в видимой mobile композиции после campaign card.
- **INFERRED:** отсутствие footer/contact на mobile может быть намеренным либо признаком незавершённого node; требуется продуктовая проверка.

### Elements that remain stable

- **MEASURED:** body `16/24` используется в обоих наборах variables.
- **MEASURED:** surfaces сохраняют белый фон, мягкую тень, крупный radius и голубой accent.
- **MEASURED:** CTA остаются высотой около `48 px`.
- **MEASURED:** card padding преимущественно `16–24 px`.
- **INFERRED:** breakpoint меняет композицию сильнее, чем размеры локальных компонентов.

### Breakpoint recommendations

- **INFERRED:** nodes подтверждают только крайние состояния `428` и `1920`, но не точное положение breakpoint.
- **RECOMMENDED:** не выводить единственный breakpoint из двух screens. Оправданы mobile, tablet/intermediate и desktop состояния.
- **RECOMMENDED:** проверить `768`, `1024`, `1280` вручную; tablet-макет отсутствует.
- **RECOMMENDED:** карусели и tabs должны зависеть от доступной ширины контейнера, а не определения устройства.

## Components

### Reusable component candidates

1. Hero/key visual: responsive source, title/subtitle, geotag, full-bleed/contained variants.
2. Floating navigation: единые данные, mobile Grid и desktop row, active/anchor states.
3. Feature card: icon/image, title, body, `3 × 2`/list, padding `24 px`.
4. Country selector: три tab controls, selected state, mobile container/desktop pill track.
5. Partner offer card: background, overlay, content, CTA; carousel/grid variants.
6. Season card: illustration, title, temperature; `4 → 2 × 2`.
7. Editorial media panel: image, translucent/dark panel, CTA; cuisine/massage.
8. Destination/resort card: horizontal alternating desktop and stacked carousel mobile.
9. Place card: image/text, grid/carousel.
10. Carousel controls: `10 px` dots, active/inactive states.
11. Hotel listing shell: tabs, filters, toggle, cards, pagination, shared data model.

### Component consistency concerns

- **MEASURED:** radii include `4`, `8`, `12`, `16`, `20`, `24`, `48`, `64 px`.
- **INFERRED:** множество близких radius values создаёт риск случайных значений.
- **RECOMMENDED:** разделить tokens по назначению: control, card, panel, pill/round.
- **MEASURED:** несколько mobile elements скрыты, но физически находятся за пределами parent.
- **RECOMMENDED:** не переносить hidden Figma alternatives в DOM; формировать варианты данными и CSS.

## Visual patterns

### Surfaces and color

- **MEASURED:** основной background — светлый холодный голубовато-серый.
- **MEASURED:** surfaces — `#FFFFFF`.
- **MEASURED:** accent — `#0092D0` / `#0093D0`.
- **MEASURED:** text — `#000000`/`#000000D9`; secondary — `#000000A6`; inverse — `#FFFFFF`.
- **MEASURED:** common shadow — `0 10px 20px #0000001A`.
- **MEASURED:** disabled/background tint — `#0000000A`.
- **INFERRED:** два почти одинаковых голубых происходят из разных token namespaces.
- **RECOMMENDED:** проверить намеренность различия и при возможности консолидировать.

### Decorative language

- **MEASURED:** акварельные цветы, животные, архитектура, паспорта и печати образуют общий motif.
- **MEASURED:** крупный дракон присутствует на desktop, но вынесен за mobile viewport.
- **MEASURED:** decorative assets часто выходят за контейнеры и обрезаются.
- **INFERRED:** они presentation-only и не должны влиять на flow.
- **RECOMMENDED:** absolute/pseudo layers внутри bounded sections, `pointer-events: none`, controlled overflow, исключение из accessibility tree.
- **RECOMMENDED:** не собирать страницу в один background image.

### Imagery

- **MEASURED:** используются full-bleed hero, scenic backgrounds, card crops, watercolor PNG/SVG, icons, glass/blur overlays.
- **INFERRED:** focal points различаются между mobile/desktop, особенно hero.
- **RECOMMENDED:** предусмотреть `<picture>`/art-directed sources или отдельные `object-position`.
- **RECOMMENDED:** обеспечить устойчивый контраст overlay независимо от crop.

## Design token candidates

### Measured, justified candidates

```text
--font-family-body: "Manrope", sans-serif;
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-body-size: 16px;
--font-body-line: 24px;
--font-label-size: 12px;
--font-label-line: 20px;
--font-heading-5: 20px / 28px;
--font-heading-4: 24px / 32px;
--font-heading-3: 28px / 36px;
--font-heading-2: 32px / 40px;
--font-heading-1: 36px / 44px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--container-gutter-mobile: 16px;
--container-mobile: 396px;
--radius-control-sm: 8px;
--radius-control-md: 12px;
--radius-card: 16px;
--radius-panel: 20px;
--radius-large-card: 24px;
--radius-pill: 999px;
--color-primary: #0092d0;
--color-surface: #ffffff;
--color-page: #f3f9ff;
--color-text: #000000d9;
--color-text-secondary: #000000a6;
--color-text-inverse: #ffffff;
--shadow-card: 0 10px 20px #0000001a;
```

### Inferred candidates requiring confirmation

```text
--font-family-display: <campaign display font>;
--container-desktop: approximately 1370px;
--section-space-mobile: 64px;
--section-space-desktop: approximately 72–80px;
--hero-title-desktop: approximately 64–72px;
```

- **RECOMMENDED:** не добавлять inferred candidates до измерения desktop layers и проверки шрифта.
- **RECOMMENDED:** aliases лучше выразить семантически, не копируя namespaces Figma один к одному.

## Potential implementation risks

1. **HIGH — отсутствует спецификация промежуточных ширин.** Риск layout jumps, переполнения tabs и некорректных grids на `768–1280 px`.
2. **HIGH — разные hotel listing compositions.** Нужна общая data model и responsive presentation без дублирования интерактивной логики.
3. **HIGH — карусели являются частью responsive-модели.** Нужны корректные Embla initialize/destroy/reinitialize rules.
4. **HIGH — responsive art direction hero.** Нужны отдельные crops/assets либо focal positions.
5. **MEDIUM — floating navigation.** Русские labels требуют контролируемого переноса; фиксированная высота хрупка.
6. **MEDIUM — декоративные assets.** Неконтролируемый overflow способен вызвать horizontal scroll и перекрытие controls.
7. **MEDIUM — glass overlays.** Контраст зависит от изображения, blur и opacity.
8. **MEDIUM — фиксированные высоты карточек.** Возможен overflow при изменении контента/font scaling.
9. **MEDIUM — похожие radius/color tokens.** Прямой экспорт создаст duplication.
10. **MEDIUM — hidden alternatives.** Копирование в DOM ухудшит accessibility, SEO и lifecycle.
11. **MEDIUM — display font.** Возможны layout shift и проблемы переносов.
12. **LOW — browser chrome.** Первые `52 px` не являются отступом сайта.

## Good design patterns

- Чёткая история: hero → преимущества → выбор направления → практическая информация → тур.
- Последовательные Manrope и веса `400/600`.
- Читаемая типографическая шкала с line-height, кратным `4 px`.
- Стабильный mobile gutter `16 px` и padding `24 px`.
- Осмысленный переход grid → carousel/list.
- Единый primary accent для ссылок, active states и CTA.
- Узнаваемая кампания через фото и акварельный декор.
- Повторяемые tabs, buttons, cards, dots, dropdowns и hotel listing.
- Общий порядок большинства разделов между desktop/mobile.
- CTA визуально последовательны и имеют достаточную touch-height.

## Handoff

Переданный дизайн включает desktop `1920 × 9830` и mobile `428 × 13 020`. Mobile имеет подтверждённый gutter `16 px` и контейнер `396 px`; desktop использует центрированный широкий контейнер внутри полноширинных секций, но точная внутренняя ширина не раскрыта metadata и требует подтверждения.

Основные responsive-переходы, важные для разметки и JavaScript:

- hero: full-bleed landscape → contained portrait;
- navigation: 5-column row → `2 + 2 + 1` grid;
- benefits: `3 × 2` → vertical list;
- weather: `4 × 1` → `2 × 2`;
- partner offers и places: desktop grid → mobile carousel;
- resorts: alternating desktop rows → mobile single-card carousel;
- hotels: desktop horizontal list → mobile complex card/listing UI.

Для Embla критичен lifecycle при breakpoint changes: slider должен создаваться только там, где макет реально становится каруселью, и корректно уничтожаться/пересоздаваться. Не дублировать desktop/mobile interactive markup без необходимости.

Основная measured spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Body — Manrope `16/24`, regular `400`; headings преимущественно semibold `600`. Campaign headings используют отдельный декоративный шрифт.

Проверить в markup review: единый семантический порядок при визуально разных layouts; доступные tabs и carousel controls; отсутствие скрытых дубликатов в accessibility tree; alt strategy; crawlable CTA/anchor navigation; hotel filters/dropdowns/view toggles; heading hierarchy независимо от оформления.

Главные implementation risks: неизвестное tablet-состояние, art direction изображений, overflow декоративных assets, фиксированные card heights, контраст glass overlays и duplicated Figma tokens.
