# CLAUDE.md — Контекст для AI-агентов

Этот файл описывает проект NatashaEnglish для Claude и других AI-агентов.
Прочитай полностью перед тем как писать любой код.

---

## Что это за проект

**NatashaEnglish** — Expo (React Native) приложение для изучения медицинского английского. Пользователь — Наташа, врач, которая читает медицинские статьи на английском и учит медицинскую терминологию.

- Работает как PWA в браузере (основной режим) и как мобильное приложение
- Offline-first: все данные в AsyncStorage, объяснения слов предзагружены в JSON
- Деплой: Vercel → https://natashenglish.vercel.app
- Репо: https://github.com/dmitryvasilenko1976-debug/NatashaEnglish

---

## Стек — КРИТИЧНО знать версии

| Пакет | Версия | Примечание |
|---|---|---|
| Expo SDK | ~54.0.0 | НЕ 51, НЕ 52, НЕ 53 |
| React Native | 0.81.5 | |
| React | 19.1.0 | |
| Jest | ^29.7.0 | v30 ломает jest-expo |
| jest-expo | ^56.0.5 | |
| pdf-parse | ^2.4.5 | **v2, не v1** — другой API |
| AsyncStorage | 2.2.0 | из @react-native-async-storage |

**pdf-parse v2 API:**
```js
const { PDFParse } = require('pdf-parse');  // НЕ const pdfParse = require('pdf-parse')
const parser = new PDFParse();
const data = await parser.parse(buffer);
data.text  // текст
```

---

## Архитектурные решения

### Offline-first через wordCache.json
Все объяснения слов предзагружены в `src/data/wordCache.json` (~2300 терминов).
`anthropicService.js` ищет слово в кэше — никаких API-запросов во время работы приложения.

### extractContext() — важно
В `anthropicService.js` есть `extractContext(word, sentence)` — она берёт контекст (слова до/после) из **текущего предложения**, а не из предзагруженного кэша. Это критично: иначе карточка слова показывала бы контекст из другой статьи.

```js
// ПРАВИЛЬНО: всегда переопределяем contextBefore/contextAfter из текущего предложения
const { contextBefore, contextAfter } = sentence
  ? extractContext(word, sentence)
  : { contextBefore: '', contextAfter: '' };
return { ...cacheResult, contextBefore, contextAfter };
```

### Анимация предложений
`ReadingScreen.js` использует `Animated.Value` + `PanResponder`. Нет `ScrollView` — это намеренно, иначе конфликт со свайпом.

**Паттерн animateTo(newIdx, direction):**
1. Старое предложение уезжает в `-direction * dist`
2. Меняем индекс (`setCurrentIdx`)
3. Новое предложение появляется с другой стороны

**Stale closure в keyboard listener:**
Используем refs `handleNextRef` / `handleBackRef` — обновляются каждый рендер, listener регистрируется один раз (`useEffect([], [])`).

### PanResponder порог
```js
onMoveShouldSetPanResponder: (_, { dx, dy }) =>
  Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5
onPanResponderRelease: (_, { dx }) => {
  if (dx < -60) handleNextRef.current?.();
  else if (dx > 60) handleBackRef.current?.();
}
```

---

## Структура файлов

```
App.js                              # Навигатор + загрузка шрифтов
index.js                            # Точка входа

src/
  screens/
    WelcomeScreen.js                # Стартовый экран со статистикой
    TutorialScreen.js               # Туториал (показывается один раз)
    HomeScreen.js                   # Главный: статьи + XP + квесты + уровень
    ReadingScreen.js                # Чтение: свайп, слова, XP, wordMastery
    QuizSelectScreen.js             # Выбор статьи для квиза
    QuizScreen.js                   # Квиз по сохранённым словам
    AchievementsScreen.js           # Все достижения

  components/
    SentenceBlock.js                # Слова в предложении, клик, мастерство (wordMastery prop)
    WordDrawer.js                   # Дровер с объяснением слова + diamonds mastery
    DailyQuestsPanel.js             # 3 карточки квестов с прогресс-барами
    ArticleCard.js                  # Карточка статьи
    AchievementModal.js             # Модал при разблокировке достижения
    XPBurst.js                      # Анимированный всплеск "+2 XP"
    OrnamentDivider.js              # Декоративный разделитель

  services/
    storageService.js               # ВСЁ хранилище: статьи, слова, game data, mastery
    gamificationService.js          # XP, уровни, квесты, достижения, addXP()
    anthropicService.js             # Поиск в wordCache + extractContext()
    pdfService.js                   # Парсинг PDF → статья

  data/
    wordCache.json                  # ~2300 слов [{word, baseForm, transcription, ...}]
    articles.json                   # 10 предзагруженных статей
    achievements.js                 # Константы достижений
    sampleArticle.js                # Демо-статья для первого запуска

  theme/
    colors.js                       # Палитра проекта

scripts/
  precompute.js                     # PDF → articles.json + wordCache (через LM Studio)
  export-words-for-chatgpt.js       # Слова без кэша → батчи для ChatGPT
  import-chatgpt-words.js           # Ответы ChatGPT → wordCache.json

__tests__/
  storageService.test.js            # 20 тестов
  gamificationService.test.js       # 14 тестов
```

