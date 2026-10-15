// Тривалості й криві руху для скриптів — дзеркало токенів tokens.css (--dur-fast, --dur, --dur-slow, --ease-*).
// У секундах, як чекає motion. Тривалість поза цим списком — лише як виняток у DESIGN.md → Рух (SPEC-006 §4.12, D-072).
export const DUR_FAST = 0.2;
export const DUR = 0.32;
export const DUR_SLOW = 0.6;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_SPRING = [0.16, 1, 0.3, 1] as const;
