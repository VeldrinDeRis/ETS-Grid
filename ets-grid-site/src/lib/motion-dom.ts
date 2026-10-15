// Ванільний motion для React-островів (SPEC-002 §3.8–3.9, D-063). Острови імпортують звідси, а не з 'motion':
// dev-плагін motion-studio (D-052) інструментує кожен модуль з `from 'motion'` і перезбирає його JSX
// з jsxImportSource проєкту (preact), ігноруючи прагму @jsxImportSource react — острів тоді не рендериться.
// Через цей модуль без JSX інструментування лишається, а острів — на React.
export { animate, animateLayout } from 'motion';