---

## Схема AsyncStorage

```
'articles'          → JSON: [{id, title, tag, sentences:string[], addedAt}]
'words_{articleId}' → JSON: {
                        word: {
                          baseForm, transcription, translation, explanation,
                          grammaticalForm, contextBefore, contextAfter, savedAt,
                          srs: {                          // добавляется в Релизе IV
                            interval, nextReview,
                            streak, status: 'new'|'learning'|'review'|'mastered'
                          }
                        }
                      }
'progress_{id}'     → string: "42"
'gamification'      → JSON: {
                        xp: number,
                        gems: number,                    // валюта ◈ (Релиз II)
                        streak: {current, lastDate, max},
                        streakShield: boolean,           // щит серии (Релиз II)
                        hearts: number,                  // сердца для квиза (Релиз III)
                        heartsRestoredAt: number|null,
                        achievements: {[id]: true},
                        stats: {wordsTotal, articlesTotal, quizCorrect},
                        daily: {
                          date: "2026-06-23",
                          sentencesRead, wordsLookedUp, wordsSaved,
                          bonusGranted: string[]
                        },
                        activityLog: {                   // (Релиз II)
                          "2026-06-23": "perfect"|"quests"|"opened"
                        },
                        weeklyChallenge: {               // (Релиз III)
                          weekId, progress, completed, bonusGranted
                        },
                        leagueLevel: number              // (Релиз III)
                      }
'word_mastery'      → JSON: {word: lookupCount}
```

---

## Gamification — ключевые функции

### storageService.js
- `getGameData()` — читает + делает defensive merge + сбрасывает daily при смене дня
- `saveGameData(data)` — сохраняет
- `updateStreak(gameData)` — обновляет серию (вызывать перед saveGameData)
- `getWordMastery()` — `{word: count}`
- `incrementWordMastery(word)` — +1 к счётчику, возвращает новый count

### gamificationService.js
- `getLevelInfo(xp)` → `{level, title, subtitle, prevXP, nextXP, progress}`
- `getDailyQuests(game)` → массив 3 квестов с прогрессом
- `addXP(amount, statUpdates)` → `{xp, newlyUnlocked, newlyCompletedQuests}`
  - `statUpdates` поддерживает кумулятивные: `wordsTotal`, `articlesTotal`, `quizCorrect`
  - и дневные: `sentencesRead`, `wordsLookedUp`, `wordsSaved`
  - автоматически проверяет выполнение квестов и начисляет бонус (один раз в день)
  - defensive init: `if (!game.daily) game.daily = {...}` — защищает тесты с моками

### Уровни (LEVEL_TIERS)
```
0 XP    → Хоббит из Шира
100 XP  → Путник на дороге
300 XP  → Следопыт, Дунэдан Севера
600 XP  → Рыцарь Гондора
1100 XP → Эльф Ривенделла
2000 XP → Майар, дух Средиземья
3500 XP → Истари в сером плаще
6000 XP → Валар, правитель мира
10000XP → Эру Илуватар
```

### Ежедневные квесты (4-дневная ротация)
`getDailySchedule()` — детерминированно по `Math.floor(Date.now() / 86400000) % 4`
Три квеста: `sentencesRead`, `wordsLookedUp`, `wordsSaved`
`bonusGranted[]` в `game.daily` — список уже начисленных квестов (защита от двойного XP)

---

## Мастерство слов

### SentenceBlock.js
Принимает `wordMastery: {word: count}`.
- 10-19 открытий → `familiarWrap` (dotted underline, inkFaint)
- 20+ открытий → `knownWrap` (solid underline, goldLight)

### WordDrawer.js
Принимает `mastery: number`.
- `masteryDiamonds(count)` → строка ◆◆◇◇◇ (5 diamond scale)
- Показывает "Встречено N раз"

