# Спецификация: структура URL, фильтры, подборщики, формулы

Дополняет разделы 5, 7 и 9 ТЗ. Значения в `snake_case` — ключи атрибутов в `data/catalog-sample.json`.

## 1. Карта URL

| Страница | URL | Шаблон |
|---|---|---|
| Головна | `/` | home |
| Зарядні станції | `/zaryadni-stantsii/` | level |
| ↳ Для дому | `/zaryadni-stantsii/dlya-domu/` | listing |
| ↳ Для бізнесу | `/zaryadni-stantsii/dlya-biznesu/` | listing |
| ↳ Швидкі DC | `/zaryadni-stantsii/dc/` | listing |
| ↳ Портативні | `/zaryadni-stantsii/portatyvni/` | listing |
| ↳ Кабелі та адаптери | `/zaryadni-stantsii/kabeli-adaptery/` | listing |
| Сонячні панелі та СЕС | `/sonyachni-paneli/` | level |
| ↳ Панелі / Інвертори / Кріплення / Готові СЕС | `/sonyachni-paneli/{paneli,invertory,kriplennya,ses-pid-klyuch}/` | listing |
| Батареї | `/batarei/` | level |
| ↳ Для дому / бізнесу / промислові | `/batarei/{dlya-domu,dlya-biznesu,promyslovi}/` | listing |
| Solar Carport | `/solar-carport/` | level-landing + configurator |
| ↳ Конфігурації | `/solar-carport/{pryvatnyi,komertsiinyi,hab}/` | listing |
| Товар | `/product/{slug}/` | product |
| Готова система | `/systems/{slug}/` | system |
| Послуги | `/posluhy/{dostavka,montazh,proekt-tekhumovy,servis}/` | service |
| Фінансування | `/finansuvannya/` | content |
| Об'єкти | `/obiekty/`, `/obiekty/{slug}/` | cases |
| Кошик / Оформлення / Дякуємо | `/koshyk/`, `/oformlennya/`, `/dyakuyemo/` | shop |
| Порівняння | `/porivnyannya/` | compare |

**Индексируемые фильтр-страницы (ЧПУ):** `/zaryadni-stantsii/dlya-domu/gbt/`, `/zaryadni-stantsii/dlya-domu/22-kvt/`, `/zaryadni-stantsii/dc/120-kvt/`, `/zaryadni-stantsii/dc/z-nakopychuvachem/`, `/batarei/dlya-domu/10-kvt-god/`, `/sonyachni-paneli/invertory/hibrydni/`. Остальные комбинации отдаются через `?type=…&power=…` с `noindex, follow` и canonical на листинг.

## 2. Конфигурация фильтров (машиночитаемо)

```json
{
  "charging": {
    "primary": {"key": "type", "label": "Тип станції", "ui": "visual-chips",
      "values": [["wall_ac","Настінна AC"],["pedestal_ac","Стійка AC"],["dc","Швидка DC"],["split_dc","Split DC"],["portable","Портативна"],["dc_battery","З накопичувачем"]]},
    "facets": [
      {"key": "scenarios", "label": "Сценарій", "ui": "chips", "values": [["home","Дім"],["business","Бізнес / паркінг"],["highway","АЗС / траса"],["fleet","Автопарк"]]},
      {"key": "current", "label": "Тип струму", "ui": "toggle", "values": [["AC","AC"],["DC","DC"]]},
      {"key": "power_kw", "label": "Потужність", "ui": "ranges", "ranges": [[0,3.7],[3.7,7],[7,11],[11,22],[22,60],[60,160],[160,240]]},
      {"key": "connectors", "label": "Роз'єм", "ui": "checkbox-icons", "values": [["type2","Type 2"],["ccs2","CCS2"],["gbt_ac","GB/T AC"],["gbt_dc","GB/T DC"],["chademo","CHAdeMO"]]},
      {"key": "car", "label": "Підбір за авто", "ui": "search-select", "source": "cars.json"},
      {"key": "phases", "label": "Живлення", "ui": "toggle", "values": [[1,"1 фаза"],[3,"3 фази"]]},
      {"key": "ports", "label": "Кількість портів", "ui": "chips", "values": [[1,"1"],[2,"2"],[3,"3–4"]]},
      {"key": "cable", "label": "Кабель", "ui": "checkbox", "values": [["tethered","Вбудований"],["socket","Розетка"]]},
      {"key": "control", "label": "Керування", "ui": "checkbox", "values": [["app","Wi-Fi / додаток"],["rfid","RFID"],["ocpp","OCPP"],["balancing","Балансування"]]},
      {"key": "ip", "label": "Захист", "ui": "checkbox", "values": [["IP54","IP54"],["IP55","IP55"],["IP65","IP65"]]},
      {"key": "brand", "label": "Бренд", "ui": "checkbox-search"},
      {"key": "price", "label": "Ціна", "ui": "range-slider"},
      {"key": "stock", "label": "Наявність", "ui": "toggle", "values": [["in_stock","В наявності"],["preorder","Під замовлення"]]}
    ]
  },
  "solar": {
    "primary": {"key": "type", "label": "Тип", "ui": "visual-chips",
      "values": [["panel","Панелі"],["inverter","Інвертори"],["mounting","Кріплення"],["kit","Готові СЕС"]]},
    "facets": ["panel_w", "technology", "inverter_kind", "phases", "power_kw", "battery_voltage", "purpose", "brand", "price", "price_per_w", "stock"]
  },
  "battery": {
    "primary": {"key": "type", "label": "Тип", "ui": "visual-chips",
      "values": [["home_wall","Домашня настінна"],["home_rack","Домашня стійкова"],["commercial","Комерційна шафа"],["industrial","Промисловий контейнер"],["portable","Портативна станція"]]},
    "facets": ["capacity_kwh", "voltage", "chemistry", "max_expand_kwh", "inverters", "scenarios", "autonomy_h", "brand", "warranty", "price", "stock"]
  },
  "carport": {
    "primary": {"key": "type", "label": "Тип конструкції", "ui": "visual-chips",
      "values": [["single","Односторонній"],["double","Двосторонній"],["y","Y-подібний"],["row","Модульний ряд"]]},
    "facets": ["places", "kwp", "bundle", "material", "roof"]
  }
}
```

