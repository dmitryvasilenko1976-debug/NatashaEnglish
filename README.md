# NatashaEnglish — Свитки Медицинского Английского

**Приложение для изучения медицинского английского языка.** Читай настоящие медицинские статьи, открывай значения слов, зарабатывай опыт и получай Толкиеновские звания.

🌐 **Живое приложение:** https://natashenglish.vercel.app

---

## Что это

PWA / мобильное приложение на Expo (React Native), работающее в браузере и на телефоне. Написано специально для Наташи — врача, которая учит медицинский английский.

**Ключевая идея:** читаешь настоящие медицинские статьи (PDF), нажимаешь на незнакомое слово — сразу получаешь транскрипцию, перевод, грамматику и контекст. Система геймификации превращает изучение в RPG-путешествие по Средиземью.

---

## Возможности

### Чтение
- Режим "по одному предложению" со свайпом и клавиатурной навигацией (← →)
- Нажми на любое слово — появляется карточка с объяснением
- Слова из кэша (~2300 медицинских терминов) — работает без интернета
- Сохраняй слова в "свиток заклинаний" для повторения
- Пергаментная текстура, шрифт IM Fell English, Толкиеновский стиль

### Геймификация
- **XP и уровни:** Хоббит из Шира → Эру Илуватар (9 уровней)
- **Серия дней:** счётчик активности + максимальная серия
- **Ежедневные квесты:** 3 задания с 4-дневной ротацией (читать / открывать / сохранять)
- **Мастерство слов:** слово меняет цвет в тексте после 10+ и 20+ открытий
- **Достижения:** 14 значков по мотивам Властелина Колец
- **Квиз:** угадай перевод сохранённых слов

### Технические
- Offline-first: все объяснения слов предзагружены в `wordCache.json`
- Работает как PWA в браузере (добавь на экран телефона)
- Импорт статей через PDF (на мобильном устройстве)

---

## Технологии

| Слой | Что используется |
|---|---|
| Framework | Expo SDK ~54, React Native 0.81, React 19 |
| Навигация | React Navigation v7 (Stack) |
| Хранилище | AsyncStorage (offline-first) |
| Шрифты | IM Fell English, Crimson Text, Cinzel (Толкиеновский стиль) |
| Иконки | @expo/vector-icons (Ionicons) |
| Тесты | Jest v29 + jest-expo v56 |
| Деплой | Vercel (expo export -p web → dist/) |
| Парсинг PDF | pdf-parse v2 (PDFParse class API) |

---

## Структура проекта

```
NatashaEnglish/
├── App.js                          # Навигация, загрузка шрифтов
├── index.js                        # Точка входа
├── vercel.json                     # Конфиг деплоя
├── .npmrc                          # legacy-peer-deps=true (для Vercel)
│
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.js        # Стартовый экран со статистикой
│   │   ├── TutorialScreen.js       # Обучение (показывается один раз)
│   │   ├── HomeScreen.js           # Список статей + XP + квесты
│   │   ├── ReadingScreen.js        # Чтение по предложениям + свайп
│   │   ├── QuizSelectScreen.js     # Выбор статьи для квиза
│   │   ├── QuizScreen.js           # Квиз по сохранённым словам
│   │   └── AchievementsScreen.js   # Все достижения
│   │
│   ├── components/
│   │   ├── SentenceBlock.js        # Предложение с кликабельными словами
│   │   ├── WordDrawer.js           # Нижний дровер с объяснением слова
│   │   ├── DailyQuestsPanel.js     # Панель ежедневных заданий
│   │   ├── ArticleCard.js          # Карточка статьи в списке
│   │   ├── AchievementModal.js     # Модал разблокированного достижения
│   │   ├── XPBurst.js              # Анимированный всплеск XP
│   │   └── OrnamentDivider.js      # Декоративный разделитель
│   │
│   ├── services/
│   │   ├── storageService.js       # AsyncStorage: статьи, слова, прогресс, game data
│   │   ├── gamificationService.js  # XP, уровни, квесты, достижения
│   │   └── anthropicService.js     # Поиск слов в wordCache + extractContext()
│   │
│   ├── data/
│   │   ├── wordCache.json          # ~2300 предзагруженных слов с объяснениями
│   │   ├── articles.json           # Предзагруженные статьи (10 статей)
│   │   ├── achievements.js         # Список всех достижений
│   │   └── sampleArticle.js        # Тестовая статья (появляется при первом запуске)
│   │
│   └── theme/
│       └── colors.js               # Палитра: parchment, forestGreen, gold, ink...
│
├── scripts/
│   ├── precompute.js               # Генерация wordCache через LM Studio (локально)
│   ├── export-words-for-chatgpt.js # Экспорт слов батчами для ChatGPT
│   └── import-chatgpt-words.js     # Импорт ответов ChatGPT в wordCache
│
└── __tests__/
    ├── storageService.test.js      # 20 тестов storageService
    └── gamificationService.test.js # 14 тестов gamificationService
```

