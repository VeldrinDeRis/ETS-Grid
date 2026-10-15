# ETS GRID

Сайт-магазин ETS GRID: зарядні станції, сонячні панелі, батареї, Solar Carport + доставка, монтаж, сервіс.
Здесь — кликабельный прототип в коде (Astro 7 + TypeScript, острова Preact и React, анимация Motion / Motion+), статическая сборка.

```
ETS-GRID/
├── CLAUDE.md        правила проекта (для агента и людей)
├── DECISIONS.md     журнал решений и открытых вопросов
├── HYPOTHESES.md    реестр продуктовых гипотез
├── brief/v1.0/      пакет ТЗ от заказчика (не редактируется)
├── specs/           спецификации модулей SPEC-0NN
├── ets-grid-site/   код прототипа
├── qa/              итоги замеров (Lighthouse, MotionScore)
├── research/        референсы, снимки ревизий
├── sources/         сырые фото до оптимизации (в git не идут)
└── releases/        архивы для заказчика (в git не идут)
```

## Как запустить

### 1. Что нужно
- **Node.js 22+** и npm.
- **Токен Motion+** — пакет `@motionplus/core` ставится из закрытого реестра Motion (D-043). Без токена `npm ci` остановится на этом пакете. Собранному сайту токен не нужен.
- Git.

### 2. Забрать код и поставить зависимости

```bash
git clone https://github.com/VeldrinDeRis/ETS-Grid.git
cd ETS-Grid/ets-grid-site
```

Задать токен Motion+ в переменной среды `MOTION_TOKEN` (файл `ets-grid-site/.npmrc` подставляет его сам; в репозиторий токен не кладётся):

```bash
export MOTION_TOKEN=ваш_токен        # macOS, Linux, Git Bash
```

```powershell
$env:MOTION_TOKEN = 'ваш_токен'      # Windows PowerShell; навсегда — setx MOTION_TOKEN ваш_токен
```

Затем:

```bash
npm ci
```

На Windows, если PowerShell не даёт запускать `npm`: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### 3. Работать с сайтом
Все команды — из папки `ets-grid-site/`.

| Команда | Что делает |
|---|---|
| `npm run dev` | разработка с перезагрузкой: http://localhost:4321/ |
| `npm run build` | проверка типов (`astro check`) и сборка в `dist/` |
| `npm run serve` | показ собранного сайта из `dist/`: http://localhost:4321/ |
| `npm run release` | архив `releases/ets-grid-site-ГГГГ-ММ-ДД.zip` для заказчика |

Оптимизированные фото уже лежат в `ets-grid-site/public/img/` (источники — [CREDITS.md](ets-grid-site/public/img/CREDITS.md)), сырые исходники для сборки не нужны.

### 4. Тесты
Перед первым прогоном браузерных тестов поставить Chromium для Playwright:

```bash
npx playwright install chromium
```

| Команда | Что проверяет |
|---|---|
| `npm test` | unit и данные, секунды |
| `npm run test:build` | собранный сайт (после `npm run build`) |
| `npm run test:functional` · `test:a11y` · `test:visual` | поведение, доступность (axe), визуальные эталоны |
| `npm run test:all` | сборка + все категории — обязательно перед слиянием в `main` |

На Windows `test:all` гонять из PowerShell: из Git Bash падает тест релизного zip (там другой `tar`). Визуальные эталоны сняты на Windows (`*-win32.png`); на другой ОС их нужно снять заново. Индекс тестов и покрытие критериев — [ets-grid-site/tests/README.md](ets-grid-site/tests/README.md).

### 5. Показ заказчику без Node-окружения разработчика
`npm run release` собирает zip. В нём `site/start.cmd`: двойной клик поднимает локальный сервер и открывает браузер, интернет не нужен (нужен Node.js 22+). В `source/` — исходники без `node_modules` (D-019).

## Как устроена работа
Спецификация → утверждение → тесты → код (D-022, D-023); код — только по явной команде на модуль (D-032), незавершённое — в ветках `wip/…`, в `main` — после зелёного `npm run test:all`. Каждое решение — запись `D-0NN` в [DECISIONS.md](DECISIONS.md), открытые вопросы — там же, в «Ждут решения». Подробно — [CLAUDE.md](CLAUDE.md), о самом сайте и прогрессе модулей — [ets-grid-site/README.md](ets-grid-site/README.md), дизайн-система — [ets-grid-site/DESIGN.md](ets-grid-site/DESIGN.md). ТЗ — [brief/v1.0/README.md](brief/v1.0/README.md).

Материалов заказчика (логотип, контакты, цифры, фото объектов) пока нет — на сайте видимые плейсхолдеры `[ТЕЛЕФОН]`, `[ЦІНА]` и т. п. (D-031).
