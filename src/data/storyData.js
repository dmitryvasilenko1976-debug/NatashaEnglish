export const NATASHA_PORTRAIT = require('../../assets/portraits/natasha.png');

export const CHARACTERS = {
  'Наташа':   { image: require('../../assets/portraits/natasha.png'),   color: '#c0392b' },
  'Корнелиус':{ image: require('../../assets/portraits/cornelius.png'), color: '#2c4a2e' },
  'Лингва':   { image: require('../../assets/portraits/lingua.png'),    color: '#b8975a' },
  'Элеонора': { image: require('../../assets/portraits/eleonora.png'),  color: '#2471a3' },
  'Голем':    { image: require('../../assets/portraits/golem.png'),     color: '#4a3728' },
};

export const ZONES_META = [
  { id: 1, name: 'Начало Пути',           bg: '#f0ebe0', accent: '#3a6b3d' },
  { id: 2, name: 'Лесная Тропа',          bg: '#eaf0e8', accent: '#2c4a2e' },
  { id: 3, name: 'Библиотека Свитков',    bg: '#f7f2e2', accent: '#b8975a' },
  { id: 4, name: 'Храм Испытаний',        bg: '#f2eae2', accent: '#9b2335' },
  { id: 5, name: 'Перевал',               bg: '#eaebf2', accent: '#6b78a8' },
  { id: 6, name: 'Конгресс-Холл',         bg: '#faf5e0', accent: '#c9a84c' },
];

export const OPENING_LETTER = `Доктор Наташа,

Международный Совет Целителей имеет честь пригласить Вас на Всемирный Конгресс Педиатров, который состоится на вершине Пика Знаний.

Мы наслышаны о Вашей преданности маленьким пациентам, но между Вами и передовым мировым опытом всё ещё висит густой туман Языкового Барьера. Вы лечите интуицией и сердцем, но пришло время вооружиться глобальным знанием.

В этом приложении спрятана Волшебная Карта — древний артефакт, который превращает сложные медицинские тексты в ступени к мастерству. Путь будет непрост: Вас ждут ложные друзья переводчика, дебри синтаксиса и суровые испытания лиги практиков.

Но если Вы не сдадитесь, Вы обретёте суперсилу понимать лучших врачей планеты без посредников.

Собирайте свои стетоскопы, коллега. Ваше путешествие начинается.

— Международный Совет Целителей`;

