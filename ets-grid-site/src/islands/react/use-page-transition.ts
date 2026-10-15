// Перехід сторінки для Carousel Motion+. Carousel гортає власним JSAnimation, тож MotionConfig reducedMotion
// на нього не діє: при prefers-reduced-motion передаємо миттєвий перехід явно (SPEC-006 §4.12, D-072).
import { useEffect, useState } from 'react';

const INSTANT = { type: 'tween', duration: 0 } as const;

// Carousel читає transition один раз при монтуванні (useEffect з []), тож налаштування треба знати вже
// на першому клієнтському рендері; на DOM це не впливає, гідратація не розходиться.
const query = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function usePageTransition() {
  const [reduce, setReduce] = useState(query);
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduce ? INSTANT : undefined;
}