---

## Локальная разработка

```bash
# Клонировать
git clone https://github.com/dmitryvasilenko1976-debug/NatashaEnglish.git
cd NatashaEnglish

# Установить зависимости
npm install

# Запустить в браузере
npm run web

# Запустить тесты
npm test
```

Открыть http://localhost:8081 в браузере.

---

## Добавление новых статей

**На мобильном устройстве** (кнопка "Добавить свиток"):
1. Открой приложение на телефоне
2. Нажми "+ Добавить свиток" → выбери PDF
3. Статья парсится через `pdf-parse` и добавляется локально

**Для добавления в bundled статьи** (встроены в приложение):
```bash
node scripts/precompute.js путь/к/файлу.pdf
# Добавит статью в src/data/articles.json
```

---

## Обновление кэша слов (через ChatGPT)

Словарный кэш (~2300 слов) можно расширить вручную через ChatGPT-подписку:

```bash
# 1. Найти слова не покрытые кэшем и разбить на батчи
node scripts/export-words-for-chatgpt.js
# → создаёт chatgpt-input/words-part-01.json ... words-part-N.json
# → создаёт chatgpt-input/PROMPT.txt с инструкцией для ChatGPT

# 2. Скопировать PROMPT.txt + words-part-01.json в ChatGPT
# → получить ответ, сохранить как chatgpt-input/chatgpt-response-01.json
# → повторить для каждого батча

# 3. Импортировать ответы в кэш
node scripts/import-chatgpt-words.js
# → обновляет src/data/wordCache.json
```

---

## Деплой на Vercel

```bash
# Первый раз (связать проект)
npx vercel link --yes --scope medical-superpower --project natashenglish

# Деплой
npx vercel --prod
```

Или автоматически через GitHub Actions (при push в master).

Конфиг в `vercel.json`:
```json
{
  "buildCommand": "npx expo export -p web",
  "outputDirectory": "dist",
  "framework": null
}
```

---

## Тесты

```bash
npm test
# 34 теста: 20 storageService + 14 gamificationService
```

Тесты покрывают: геймификацию (XP, уровни, квесты, достижения), хранилище данных (статьи, слова, прогресс, игровые данные, мастерство слов).

---

## Схема данных AsyncStorage

```
'articles'          → [{id, title, tag, sentences[], addedAt}]
'words_{articleId}' → {word: {baseForm, transcription, translation, ...}}
'progress_{id}'     → "42"  (номер текущего предложения)
'gamification'      → {xp, streak, achievements, stats, daily, gems}
'word_mastery'      → {word: lookupCount}
```

---

## Дорожная карта (следующие релизы)

| Релиз | Название | Механики |
|---|---|---|
| I | Искры | Случайные крит. награды, таймер квестов, восстановление серии |
| II | Самоцветы и Щит | Валюта ◈, щит серии, календарная тепловая карта |
| III | Лига и Испытание | Еженедельный вызов, симулированная лига, сердца в квизе |
| IV | Свиток Памяти | Интервальное повторение слов (SRS), экран повторения |
| V | Путь Мастера | Статистика роста, тихий режим, переход к внутренней мотивации |

Подробный план: [CLAUDE.md](CLAUDE.md)

---

## Автор

Создано для Наташи. Разработчик — Dmitry Vasilenko.
