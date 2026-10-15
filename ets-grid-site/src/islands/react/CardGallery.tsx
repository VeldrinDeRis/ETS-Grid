/** @jsxImportSource react */
// Міні-галерея картки товару (SPEC-002 §3.10, D-065): 5 кадрів у Carousel Motion+ — перетягування, колесо, клавіатура,
// стрілки, точки-лампи. Кадри — серверний HTML <picture> (Photo.astro) через слоти shot0…shot4: без JS усі кадри
// в документі, видно перший; острів лише додає гортання. Мітка «Ілюстративне фото» — у кожному кадрі, бейдж — поверх.
import { Carousel, useCarousel } from '@motionplus/core/react';
import { usePageTransition } from './use-page-transition';
import { useEffect, useState, type ReactNode } from 'react';

interface Props {
  count: number;
  /** Назва товару — для імен стрілок і точок. */
  label: string;
  [slot: string]: unknown;
}

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: dir === 'prev' ? 'scaleX(-1)' : undefined }}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/** Навігація. До монтування (серверний HTML, client:intent) Carousel ще не знає сторінок —
 *  показуємо ту саму розмітку на count кадрів, щоб розкладка не стрибала, а клік директива повторить. */
function Controls({ label, count }: { label: string; count: number }) {
  const carousel = useCarousel();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Поки Carousel не порахував сторінки, лишаємо ту саму розмітку на count кадрів: вузли кнопок
  // не перемонтовуються, і фокус з клавіатури не губиться в момент гідратації (D-069).
  const live = mounted && carousel.totalPages > 1;
  const totalPages = live ? carousel.totalPages : count;
  const currentPage = live ? carousel.currentPage : 0;
  const isPrevActive = live ? carousel.isPrevActive : false;
  const isNextActive = live ? carousel.isNextActive : count > 1;
  const { nextPage, prevPage, gotoPage } = carousel;
  if (totalPages <= 1) return null;
  return (
    <div className="pgal__nav" data-intent-wait="" data-intent-ready={live ? '' : undefined}>
      <button type="button" className="pgal__arrow" aria-label={`Попередній кадр: ${label}`} onClick={prevPage} disabled={!isPrevActive}>
        <Arrow dir="prev" />
      </button>
      <div className="pgal__dots" role="tablist" aria-label={`Кадри: ${label}`}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} type="button" role="tab" className="pgal__dot" aria-selected={i === currentPage} aria-label={`Кадр ${i + 1} з ${totalPages}`} onClick={() => gotoPage(i)} />
        ))}
      </div>
      <button type="button" className="pgal__arrow" aria-label={`Наступний кадр: ${label}`} onClick={nextPage} disabled={!isNextActive}>
        <Arrow dir="next" />
      </button>
    </div>
  );
}

export default function CardGallery({ count, label, ...slots }: Props) {
  const transition = usePageTransition();
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className="pgal__shot">
      {slots[`shot${i}`] as ReactNode}
    </div>
  ));
  return (
    <div className="pgal" data-card-gallery>
      <Carousel className="pgal__track" items={items} gap={0} snap="page" loop={false} itemSize="fill" transition={transition}>
        <Controls label={label} count={count} />
      </Carousel>
    </div>
  );
}