export const LOCATIONS = [
  // ─── ЗОНА 1 — Начало Пути ───────────────────────────────────────────
  {
    name_ru: 'Врата Неизведанного',
    name_en: 'Gates_of_the_Unknown',
    zone: 1, unlock_xp: 0, unlock_condition: null,
    activity: 'tutorial', screen: 'Tutorial', icon: 'map-outline',
    arrival_dialogue: [
      { speaker: 'Наташа',    text: 'Я педиатр, а не Индиана Джонс. Почему билет на конгресс выглядит как портал в другое измерение?' },
      { speaker: 'Корнелиус', text: 'Добро пожаловать, коллега! Язык — это новый континент, и чтобы исцелять лучше, тебе придётся его открыть.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Кажется, я сделала первый шаг. Пока ничего не взорвалось.' },
    ],
    milestone_text: 'Путь в тысячу статей начинается с одного свайпа.',
  },
  {
    name_ru: 'Указатель Первого Свитка',
    name_en: 'Signpost_of_the_First_Scroll',
    zone: 1, unlock_xp: 50, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'book-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Взгляни на этот текст. Не пытайся проглотить его целиком — препарируй предложение за предложением.' },
      { speaker: 'Наташа',    text: 'Мой мозг сейчас похож на желе, но давайте попробуем. Скальпель, то есть... словарь, пожалуйста.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа',    text: 'Ого, я поняла целый абзац про грудное вскармливание без переводчика!' },
      { speaker: 'Корнелиус', text: 'Симптомы понимания налицо. Прогноз благоприятный.' },
    ],
    milestone_text: 'Смысл проступает сквозь туман незнакомых букв.',
  },
  {
    name_ru: 'Шепчущий Куст',
    name_en: 'Whispering_Bush',
    zone: 1, unlock_xp: 100, unlock_condition: null,
    activity: 'vocabulary', screen: 'Review', icon: 'leaf-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Слова — как семена лечебных трав. Возьми одно, посади в память, и оно прорастёт смыслом.' },
      { speaker: 'Наташа', text: 'Ты кто? Галлюцинация от передозировки кофеином?' },
    ],
    completion_dialogue: [
      { speaker: 'Лингва', text: 'Теперь это слово — твоё. Оно отзовётся, когда ты позовёшь.' },
    ],
    milestone_text: 'Первое слово укоренилось в памяти.',
  },

  // ─── ЗОНА 2 — Лесная Тропа ──────────────────────────────────────────
  {
    name_ru: 'Хижина Маленьких Пациентов',
    name_en: 'Cabin_of_Little_Patients',
    zone: 2, unlock_xp: 200, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'home-outline',
    arrival_dialogue: [
      { speaker: 'Наташа',   text: 'Статья про колики. Наконец-то знакомая боль, пусть и на английском.' },
      { speaker: 'Элеонора', text: 'Только не говори, что ты всё ещё переводишь в голове «infant» как «инфант». Ускоряйся!' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Ага, съела, Элеонора? Я прочитала это быстрее, чем младенец выплёвывает брокколи.' },
    ],
    milestone_text: 'Знакомые болезни обретают новые имена.',
  },
  {
    name_ru: 'Сад Целебных Трав',
    name_en: 'Garden_of_Healing_Herbs',
    zone: 2, unlock_xp: 300, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'rose-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Здесь растут тексты о фитотерапии и аллергиях. Осторожно, некоторые фразы вызывают зуд в мозгу.' },
      { speaker: 'Наташа',    text: 'Антигистаминного для души у вас случайно не найдётся?' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Кажется, сыпь непонимания проходит. Текст стал кристально ясен.' },
    ],
    milestone_text: 'Текст больше не вызывает аллергической реакции.',
  },
  {
    name_ru: 'Лихорадочные Топи',
    name_en: 'Feverish_Swamps',
    zone: 2, unlock_xp: 400, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'water-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Здесь жар терминов сбивает с пути. Ищи охлаждающий источник контекста.' },
      { speaker: 'Наташа', text: 'Статья про лихорадку неясного генеза. Я сама сейчас вспыхну от количества новых слов.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Температура спала. Контекст действительно лечит!' },
    ],
    milestone_text: 'Сквозь лихорадку сомнений проступила ясность.',
  },
  {
    name_ru: 'Перекрёсток Выбора',
    name_en: 'Crossroads_of_Choice',
    zone: 2, unlock_xp: 500, unlock_condition: null,
    activity: 'word_quiz', screen: 'QuizSelect', icon: 'git-network-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Тест на словарный запас. Посмотрим, отличишь ли ты «measles» от «mumps».' },
      { speaker: 'Наташа',   text: 'Мои пациенты будут в порядке. А вот твоё эго сейчас может пострадать.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Блестящий диагноз значению слов! Твой лексикон крепнет.' },
    ],
    milestone_text: 'Уверенный выбор — половина успеха лечения.',
  },

  // ─── ЗОНА 3 — Библиотека Свитков ────────────────────────────────────
  {
    name_ru: 'Пещера Ветров',
    name_en: 'Cave_of_Winds',
    zone: 3, unlock_xp: 600, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'cloud-outline',
    arrival_dialogue: [
      { speaker: 'Наташа',    text: 'Сквозняк... О, это же раздел пульмонологии! Бронхиальная астма у детей.' },
      { speaker: 'Корнелиус', text: 'Дыши ровно. Читай в такт дыханию, и длинные абзацы не вызовут одышки.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Вдох-выдох. «Wheezing» — это свистящее дыхание. Я дышу свободно.' },
    ],
    milestone_text: 'Дыхание текста совпало с твоим собственным.',
  },
  {
    name_ru: 'Котёл Пищеварения',
    name_en: 'Cauldron_of_Digestion',
    zone: 3, unlock_xp: 750, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'restaurant-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Гастроэнтерология. Важно не только проглотить информацию, но и усвоить её.' },
      { speaker: 'Наташа', text: 'Главное, чтобы не случилось словесного несварения от обилия герундиев.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Все ферменты памяти сработали отлично. Статья усвоена!' },
    ],
    milestone_text: 'Тяжёлые знания переварились в чистый опыт.',
  },
  {
    name_ru: 'Механическое Сердце',
    name_en: 'Clockwork_Heart',
    zone: 3, unlock_xp: 900, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'heart-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Детская кардиология. Надеюсь, у тебя нет тахикардии перед сложными текстами?' },
      { speaker: 'Наташа',   text: 'Мой пульс 60 в минуту. Я читаю этот текст, как ЭКГ здорового спортсмена.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Твой английский бьётся ровно и сильно, без аритмий.' },
    ],
    milestone_text: 'Пойман идеальный ритм языка.',
  },
  {
    name_ru: 'Лабиринт Нейронов',
    name_en: 'Labyrinth_of_Neurons',
    zone: 3, unlock_xp: 1050, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'pulse-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Неврология. Синапсы английского языка сложны, но логичны. Ищи связи между словами.' },
      { speaker: 'Наташа',    text: 'Если заблужусь — принесите кофеин для стимуляции коры головного мозга.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Я нашла выход! И заодно выучила названия всех черепных нервов на английском.' },
    ],
    milestone_text: 'Новые нейронные связи успешно сформированы.',
  },
  {
    name_ru: 'Крепость Антител',
    name_en: 'Fortress_of_Antibodies',
    zone: 3, unlock_xp: 1200, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'shield-half-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Иммунитет — это память тела. Язык — это память разума. Защищай смыслы.' },
      { speaker: 'Наташа', text: 'Статья по вакцинации. Мой разум готов выработать антитела к невежеству.' },
    ],
    completion_dialogue: [
      { speaker: 'Лингва', text: 'Теперь твой разум защищён от инфекции непонимания.' },
    ],
    milestone_text: 'Выработан стойкий иммунитет к сложным текстам.',
  },
  {
    name_ru: 'Спиральная Башня',
    name_en: 'Spiral_Tower',
    zone: 3, unlock_xp: 1350, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'git-merge-outline',
    arrival_dialogue: [
      { speaker: 'Наташа',    text: 'Генетика. Тексты закручены, как спираль ДНК. Тут без поллитры физраствора не разобраться.' },
      { speaker: 'Корнелиус', text: 'Читай между нуклеотидами, Наташа. Ищи базовые корни слов.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Геном этой статьи полностью расшифрован!' },
    ],
    milestone_text: 'Код языка расшифрован и встроен в ДНК.',
  },
  {
    name_ru: 'Колыбель Рассвета',
    name_en: 'Cradle_of_Dawn',
    zone: 3, unlock_xp: 1500, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'sunny-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Неонатология. Самое хрупкое начало жизни. Справишься с этой терминологией?' },
      { speaker: 'Наташа',   text: 'Я выхаживала недоношенных с весом 800 грамм. Твой текст меня не напугает.' },
    ],
    completion_dialogue: [
      { speaker: 'Элеонора', text: 'Впечатляет. Ты растёшь быстрее, чем я ожидала.' },
    ],
    milestone_text: 'Новое знание бережно выхожено и сохранено.',
  },
  {
    name_ru: 'Весы Гормонов',
    name_en: 'Scales_of_Hormones',
    zone: 3, unlock_xp: 1650, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'scale-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Эндокринология. Одно неверно переведённое слово нарушит весь гомеостаз смысла.' },
      { speaker: 'Наташа',    text: 'Буду взвешивать каждый артикль, профессор.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Баланс найден. Текст понят идеально, уровень стрессовых гормонов в норме.' },
    ],
    milestone_text: 'Достигнут идеальный гомеостаз понимания.',
  },

  // ─── ЗОНА 4 — Храм Испытаний ────────────────────────────────────────
  {
    name_ru: 'Мост Пропущенных Звеньев',
    name_en: 'Bridge_of_Missing_Links',
    zone: 4, unlock_xp: 1800, unlock_condition: null,
    activity: 'cloze_test', screen: 'Cloze', icon: 'git-commit-outline',
    arrival_dialogue: [
      { speaker: 'Голем',   text: 'Обнаружена. Утрата. Текста. Восстанови. Пробелы. Или. Падай. В. Небытие.' },
      { speaker: 'Наташа', text: 'Cloze-тесты. Чувствую себя хирургом, зашивающим разорванную ткань текста.' },
    ],
    completion_dialogue: [
      { speaker: 'Голем', text: 'Целостность. Восстановлена. Проход. Открыт.' },
    ],
    milestone_text: 'Пустоты заполнены, мост смысла восстановлен.',
  },
  {
    name_ru: 'Зеркальный Зал Обмана',
    name_en: 'Hall_of_Deceptive_Mirrors',
    zone: 4, unlock_xp: 2000, unlock_condition: null,
    activity: 'false_friends', screen: 'FalseFriends', icon: 'people-circle-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Добро пожаловать к «ложным друзьям переводчика». Помнишь, как ты лечила «angina» полосканием горла?' },
      { speaker: 'Наташа',   text: 'Это было на первом курсе! Я больше не путаю стенокардию с тонзиллитом!' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: '«Preservative» — это консервант. В медицине иллюзии смертельно опасны.' },
    ],
    milestone_text: 'Внешность слов обманчива, как румянец при лихорадке.',
  },
  {
    name_ru: 'Кузница Синтаксиса',
    name_en: 'Forge_of_Syntax',
    zone: 4, unlock_xp: 2200, unlock_condition: null,
    activity: 'grammar_quiz', screen: 'GrammarQuiz', icon: 'hammer-outline',
    arrival_dialogue: [
      { speaker: 'Голем',   text: 'Правила. Каркас. Мысли. Скуй. Предложение. Правильно.' },
      { speaker: 'Наташа', text: 'Грамматика. Кости языка. Если собрать неправильно, получится Франкенштейн.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Отличный остеосинтез предложения! Всё держится крепко.' },
    ],
    milestone_text: 'Каркас языка стал прочным, как титановый имплант.',
  },
  {
    name_ru: 'Алхимический Стол Корней',
    name_en: 'Alchemy_Table_of_Roots',
    zone: 4, unlock_xp: 2400, unlock_condition: null,
    activity: 'morphology', screen: 'Morphology', icon: 'flask-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Слова можно расщеплять. Приставка, корень, суффикс — это атомы смысла. Смешай их мудро.' },
      { speaker: 'Наташа', text: '«Hepato-» — печень, «-itis» — воспаление. Звучит как кулинарный рецепт.' },
    ],
    completion_dialogue: [
      { speaker: 'Лингва', text: 'Твоя алхимия слов безупречна. Эликсир знания сварен.' },
    ],
    milestone_text: 'Атомы смысла слились в чистое знание.',
  },
  {
    name_ru: 'Колодец Памяти',
    name_en: 'Well_of_Memory',
    zone: 4, unlock_xp: 2600, unlock_condition: null,
    activity: 'review', screen: 'Review', icon: 'sync-circle-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Мозг забывает — это защитный механизм. Но здесь мы используем алгоритм интервальных повторений — лекарство от амнезии!' },
      { speaker: 'Наташа',    text: 'Повторение — мать учения и спонсор моей головной боли. Погружаемся.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Прекрасно! Эти нейронные пути теперь заасфальтированы.' },
    ],
    milestone_text: 'Память очистилась, как родниковая вода.',
  },
  {
    name_ru: 'Арена Практиков',
    name_en: 'Arena_of_Practitioners',
    zone: 4, unlock_xp: 2800, unlock_condition: null,
    activity: 'league', screen: 'League', icon: 'trophy-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Лига! Здесь соревнуются лучшие умы. Сможешь ли ты обойти доктора Смита из Бостона?' },
      { speaker: 'Наташа',   text: 'Я выжила в сезон ОРВИ в районной поликлинике. Твой Смит будет плакать.' },
    ],
    completion_dialogue: [
      { speaker: 'Элеонора', text: 'Твоё место в рейтинге растёт. Кажется, я начинаю тебя уважать.' },
    ],
    milestone_text: 'Соперничество закаляет мастерство.',
  },
  {
    name_ru: 'Зал Триумфа',
    name_en: 'Hall_of_Triumph',
    zone: 4, unlock_xp: 3000, unlock_condition: null,
    activity: 'league', screen: 'League', icon: 'medal-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Конец недели, подведение итогов. Твой клинический случай — победный!' },
      { speaker: 'Наташа',    text: 'Тяжело в учении, легко на обходе. Забираю свои самоцветы.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Теперь я готова к Перевалу. Конгресс уже близко.' },
    ],
    milestone_text: 'Первое признание среди равных.',
  },

  // ─── ЗОНА 5 — Перевал ───────────────────────────────────────────────
  {
    name_ru: 'Врата Усталости',
    name_en: 'Gates_of_Fatigue',
    zone: 5, unlock_xp: 3300, unlock_condition: null,
    activity: 'review', screen: 'Review', icon: 'battery-half-outline',
    arrival_dialogue: [
      { speaker: 'Наташа', text: 'Я устала. Глаза слипаются, слова плывут. Может, ну его, этот конгресс?' },
      { speaker: 'Лингва', text: 'Тьма сгущается перед рассветом. Повтори слова ещё раз, найди в них опору.' },
    ],
    completion_dialogue: [
      { speaker: 'Наташа', text: 'Открылось второе дыхание. Как после удачно проведённой реанимации.' },
    ],
    milestone_text: 'Усталость отступила перед силой воли.',
  },
  {
    name_ru: 'Лагерь Стойкости',
    name_en: 'Camp_of_Resilience',
    zone: 5, unlock_xp: 3600, unlock_condition: 'Стрик 30 дней',
    activity: 'streak', screen: null, icon: 'flame-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Тридцать дней непрерывной работы! Ты превратила обучение из подвига в привычку.' },
      { speaker: 'Наташа',    text: 'Я прихожу сюда каждый день, как на утреннюю пятиминутку. Это стало частью меня.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Твой огонь горит ровно. Ты готова к вершине.' },
    ],
    milestone_text: 'Дисциплина превратилась во вдохновение.',
  },
  {
    name_ru: 'Пик Мастерства',
    name_en: 'Peak_of_Mastery',
    zone: 5, unlock_xp: 4000, unlock_condition: '50 слов на уровне Мастерское',
    activity: 'vocabulary', screen: 'Review', icon: 'star-outline',
    arrival_dialogue: [
      { speaker: 'Лингва',  text: 'Пятьдесят слов стали твоими верными слугами. Они откликаются на мысль, опережая язык.' },
      { speaker: 'Наташа', text: 'Я больше не перевожу. Я просто думаю на этом языке. Невероятное чувство.' },
    ],
    completion_dialogue: [
      { speaker: 'Лингва', text: 'Вершина покорена. Смотри, впереди сияют огни Конгресса.' },
    ],
    milestone_text: 'Слова стали послушными инструментами исцеления.',
  },

  // ─── ЗОНА 6 — Конгресс-Холл ─────────────────────────────────────────
  {
    name_ru: 'Парадный Вход',
    name_en: 'Grand_Entrance',
    zone: 6, unlock_xp: 4300, unlock_condition: null,
    activity: 'reading', screen: 'Home', icon: 'business-outline',
    arrival_dialogue: [
      { speaker: 'Голем',   text: 'Финальная. Проверка. Идентификация. Доктора.' },
      { speaker: 'Наташа', text: 'Доктор Наташа. Педиатр. Читатель свитков, укротитель ложных друзей. Пропускай, гранитный ты мой.' },
    ],
    completion_dialogue: [
      { speaker: 'Голем', text: 'Доступ. Разрешён. Добро. Пожаловать.' },
    ],
    milestone_text: 'Двери мирового медицинского сообщества открыты.',
  },
  {
    name_ru: 'Кулуары Конгресса',
    name_en: 'Corridors_of_Congress',
    zone: 6, unlock_xp: 4600, unlock_condition: null,
    activity: 'cloze_test', screen: 'Cloze', icon: 'chatbubbles-outline',
    arrival_dialogue: [
      { speaker: 'Элеонора', text: 'Готова поддержать small talk о фармакокинетике?' },
      { speaker: 'Наташа',   text: 'С удовольствием. Кстати, отличный доклад у британцев по муковисцидозу, не находишь?' },
    ],
    completion_dialogue: [
      { speaker: 'Элеонора', text: 'Признаю... ты больше не студентка. Ты равная.' },
    ],
    milestone_text: 'Языковой барьер разрушен. Остался только диалог.',
  },
  {
    name_ru: 'Главная Трибуна',
    name_en: 'Main_Podium',
    zone: 6, unlock_xp: 5000, unlock_condition: 'Все статьи прочитаны',
    activity: 'reading', screen: 'Home', icon: 'mic-outline',
    arrival_dialogue: [
      { speaker: 'Корнелиус', text: 'Твой выход, Наташа. Мир готов услышать твой голос. Без переводчиков. Без посредников.' },
      { speaker: 'Наташа',    text: 'Делаю глубокий вдох. Я прошла этот путь ради тех, кто ждёт меня в палатах. Пора говорить.' },
    ],
    completion_dialogue: [
      { speaker: 'Корнелиус', text: 'Блестящая речь, доктор! Исцеляй словом и знанием.' },
    ],
    milestone_text: 'Конец пути — это лишь начало великой практики.',
  },
];