---

## Шрифты

Загружаются в `App.js` через `useFonts()`:
- `IMFellEnglish_400Regular` — основной текст статей (21px, lineHeight 40)
- `IMFellEnglish_400Regular_Italic` — выделенное слово
- `CrimsonText_400Regular` — вспомогательный текст
- `CrimsonText_400Regular_Italic` — курсив
- `CrimsonText_600SemiBold` — жирный вспомогательный
- `Cinzel_400Regular` — заголовки, Толкиеновский стиль
- `Cinzel_700Bold` — жирные заголовки

---

## Цветовая палитра (src/theme/colors.js)

```js
parchment:       '#f9f4e7'  // фон (пергамент)
parchmentDark:   '#ede8d8'  // тёмный фон
parchmentBorder: '#e8e0cc'  // граница
forestGreen:     '#2c4a2e'  // хедер, кнопки
forestGreenLight:'#eef3eb'  // светлый зелёный
gold:            '#b8975a'  // акцент (золото)
goldLight:       '#d4b870'  // светлое золото
goldFaint:       '#d4b87040'// прозрачное золото
ink:             '#2c1f0e'  // основной текст
inkMuted:        '#4a3728'  // приглушённый текст
inkFaint:        '#8b6914'  // слабый текст (золотистый)
```

---

## Деплой

### Vercel
```bash
npx vercel --prod
```

`vercel.json`:
```json
{ "buildCommand": "npx expo export -p web", "outputDirectory": "dist", "framework": null }
```

`.npmrc`:
```
legacy-peer-deps=true
```
Нужно из-за конфликта `@react-native/jest-preset@0.86.0` vs `react@19.1.0`.

### Vercel link (если не связан)
```bash
npx vercel link --yes --scope medical-superpower --project natashenglish
```

`.vercel/` папка в `.gitignore` — не коммитится.

---

## Тесты

```bash
npm test
# 34 теста: 20 storageService + 14 gamificationService
```

**ВАЖНО:** Jest v29 + jest-expo v56. НЕ обновлять Jest до v30 — ломает jest-expo.

Тесты в `__tests__/`. При изменении `storageService.js` или `gamificationService.js` — проверять что тесты проходят.

---

## Добавление статей в wordCache

**Через ChatGPT (нет OpenAI API, только веб-подписка):**

```bash
node scripts/export-words-for-chatgpt.js
# → chatgpt-input/words-part-N.json + chatgpt-input/PROMPT.txt
```

Копируй PROMPT.txt и каждый words-part файл в ChatGPT.
Сохрани ответы как `chatgpt-input/chatgpt-response-01.json` и т.д.

```bash
node scripts/import-chatgpt-words.js
# → обновляет src/data/wordCache.json
```

ChatGPT может вернуть JSON в markdown-блоке (```json ... ```) — скрипт импорта автоматически стрипает fence.

---

## Пергаментная текстура (web only)

```js
const PARCHMENT_BG = Platform.OS === 'web'
  ? `url("data:image/svg+xml,...")`  // SVG fractalNoise
  : null;
// Применяется как backgroundImage через inline web style
```

---

## Дорожная карта — Пять релизов

### Релиз I — "Искры" (1-2 дня)
**Механики:** переменные награды ("крит"), таймер квестов, восстановление серии

Файлы:
- `gamificationService.js` — добавить `rollCritical(pct)` → `{isCritical, multiplier}`; `recoverStreak()` (−50 ◈)
- `storageService.js` — добавить `gems: 0` в `defaultGame()`; `checkStreakRecovery(game)` → `{canRecover}`
- `ReadingScreen.js` — в `handleNext()`: вызов `rollCritical(0.25)`, при крите `addXP(8)` + XPBurst с "КРИТИЧЕСКИ!"
- `XPBurst.js` — проп `critical: bool`, другой цвет/размер при крите
- `DailyQuestsPanel.js` — таймер до сброса (`nextMidnight - Date.now()`, обновляется каждую минуту)
- `HomeScreen.js` — баннер восстановления серии если `canRecover === true`

### Релиз II — "Самоцветы и Щит" (2-3 дня)
**Механики:** валюта ◈, щит серии, тепловой календарь активности

Новые файлы:
- `src/components/CalendarHeatmap.js` — сетка 7×5 (35 дней), 4 цвета по типу дня

