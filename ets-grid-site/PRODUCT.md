# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Astro + TypeScript + CSS custom-property tokens; interactive parts as Preact islands; animation via vanilla `motion` (not `motion/react`). Chosen in the client brief (`../brief/v1.0/02_INSTRUKTSIYA_dlya_agenta.md` §2) and confirmed by the user (DECISIONS D-002, D-007). Catalog, product cards, FAQ and specs must be server-rendered HTML; JS only enhances.

## Users
Primary for the home first screen (confirmed, D-004): **business owners and managers** — parking operators, hotels, restaurants, shopping centres, offices, residential complexes. Job: attract EV drivers, earn on charging, keep working through blackouts, and find out whether their grid connection is enough before spending money.

Also served (entered via level tiles and scenario tabs, not the hero):
- Private clients: EV and house owners who want cheap night charging at home and light during outages.
- Fuel stations, highways, fleets: fast DC charging, uptime, metering; their main barrier is insufficient grid power at the connection.

## Product Purpose
Online shop and lead generator for ETS GRID (Kyiv): EV charging stations, solar panels and PV plants, batteries (BESS), Solar Carport, plus selection, delivery, installation and service. Every page leads to one of two actions: buy online (AC stations, panels, inverters, home batteries, accessories) or request a turnkey calculation (DC, PV plants, commercial BESS, Solar Carport, installation).

Success (client TZ §2): first-screen CTA or level-tile click ≥ 25 % of sessions; site-wide lead or order conversion ≥ 2.5 %; ≥ 50 % of leads carry picker parameters; Lighthouse mobile ≥ 90 / 95 / 100.

## Positioning
One energy system from one company — charger + sun + battery + carport, one warranty. Turnkey price visible up front ("від … ₴ з монтажем"), not bare hardware price. Selection starts by checking the customer's grid connection: pickers account for a station's minimum input power (DC 60 needs ≥ 65 kW) and battery capacity in kWh. Result over specs: hours of light, cars charged per day, cost per 100 km. Competitors split into "hardware catalogue without installation" and "leave a request" without prices, and sell charging, solar and storage separately.

## Operating Context
Ukraine, after the 2025/26 winter of scheduled outages; buyers think in hours with light and kilometres per day. Mobile-first (375/320 px). Four catalogue levels: Зарядні станції · Сонячні панелі та СЕС · Батареї · Solar Carport. URL map and filter config in `../brief/v1.0/03_struktura_i_filtry.md` (authoritative for all URLs, D-003). Demo catalogue: `../brief/v1.0/data/catalog-sample.json` (19 products, 4 systems, prices marked demo).

## Capabilities and Constraints
- Prototype scope: catalogue with faceted filters (counts, URL state, no empty results), product card with "equipment only / with installation" toggle, four pickers + "Чи вистачить потужності?" + Solar Carport configurator, cart → checkout → thanks, compare, search. Payments, Nova Poshta, CRM: UI stubs only (`TODO: integration`).
- Interface language Ukrainian with Ukrainian typography: «», —, ʼ, `кВт·год`, non-breaking space between number and unit.
- Performance: JS ≤ 100 KB gz content pages, ≤ 150 KB gz catalogue; ≤ 2 font files on the first screen; images AVIF/WebP with explicit sizes.
- Forbidden by brief: lime `#C8F03C` on graphite + Unbounded + JetBrains Mono as a base; scroll-jacking, hero carousels, background video, neon glows, 3D/WebGL in the hero, full-screen curtain transitions between levels.
- Open (DECISIONS Q-1…Q-6): `cars.json` missing; some categories empty; cable mistyped; order endpoint under static build; acceptance items beyond prototype scope; only 1 of 19 products has a photo.

## Brand Commitments
- No logo or brand book yet; a temporary mark is allowed (studio concept proposes a lit "window" rectangle).
- Palette direction pinned by the brief (TZ §8.2): **A «Тёплий світ» (default)** — night `#0D1424`, warm window light `#FFB547` as the single accent, day `#F4F6F8`; **B «Сигнал»** — graphite `#11110F`, paper `#ECEBE4`, signal orange `#FF4D00`. Switchable via one token set. All text/background pairs WCAG AA.
- Two type families max (display + text), full Ukrainian Cyrillic (ґ, є, і, ї, ʼ), web licence.
- Tone: calm engineer's confidence — short, human, no superlatives, no "best / №1".
- Core image (studio concept): the lit window in a dark house during an outage — «Світло лишається».

## Evidence on Hand
None from the client yet (D-005): no logo, no project photos, no contacts, no object counts, no certificates, no testimonials, no client logos. Use visible placeholders `[ТЕЛЕФОН]`, `[N об'єктів]`, `[ЦІНА]`; demo prices carry a visible «демо-ціна» label. The «Об'єкти» block shows «Тут будуть реальні об'єкти ETS GRID» — foreign photos must never pose as ETS GRID projects. Third-party equipment photos allowed for the prototype with every source logged in `public/img/CREDITS.md`. Geography: «Київ і вся Україна» (D-006).

## Product Principles
1. Price and result first: every offer shows a turnkey price or an honest "від", and a human outcome (hours, cars, hryvnias).
2. Check the grid before selling the hardware: power and capacity logic is never faked.
3. One system, many doors: the four levels and three audiences always cross-link into a single energy system.
4. Nothing invented: every number, claim and photo is either real, labelled demo, or a visible placeholder.
5. Works without JavaScript and on a weak phone connection.

## Accessibility & Inclusion
WCAG 2.1 AA: visible focus, labelled fields, full keyboard paths (filters, bottom sheet, cart, forms), touch targets ≥ 44 px, `prefers-reduced-motion` disables all animation, alt text on photos. No horizontal scroll at 320 px.
