# Ручные проверки (QA)

Сырые отчёты Lighthouse лежат в `qa/lighthouse/{страница}/report.html` и в git не идут — пересобираются Chrome DevTools MCP (`lighthouse_audit`) на `node ets-grid-site/scripts/serve.mjs`.

## Lighthouse — SPEC-008/AC-07

2026-10-14, сборка после SPEC-008, mobile, локально (`127.0.0.1`). Performance в этот аудит MCP не входит.

| Страница | Accessibility | Best Practices | SEO |
|---|---|---|---|
| `/` главная | 100 | 100 | 100 |
| `/zaryadni-stantsii/` уровень | 100 | 100 | 100 |
| `/zaryadni-stantsii/dlya-domu/` листинг | 100 | 100 | 100 |
| `/product/ets-home-7/` товар | 100 | 100 | 100 |

Повторить после SPEC-010 (шрифты, фото) и добавить Performance (SPEC-006 AC-23: ≥ 90).
