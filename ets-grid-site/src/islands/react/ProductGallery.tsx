/** @jsxImportSource react */
// Галерея картки товару (SPEC-003 §3.5, D-071): той самий набір кадрів, що в міні-галереї картки лістингу, у Carousel
// Motion+ — перетягування, колесо, клавіатура, стрілки й стрічка мініатюр. Кадри й мініатюри — серверний HTML
// (<picture> з Photo.astro) через слоти shot0…/thumb0…: до першого наміру (client:intent, D-069) острів — лише
// розмітка, перший кадр — LCP. Клік по мініатюрі чи стрілці до готовності директива повторить після гідратації.
import { Carousel, useCarousel } from '@motionplus/core/react';
import { useEffect, useState, type ReactNode } from 'react';
import { usePageTransition } from './use-page-transition';

interface Props {
  count: number;
  /** Назва товару — для імен стрілок і мініатюр. */
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

/** Стрілки й мініатюри. Поки Carousel не порахував сторінки, розмітка та сама на count кадрів — вузли кнопок
 *  не перемонтовуються, фокус з клавіатури не губиться (як CardGallery, D-069). */
function Controls({ label, count, thumbs }: { label: string; count: number; thumbs: ReactNode[] }) {
  const carousel = useCarousel();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const live = mounted && carousel.totalPages > 1;
  const currentPage = live ? carousel.currentPage : 0;
  const isPrevActive = live ? carousel.isPrevActive : false;
  const isNextActive = live ? carousel.isNextActive : count > 1;
  const { nextPage, prevPage, gotoPage } = carousel;
  if (count <= 1) return null;
  return (
    <div className="pgallery__nav" data-intent-wait="" data-intent-ready={live ? '' : undefined}>
      <button type="button" className="pgallery__arrow pgallery__arrow--prev" aria-label={`Попередній кадр: ${label}`} onClick={prevPage} disabled={!isPrevActive}>
        <Arrow dir="prev" />
      </button>
      <button type="button" className="pgallery__arrow pgallery__arrow--next" aria-label={`Наступний кадр: ${label}`} onClick={nextPage} disabled={!isNextActive}>
        <Arrow dir="next" />
      </button>
      <ul role="list" className="pgallery__thumbs">
        {thumbs.map((thumb, i) => (
          <li key={i}>
            <button type="button" className="pgallery__thumb" aria-label={`Кадр ${i + 1} з ${count}`} aria-current={i === currentPage ? 'true' : undefined} onClick={() => gotoPage(i)}>
              {thumb}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductGallery({ count, label, ...slots }: Props) {
  const transition = usePageTransition();
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className="pgallery__shot">
      {slots[`shot${i}`] as ReactNode}
    </div>
  ));
  const thumbs = Array.from({ length: count }, (_, i) => slots[`thumb${i}`] as ReactNode);
  return (
    <div className="pgallery" data-product-gallery>
      <Carousel className="pgallery__track" items={items} gap={0} snap="page" loop={false} itemSize="fill" transition={transition}>
        <Controls label={label} count={count} thumbs={thumbs} />
      </Carousel>
    </div>
  );
}
