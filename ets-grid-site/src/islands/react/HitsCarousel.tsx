/** @jsxImportSource react */
// Вітрина хітів (SPEC-006 §4.10 акт IV, D-057): один ряд на Carousel Motion+ — перетягування, колесо, клавіатура,
// стрілки й точки сторінок. Картки — серверний HTML ProductCard через іменовані слоти card0…cardN: без JS усі
// картки в документі. Фільтр рівня лишає картки вибраного рівня (ряд пересобирається, картки не дублюються).
import { Carousel, useCarousel } from '@motionplus/core/react';
import { usePageTransition } from './use-page-transition';
import { useState, type ReactNode } from 'react';

interface Props {
  levels: { id: number; name: string }[];
  hits: { slug: string; level: number }[];
  [slot: string]: unknown;
}

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: dir === 'prev' ? 'scaleX(-1)' : undefined }}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Controls() {
  const { nextPage, prevPage, isNextActive, isPrevActive, currentPage, totalPages, gotoPage } = useCarousel();
  if (totalPages <= 1) return null;
  return (
    <div className="hits__nav">
      <button type="button" className="hits__arrow" aria-label="Попередні товари" onClick={prevPage} disabled={!isPrevActive}>
        <Arrow dir="prev" />
      </button>
      <div className="hits__dots" role="tablist" aria-label="Сторінки вітрини">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} type="button" role="tab" className="hits__dot" aria-selected={i === currentPage} aria-label={`Сторінка ${i + 1} з ${totalPages}`} onClick={() => gotoPage(i)} />
        ))}
      </div>
      <button type="button" className="hits__arrow" aria-label="Наступні товари" onClick={nextPage} disabled={!isNextActive}>
        <Arrow dir="next" />
      </button>
    </div>
  );
}

export default function HitsCarousel({ levels, hits, ...slots }: Props) {
  const [level, setLevel] = useState<'all' | number>('all');
  const transition = usePageTransition();
  const shown = hits.map((h, i) => ({ ...h, node: slots[`card${i}`] as ReactNode })).filter((h) => level === 'all' || h.level === level);
  return (
    <div className="hits__carousel" data-hits>
      <div className="hits__filters" role="group" aria-label="Фільтр за рівнем">
        <button type="button" aria-pressed={level === 'all'} data-hits-filter="all" onClick={() => setLevel('all')}>
          Усі
        </button>
        {levels.map((l) => (
          <button key={l.id} type="button" aria-pressed={level === l.id} data-hits-filter={String(l.id)} onClick={() => setLevel(l.id)}>
            {l.name}
          </button>
        ))}
      </div>
      {/* key — фільтр перезбирає карусель із нульової сторінки. */}
      <Carousel
        key={String(level)}
        className="hits__track"
        items={shown.map((h) => (
          <div key={h.slug} className="hits__item" data-hits-level={String(h.level)}>
            {h.node}
          </div>
        ))}
        gap={16}
        snap="page"
        loop={false}
        align="stretch"
        transition={transition}
      >
        <Controls />
      </Carousel>
    </div>
  );
}
