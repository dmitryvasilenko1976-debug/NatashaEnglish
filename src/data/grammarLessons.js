export const GRAMMAR_CATEGORIES = [
  {
    id: 'modals',
    title: 'Модальные глаголы',
    icon: 'shield-outline',
    subtitle: 'can, should, may, must...',
    lesson: 'Модальные глаголы не изменяются по лицам и числам, не имеют окончания -s в 3-м лице. После них всегда инфинитив без «to» (кроме ought to).\n\n• can / could — способность, возможность\n• may / might — предположение («может быть»)\n• must — строгая необходимость или уверенный вывод\n• should — рекомендация («следует»)\n• would / will — будущее или условие\n\nВ медицине:\n«Patients should receive...» — Следует назначить...\n«Fever may be present» — Жар может присутствовать.',
    words: ['can', 'could', 'may', 'might', 'must', 'should', 'would', 'will', 'shall', 'need', 'ought'],
  },
  {
    id: 'be',
    title: 'Глагол BE',
    icon: 'git-branch-outline',
    subtitle: 'is, are, was, were, been...',
    lesson: 'BE — самый важный глагол английского языка. Выступает и как смысловой («являться»), и как вспомогательный для пассивного залога.\n\nФормы:\n• Настоящее: am (I), is (he/she/it), are (we/you/they)\n• Прошедшее: was (I/he/she/it), were (we/you/they)\n• Причастия: been (прошедшее), being (настоящее)\n\nПассивный залог в медицине:\n«The patient was treated» — Пациент был пролечен\n«Diagnosis is confirmed» — Диагноз подтверждён\n«Treatment is being administered» — Лечение проводится',
    words: ['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being'],
  },
  {
    id: 'have_do',
    title: 'Глаголы HAVE и DO',
    icon: 'repeat-outline',
    subtitle: 'have, has, had, do, does, did...',
    lesson: 'HAVE образует времена группы Perfect:\n• Present Perfect: have/has + причастие II\n  «The study has shown» — Исследование показало\n• Past Perfect: had + причастие II\n  «Patients had received» — Пациенты уже получили\n\nDO используется в вопросах и отрицаниях:\n• «Do not administer» — Не вводить\n• «Does not improve» — Не улучшается\n• «Did not respond» — Не реагировал\n\nВ пассиве: «Tests were done» — Тесты были выполнены',
    words: ['have', 'has', 'had', 'having', 'do', 'does', 'did', 'done'],
  },
  {
    id: 'irregular',
    title: 'Неправильные глаголы',
    icon: 'flash-outline',
    subtitle: 'find→found, show→shown, take→taken...',
    lesson: 'Неправильные глаголы не образуют прошедшее время с -ed. Нужно знать три формы: основная / прошедшее / причастие II.\n\nЧасто встречаются в медицине:\n• find → found → found (обнаруживать)\n• show → showed → shown (показывать)\n• know → knew → known (знать)\n• take → took → taken (принимать)\n• give → gave → given (давать/вводить)\n• lead → led → led (приводить к)\n\nПричастие II в пассиве и Perfect:\n«Treatment was given» — Лечение было назначено\n«Studies have shown» — Исследования показали',
    words: ['know', 'knew', 'known', 'give', 'gave', 'given', 'find', 'found', 'make', 'made', 'see', 'saw', 'seen', 'show', 'showed', 'shown', 'take', 'took', 'taken', 'come', 'came', 'become', 'became', 'go', 'went', 'gone', 'get', 'got', 'lead', 'led', 'leave', 'left', 'lose', 'lost', 'think', 'thought', 'feel', 'felt', 'keep', 'kept', 'write', 'wrote', 'written', 'understand', 'understood', 'begin', 'began', 'begun', 'grow', 'grew', 'fall', 'fell', 'run', 'ran', 'meet', 'met', 'mean', 'meant', 'tell', 'told'],
  },
  {
    id: 'prepositions',
    title: 'Предлоги',
    icon: 'navigate-outline',
    subtitle: 'of, in, with, by, during, despite...',
    lesson: 'Предлоги не переводятся дословно — их значение зависит от контекста.\n\nКлючевые предлоги в медицине:\n• of — принадлежность: «history of disease» — история болезни\n• in — место/группа: «in children» — у детей\n• with — сопутствующее: «patients with diabetes» — пациенты с диабетом\n• by — причина/средство: «caused by bacteria» — вызванный бактериями\n• during — время: «during treatment» — во время лечения\n• within — пределы: «within 24 hours» — в течение 24 часов\n• despite — уступка: «despite treatment» — несмотря на лечение\n• via — путём: «administered via injection»',
    words: ['of', 'in', 'to', 'for', 'with', 'at', 'by', 'from', 'on', 'as', 'between', 'through', 'during', 'after', 'before', 'under', 'over', 'within', 'without', 'against', 'among', 'around', 'despite', 'into', 'via', 'per', 'versus', 'vs'],
  },
  {
    id: 'conjunctions',
    title: 'Союзы и связки',
    icon: 'link-outline',
    subtitle: 'however, therefore, although, whereas...',
    lesson: 'Союзы соединяют части предложения, связки структурируют научный текст.\n\nОсновные союзы:\n• and — и; but — но; or — или\n• because / since — потому что / так как\n• although / though — хотя\n• if — если; unless — если не\n• while / whereas — тогда как (контраст)\n\nСвязки в медицинских статьях:\n• however — однако (контраст)\n• therefore / thus — поэтому (вывод)\n• furthermore / moreover — кроме того\n• nevertheless — тем не менее\n• whether — является ли, независимо от того',
    words: ['and', 'but', 'or', 'nor', 'if', 'when', 'while', 'because', 'although', 'though', 'unless', 'until', 'since', 'whether', 'however', 'therefore', 'thus', 'hence', 'whereas', 'furthermore', 'moreover', 'nevertheless', 'otherwise', 'either', 'neither', 'both'],
  },
  {
    id: 'articles_pronouns',
    title: 'Артикли и местоимения',
    icon: 'text-outline',
    subtitle: 'the, a, an, it, they, which, who...',
    lesson: 'Артикли:\n• the — определённый (конкретный предмет): «the patient» — конкретный пациент\n• a/an — неопределённый (один из многих): «a patient» — некий пациент; an — перед гласным звуком\n\nВажные местоимения:\n• it / its — оно/его (о состоянии, явлении)\n• they / their / them — они/их (о пациентах)\n• which / who / whose — который (вещь / лицо)\n\nОпределители количества:\n• all — все; some — некоторые; each — каждый\n• many / much — много (исч. / неисч.)\n• several — несколько; various — различные\n• most — большинство; few — мало',
    words: ['the', 'a', 'an', 'it', 'its', 'they', 'their', 'them', 'this', 'that', 'these', 'those', 'we', 'our', 'which', 'who', 'whose', 'what', 'all', 'some', 'any', 'each', 'every', 'several', 'many', 'much', 'few', 'more', 'most', 'less', 'other', 'another', 'same', 'such', 'various', 'certain'],
  },
  {
    id: 'adverbs',
    title: 'Наречия',
    icon: 'speedometer-outline',
    subtitle: 'often, however, significantly, typically...',
    lesson: 'Наречия описывают частоту, степень или образ действия.\n\nЧастота:\n• always — всегда; never — никогда\n• often / frequently / commonly — часто\n• usually / typically / generally — как правило\n• sometimes — иногда; rarely — редко\n\nСтепень:\n• significantly — значительно\n• relatively — относительно\n• approximately — примерно\n• very / quite / rather — очень / довольно\n\nДискурс:\n• also — также; even — даже\n• previously — ранее; recently — недавно\n• subsequently — впоследствии\n• particularly / especially — особенно',
    words: ['also', 'often', 'usually', 'typically', 'generally', 'commonly', 'frequently', 'rarely', 'always', 'never', 'sometimes', 'already', 'still', 'just', 'only', 'mainly', 'primarily', 'particularly', 'especially', 'recently', 'previously', 'subsequently', 'significantly', 'relatively', 'approximately', 'not', 'very', 'quite', 'rather', 'even', 'well'],
  },
];

export const WORD_CATEGORY_MAP = {};
GRAMMAR_CATEGORIES.forEach(cat => {
  cat.words.forEach(w => { WORD_CATEGORY_MAP[w] = cat.id; });
});

export function getCategoryById(id) {
  return GRAMMAR_CATEGORIES.find(c => c.id === id) || null;
}