**Поведение:** логика «ИЛИ» внутри одного фасета, «И» между фасетами. Счётчик значения = число товаров при текущих прочих фильтрах + это значение. Значения со счётчиком 0 неактивны, но остаются видимыми (не прыгают). Порядок фасетов задаётся в CMS.

## 3. Подборщики: логика результата

### 3.1. «Чи вистачить потужності?» (зарядки)
```
need_kw    = выбранная мощность зарядки (7, 11, 22, 60, 120, 160, 240)
grid_kw    = доступная мощность ввода (ползунок 3–300)
station    = минимальная станция с power_kw >= need_kw подходящего тока
deficit    = max(0, station.input_min_kw - grid_kw)
если deficit == 0 → «Мережі вистачає», запас = grid_kw - station.input_min_kw
если AC и deficit > 0 → предложить меньшую мощность + балансування, или «збільшення потужності (техумови)»
если DC и deficit > 0 → станция + накопичувач:
     battery_kwh ≈ ceil(deficit * 0.5 / 10) * 10   // буфер на 30 мин сессии, ориентир
     текст: «Додаємо накопичувач ≈ {battery_kwh} кВт·год: він заряджається від ваших {grid_kw} кВт між сесіями»
всегда: «Оцінка орієнтовна. Точний розрахунок — після обстеження.»
```

### 3.2. Батарея «Скільки годин світла»
```
load_w     = сумма выбранных потребителей:
             світло+інтернет 150, холодильник 150, котел+насос 250, ТВ/ноутбук 150, бойлер 2000, заряджати авто 7000
autonomy_h = capacity_kwh * 1000 * 0.9 (DoD) * 0.95 (инвертор) / load_w
результат: «≈ {round(autonomy_h)} год світла», рекомендуем минимальную ёмкость под выбранные часы
```

### 3.3. СЭС
```
monthly_kwh = из счёта (₴ / тариф) или ввод вручную
kwp         = monthly_kwh * 12 / 1150        // средняя выработка в Украине ≈ 1100–1200 кВт·год на kWp в год
panels      = ceil(kwp * 1000 / 550)          // панель 550 Вт по умолчанию
area_m2     = panels * 2.6
```

### 3.4. Конфигуратор Solar Carport (из референса editorial)
```
places      = 2..100 (шаг 2)
kwp         = round(places * 3.3)
panels      = places * 6
ev_ports    = ceil(places / 2)         // если «з зарядками»
storage_kwh = ceil(places * 5 / 25) * 25   // если «з накопичувачем»
co2_t_year  = round(places * 2.95)     // помечать «*орієнтовно»
```
Все коэффициенты вынести в конфиг (`src/data/calc.json`), чтобы инженер заказчика их уточнил.

## 4. Карточка товара: обязательные поля по уровням

| Уровень | Ключевые характеристики (иконки) |
|---|---|
| Зарядные станции | потужність · роз'єм · фази / вхід від N кВт · кабель · IP · керування |
| Панели | потужність Вт · ККД % · технологія · розмір · вага · гарантія потужності |
| Инверторы | потужність · фази · тип · MPPT · сумісні батареї · Wi-Fi |
| Батареи | ємність кВт·год · напруга · хімія · цикли · масштабування · гарантія |
| Solar Carport | машиномісць · kWp · конструкція · комплектація · строки монтажу |
