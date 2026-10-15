## Motion Performance Audit
**Scope:** ets-grid-site — src/scripts/home.ts, src/directives/intent.ts, src/islands/react/**, src/islands/pickers/**, src/components/**/*.astro, src/styles/*.css, BaseLayout (static audit only; no runtime pass)
**Files scanned:** 55
**Animations found:** 43

### Scorecard
```
'████████::
.██.... ██:
.██:::: ██:
.████████::
.██.... ██:
.██:::: ██:
.████████::
........:::

Breakdown
S  ██████████░░░░░░░░░░░░░░░  17 · 40%
A  ███░░░░░░░░░░░░░░░░░░░░░░   6 · 12%
B  ███░░░░░░░░░░░░░░░░░░░░░░   5 · 12%
C  ████████░░░░░░░░░░░░░░░░░  14 · 32%
D  █░░░░░░░░░░░░░░░░░░░░░░░░   1 ·  4%
F  ░░░░░░░░░░░░░░░░░░░░░░░░░   0 ·  0%
```

### Findings
17 animations are already S-tier. 6 are A-tier with no practical upgrade: the scroll() callbacks for act II and act V (home.ts:108, :225) have to latch one way, so they can't become a ScrollTimeline; the LED placement and the three Carousels are also A. 5 are B-tier (FAQ and catalog animateLayout, both AnimateNumber uses) and the cost is negligible (19 products at most). 10 C-tier hover/state colour transitions on small controls (.btn, chips, dots, presets, step circles, flow labels) have no practical upgrade.

#### [src/components/home/EnergyFlow.astro:228] — Tier D
**What:** `.flow__hint::before` animates `width` 2.5rem↔4.5rem, 1.6 s, `infinite alternate`.
**Why Tier D:** `width` on a flex child triggers layout of the hint row on every frame.
**Impact:** Layout runs every frame the whole time act II is on the page (desktop). `.flow[data-done]` only fades the hint to opacity 0 (:239), so the loop keeps running invisibly for the rest of the session.
**Upgrade:** Keep `width: 4.5rem` fixed and animate `transform: scaleX(0.55 → 1)` with `transform-origin: left` (S). Add `.flow[data-done] .flow__hint::before { animation: none }`.

#### [src/scripts/home.ts:159 + src/components/home/HomeHero.astro:207] — Tier C
**What:** On each pointermove the lamp cursor writes `--lx`/`--ly` onto `.hero` through frame.render. Those variables position a full-bleed `radial-gradient` with `mix-blend-mode: screen`.
**Why Tier C:** It animates CSS variables. The variables are inherited, so they invalidate style for the whole hero subtree (H1 words, 4 tiles, CTAs). The gradient layer, about 1440×800, repaints and re-blends over the photo each frame.
**Impact:** Main-thread style + paint at pointer rate, around 60–120 Hz, on the LCP section. This costs INP headroom and battery on laptops.
**Upgrade:** Make `.hero__lamp` a fixed 72rem square with the gradient centred. Set `transform: translate(x, y)` on it from the motionValues (A). At minimum, register `@property --lx/--ly { inherits: false }` and set them on `.hero__lamp`, not `.hero`.

#### [src/components/home/HomeHero.astro:328] — Tier C
**What:** `tile-breathe` loops `box-shadow` + opacity, 1.6 s infinite, on hover/focus. `tile-charge` (:332) animates `box-shadow` once on 4 tiles.
**Why Tier C:** Each `box-shadow` frame is a repaint.
**Impact:** A keyboard focus left on a tile repaints it indefinitely.
**Upgrade:** Draw the halo on `::before` with a static shadow and animate only its `opacity`/`transform: scale` (S).

### Anti-Patterns
#### Medium — Long-running off-screen animations
**Location:** HomeHero.astro:130–137 (3 sky layers, 48 s), :375 (LEDs, 1.8 s), EnergyFlow.astro:154 (sparks, 2.4 s, latched on once lit)
**Problem:** These are compositor-only, but they loop for the whole session after the hero and act II have scrolled away. The compositor never idles, which drains battery.
**Fix:** inView on `.hero` / `[data-energy-flow]` should toggle a `data-paused` attribute, and `animation-play-state: paused` should apply when it is present.

#### Medium — Layout read in a page-wide scroll listener
**Location:** src/scripts/home.ts:166
**Problem:** `getBoundingClientRect()` runs on every scroll for the life of the page, even when the pointer never enters the hero. frame.read batches it, so it does not thrash, but the reads never stop.
**Fix:** Drop the scroll listener. Measure the page offset on pointerenter/resize and use `e.pageX/pageY − offset`.

### Accessibility
- ✗ Carousel (HitsCarousel.tsx:57, CaseGallery.tsx:52, CardGallery.tsx:65): page transitions from arrows, dots, drag and wheel have no reduced-motion guard in project code (no `MotionConfig reducedMotion="user"`, no zero-duration transition). Every other JS animation checks `reduce` or `data-motion`.
- ✗ Two infinite cycles exist outside the Three Slow Cycles Rule: flow-hint and tile-breathe (see below).

### DESIGN.md rule deviations (not performance)
- **Only opacity/transform:** these animate other properties: `width` (flow-hint), `box-shadow` (tile-charge, tile-breathe, and the chip/tile "light" transitions in HomeHits.astro:58, catalog-filters.css:49/88/155, HomeHero.astro:302), and gradient position (lamp). The colour transitions on buttons and chips are sanctioned by DESIGN.md:364.
- **Exactly three cycles:** flow-hint (1.6 s) and tile-breathe (1.6 s) make five. Either remove them or record a decision.
- **Easing/durations:** these values are not in the token set: flow dot 450 ms (home.ts:98), mobile pulse 400 ms + 180 ms delay (:101), BatteryPicker 450 ms (BatteryPicker.tsx:28), tile-charge 700 ms. `ease-in-out` is used in tile-breathe and led-charge. The documented exceptions are fine: H1 550 ms [0.4,0,0.2,1] (D-049), LiveNumber 700 ms, AnimateNumber 450 ms, lamp 600/900 ms.
- **Compliant:** reduced motion (base.css:113, tokens.css:137, JS `reduce`/`data-motion` checks); no `will-change` anywhere; no unbounded rAF (intent.ts:39 is capped at 2 s and only runs while a click is pending); the 320vh sticky act II pins but doesn't intercept the wheel, so it isn't scrolljacking.

### Top 3 Recommendations
1. Replace flow-hint `width` with `scaleX` and stop it on `[data-done]`. This removes the only D-tier animation and a 4th cycle.
2. Move the lamp cursor from inherited CSS variables on `.hero` to `transform` on a sized `.hero__lamp`, and drop the scroll listener.
3. Pause the sky, LED and spark loops off-screen with inView, and add a reduced-motion guard to the three Carousels.