Изменения:
- `storageService.js` — `streakShield: false`, `activityLog: {}`, `logActivity(type)`, `spendGems()`, `earnGems()`; обновить `updateStreak()` — проверять щит при обрыве
- `gamificationService.js` — `buyStreakShield()` (−30 ◈); начислять ◈ во всех нужных `addXP()` вызовах
- `HomeScreen.js` — `◈ {gems}` в topBar, кнопка щита, CalendarHeatmap в ListHeader
- `ReadingScreen.js` — `earnGems()` при событиях, 15% шанс +1 ◈ при открытии слова

### Релиз III — "Лига и Испытание" (2-3 дня)
**Механики:** еженедельный вызов с FOMO-таймером, симулированная лига, сердца в квизе

Новые файлы:
- `src/services/leagueService.js` — `getLeagueStandings(game)` с детерминированными псевдо-соперниками (seed = weekId * playerId)
- `src/components/LeaguePanel.js` — таблица 10 игроков, Наташа выделена
- `src/components/WeeklyChallengeCard.js` — карточка с прогресс-баром и таймером
- `src/components/HeartsRow.js` — ряд ❤️ в хедере квиза

Изменения:
- `storageService.js` — `hearts: 5`, `heartsRestoredAt`, `weeklyChallenge`, `leagueLevel`, `restoreHearts(game)`
- `gamificationService.js` — `WEEKLY_CHALLENGES[6]`, `getWeeklyChallenge()`, `spendHeart()`, `refillHearts()`
- `QuizScreen.js` — интеграция сердец, GameOver экран при 0, кнопка "Восстановить (20 ◈)"
- `HomeScreen.js` — WeeklyChallengeCard, LeaguePanel в ListHeader

Лиги по порядку: Шир → Ривенделл → Гондор → Рохан → Мория → Валинор

### Релиз IV — "Свиток Памяти" (3-4 дня)
**Механики:** интервальное повторение слов (упрощённый SM-2)

Алгоритм:
- Правильно 1→5 раз: interval = 1, 4, 10, 21, 42 дня; статус: new→learning→review→mastered
- Ошибка: interval = 1, streak = 0

SRS поле в каждом слове: `{ interval, nextReview, streak, status }`

Новые файлы:
- `src/services/srsService.js` — `getWordsForReview()` (сканирует все статьи), `markAnswer()`, `getReviewStats()`
- `src/screens/ReviewScreen.js` — flip-card сессия (max 20 карточек)
- `src/components/ReviewCard.js` — анимация rotateY 210ms, перед/зад

Изменения:
- `storageService.js` — в `saveWord()` добавлять `srs` с дефолтами
- `gamificationService.js` — квест `wordsReviewed` в QUEST_SCHEDULES ротацию
- `data/achievements.js` — достижения за 10/50/100 mastered слов
- `HomeScreen.js` — CTA карточка "К повторению: N слов"
- `App.js` — добавить `ReviewScreen` в Stack.Navigator

### Релиз V — "Путь Мастера" (2 дня)
**Механики:** статистика роста, тихий режим (intrinsic motivation shift)

Новые файлы:
- `src/screens/StatsScreen.js` — скорость чтения, vocab mastery %, дней в пути, лучшая серия

Изменения:
- `storageService.js` — `quietMode: false` в `defaultGame()`
- `ReadingScreen.js` — при `quietMode` пропускать XP/mastery
- `HomeScreen.js` — кнопка тихого режима, кнопка "Твой путь" → StatsScreen
- `App.js` — добавить `StatsScreen` в Stack.Navigator

---

## Известные особенности и ловушки

1. **`.vercel/` не в git** — при первой установке на новой машине нужен `vercel link`.

2. **`@react-native/jest-preset` конфликт** — требует react@^19.2.3, у нас 19.1.0. Решение: `.npmrc` с `legacy-peer-deps=true`. НЕ обновлять react без проверки.

3. **wordCache format** — массив объектов: `[{word, baseForm, ...}]`. Ключ поиска — `word` (lowercase).

4. **Platform.OS === 'web'** — SVG texture, keyboard navigation, speechSynthesis — только web. Всегда проверяй платформу.

5. **Defensive merge в getGameData()** — всегда `{...base, ...stored}`, иначе новые поля схемы не появятся у существующих пользователей.

6. **addXP defensive init** — `if (!game.daily) game.daily = {...}` защищает тесты с моками без поля `daily`.

7. **Шрифты и dev режим** — если шрифты не грузятся, перезапустить с `expo start --clear`.

8. **Римские цифры** — функция `toRoman(n)` локально в ReadingScreen.js, не выносить в утилиты (используется только там).
