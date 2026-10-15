/** @jsxImportSource react */
// Міні-галерея обʼєкта (D-061): кадри в Carousel Motion+ — перетягування, колесо, клавіатура, стрілки, точки.
// Кадри — серверний HTML <picture> (Photo.astro) через іменовані слоти shot0…shotN: без JS усі кадри в документі
// і видно перший; острів лише додає гортання. Мітка «Ілюстративне фото» — на кожному кадрі в слоті.
import { Carousel, useCarousel } from '@motionplus/core/react';
import type { ReactNode } from 'react';

interface Props {
  count: number;
  label: string;
  [slot: string]: unknown;
}

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: dir === 'prev' ? 'scaleX(-1)' : undefined }}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Controls({ label }: { label: string }) {
  const { nextPage, prevPage, isNextActive, isPrevActive, currentPage, totalPages, gotoPage } = useCarousel();
  if (totalPages <= 1) return null;
  return (
    <div className="case__nav">
      <button type="button" className="case__arrow" aria-label={`Попередній кадр: ${label}`} onClick={prevPage} disabled={!isPrevActive}>
        <Arrow dir="prev" />
      </button>
      <div className="case__dots" role="tablist" aria-label={`Кадри: ${label}`}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} type="button" role="tab" className="case__dot" aria-selected={i === currentPage} aria-label={`Кадр ${i + 1} з ${totalPages}`} onClick={() => gotoPage(i)} />
        ))}
      </div>
      <button type="button" className="case__arrow" aria-label={`Наступний кадр: ${label}`} onClick={nextPage} disabled={!isNextActive}>
        <Arrow dir="next" />
      </button>
    </div>
  );
}

export default function CaseGallery({ count, label, ...slots }: Props) {
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className="case__shot">
      {slots[`shot${i}`] as ReactNode}
    </div>
  ));
  return (
    <div className="case__gallery" data-case-gallery>
      <Carousel className="case__track" items={items} gap={8} snap="page" loop={false} itemSize="fill">
        <Controls label={label} />
      </Carousel>
    </div>
  );
}
