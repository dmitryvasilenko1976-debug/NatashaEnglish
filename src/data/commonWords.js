// Базовый словарь служебных слов, модальных глаголов, предлогов и союзов
// Используется как запасной словарь когда слово не найдено в медицинском кэше

const commonWords = {

  // ── МОДАЛЬНЫЕ ГЛАГОЛЫ ────────────────────────────────────────────────────────
  "can": {
    baseForm: "can",
    transcription: "[kæn]",
    grammaticalForm: "модальный глагол",
    translation: "мочь, уметь, иметь возможность",
    explanation: "Выражает способность или возможность. «Symptoms can appear suddenly» — симптомы могут появиться внезапно."
  },
  "could": {
    baseForm: "could",
    transcription: "[kʊd]",
    grammaticalForm: "модальный глагол (прошедшее от can)",
    translation: "мог, мочь (вежливо), мог бы",
    explanation: "Прошедшее время от can, или вежливая/предположительная форма. «This could indicate...» — это может указывать на..."
  },
  "may": {
    baseForm: "may",
    transcription: "[meɪ]",
    grammaticalForm: "модальный глагол",
    translation: "может, возможно, разрешается",
    explanation: "Выражает возможность или разрешение. В медицине часто означает «может быть»: «fever may be present» — жар может присутствовать."
  },
  "might": {
    baseForm: "might",
    transcription: "[maɪt]",
    grammaticalForm: "модальный глагол (прошедшее от may)",
    translation: "мог бы, возможно, мог",
    explanation: "Менее уверенная форма may. «This might suggest...» — это, возможно, указывает на..."
  },
  "must": {
    baseForm: "must",
    transcription: "[mʌst]",
    grammaticalForm: "модальный глагол",
    translation: "должен, необходимо, обязательно",
    explanation: "Выражает строгое обязательство или уверенный вывод. «Diagnosis must be confirmed» — диагноз должен быть подтверждён."
  },
  "should": {
    baseForm: "should",
    transcription: "[ʃʊd]",
    grammaticalForm: "модальный глагол",
    translation: "следует, должен, нужно",
    explanation: "Выражает рекомендацию или совет — мягче, чем must. «Patients should receive treatment» — пациентам следует получить лечение."
  },
  "would": {
    baseForm: "would",
    transcription: "[wʊd]",
    grammaticalForm: "модальный глагол (прошедшее от will)",
    translation: "бы, хотел бы, будет (в прошлом)",
    explanation: "Используется в условных предложениях и вежливых просьбах. «This would suggest...» — это предполагало бы..."
  },
  "will": {
    baseForm: "will",
    transcription: "[wɪl]",
    grammaticalForm: "модальный глагол / вспомогательный глагол будущего времени",
    translation: "будет, буду, будут",
    explanation: "Образует будущее время. «The condition will resolve» — состояние разрешится."
  },
  "shall": {
    baseForm: "shall",
    transcription: "[ʃæl]",
    grammaticalForm: "модальный глагол",
    translation: "должен, следует (официально)",
    explanation: "Официальная/формальная форма будущего. В медицинских текстах редко, чаще в протоколах: «patients shall be monitored» — пациенты должны находиться под наблюдением."
  },
  "need": {
    baseForm: "need",
    transcription: "[niːd]",
    grammaticalForm: "модальный / правильный глагол",
    translation: "нужно, необходимо, потребность",
    explanation: "Как модальный: «need not be treated» — нет необходимости лечить. Как обычный глагол: «the patient needs rest» — пациенту нужен отдых."
  },
  "ought": {
    baseForm: "ought to",
    transcription: "[ɔːt tuː]",
    grammaticalForm: "модальный глагол",
    translation: "следует, должен (по долгу/морально)",
    explanation: "Близко к should, но с оттенком морального долга. «Patients ought to be informed» — пациентов следует информировать."
  },

  // ── ГЛАГОЛ BE ────────────────────────────────────────────────────────────────
  "be": {
    baseForm: "be",
    transcription: "[biː]",
    grammaticalForm: "глагол-связка (инфинитив)",
    translation: "быть, являться",
    explanation: "Основной вспомогательный глагол английского языка. Образует пассивный залог: «is treated», «was diagnosed»."
  },
  "am": {
    baseForm: "be",
    transcription: "[æm]",
    grammaticalForm: "глагол be, 1-е лицо ед.ч. настоящее",
    translation: "являюсь, есть (я)",
    explanation: "Форма глагола be для «I». «I am concerned» — я обеспокоен."
  },
  "is": {
    baseForm: "be",
    transcription: "[ɪz]",
    grammaticalForm: "глагол be, 3-е лицо ед.ч. настоящее",
    translation: "является, есть, находится",
    explanation: "Форма be для he/she/it. «The condition is reversible» — состояние обратимо."
  },
  "are": {
    baseForm: "be",
    transcription: "[ɑːr]",
    grammaticalForm: "глагол be, мн.ч. настоящее",
    translation: "являются, есть, находятся",
    explanation: "Форма be для we/you/they. «Symptoms are present» — симптомы присутствуют."
  },
  "was": {
    baseForm: "be",
    transcription: "[wɒz]",
    grammaticalForm: "глагол be, прошедшее время ед.ч.",
    translation: "был, была, находился",
    explanation: "Прошедшее время be для I/he/she/it. «The patient was admitted» — пациент был госпитализирован."
  },
  "were": {
    baseForm: "be",
    transcription: "[wɜːr]",
    grammaticalForm: "глагол be, прошедшее время мн.ч.",
    translation: "были, находились",
    explanation: "Прошедшее время be для we/you/they. «Patients were treated» — пациенты были пролечены."
  },
  "been": {
    baseForm: "be",
    transcription: "[biːn]",
    grammaticalForm: "глагол be, причастие прошедшего времени",
    translation: "был, была, были (в составных временах)",
    explanation: "Причастие II от be. Используется в Present/Past Perfect: «has been reported» — было сообщено."
  },
  "being": {
    baseForm: "be",
    transcription: "[ˈbiːɪŋ]",
    grammaticalForm: "глагол be, причастие настоящего времени",
    translation: "являясь, будучи",
    explanation: "Причастие I от be. «Being a common condition...» — являясь распространённым состоянием..."
  },

  // ── ГЛАГОЛ HAVE ──────────────────────────────────────────────────────────────
  "have": {
    baseForm: "have",
    transcription: "[hæv]",
    grammaticalForm: "вспомогательный / смысловой глагол",
    translation: "иметь, обладать; вспомогательный для Perfect",
    explanation: "Образует времена группы Perfect: «have developed» — развили. Как смысловой: «patients have fever» — у пациентов жар."
  },
  "has": {
    baseForm: "have",
    transcription: "[hæz]",
    grammaticalForm: "вспомогательный глагол, 3-е лицо ед.ч.",
    translation: "имеет, есть; вспомогательный для Perfect",
    explanation: "Форма have для he/she/it. «The study has shown» — исследование показало."
  },
  "had": {
    baseForm: "have",
    transcription: "[hæd]",
    grammaticalForm: "вспомогательный / смысловой глагол, прошедшее время",
    translation: "имел, было; вспомогательный для Past Perfect",
    explanation: "Прошедшее время have. «Patients had experienced» — пациенты испытали (до другого события)."
  },
  "having": {
    baseForm: "have",
    transcription: "[ˈhævɪŋ]",
    grammaticalForm: "причастие настоящего времени от have",
    translation: "имея, обладая",
    explanation: "«Having received treatment...» — получив лечение..."
  },

  // ── ГЛАГОЛ DO ────────────────────────────────────────────────────────────────
  "do": {
    baseForm: "do",
    transcription: "[duː]",
    grammaticalForm: "вспомогательный / смысловой глагол",
    translation: "делать; вспомогательный для вопросов и отрицаний",
    explanation: "«Do not administer» — не вводить. «Does not respond» — не реагирует."
  },
  "does": {
    baseForm: "do",
    transcription: "[dʌz]",
    grammaticalForm: "вспомогательный глагол, 3-е лицо ед.ч.",
    translation: "делает; вспомогательный для вопросов/отрицаний",
    explanation: "Форма do для he/she/it. «does not improve» — не улучшается."
  },
  "did": {
    baseForm: "do",
    transcription: "[dɪd]",
    grammaticalForm: "вспомогательный / смысловой глагол, прошедшее время",
    translation: "сделал, делал",
    explanation: "Прошедшее время do. «did not respond» — не реагировал."
  },
  "done": {
    baseForm: "do",
    transcription: "[dʌn]",
    grammaticalForm: "причастие прошедшего времени от do",
    translation: "сделанный, выполненный",
    explanation: "«Tests were done» — тесты были выполнены."
  },

  // ── НЕПРАВИЛЬНЫЕ ГЛАГОЛЫ (формы) ────────────────────────────────────────────
  "know": {
    baseForm: "know",
    transcription: "[nəʊ]",
    grammaticalForm: "глагол неправильный (know–knew–known)",
    translation: "знать",
    explanation: "«It is known that...» — известно, что..."
  },
  "knew": {
    baseForm: "know",
    transcription: "[njuː]",
    grammaticalForm: "глагол, прошедшее время от know",
    translation: "знал, знала",
    explanation: "Прошедшее время от know. «We knew the risk» — мы знали о риске."
  },
  "known": {
    baseForm: "know",
    transcription: "[nəʊn]",
    grammaticalForm: "причастие прошедшего времени от know",
    translation: "известный, известно",
    explanation: "«A known risk factor» — известный фактор риска. «It has been known» — это было известно."
  },
  "give": {
    baseForm: "give",
    transcription: "[ɡɪv]",
    grammaticalForm: "глагол неправильный (give–gave–given)",
    translation: "давать, вводить",
    explanation: "В медицине: «give medication» — давать лекарство, «give injection» — делать инъекцию."
  },
  "gave": {
    baseForm: "give",
    transcription: "[ɡeɪv]",
    grammaticalForm: "глагол, прошедшее время от give",
    translation: "дал, дала, ввёл",
    explanation: "«Doctors gave antibiotics» — врачи назначили антибиотики."
  },
  "given": {
    baseForm: "give",
    transcription: "[ˈɡɪvən]",
    grammaticalForm: "причастие прошедшего времени от give",
    translation: "данный, введённый; учитывая",
    explanation: "«Medication was given» — лекарство было введено. «Given the findings...» — учитывая результаты..."
  },
  "find": {
    baseForm: "find",
    transcription: "[faɪnd]",
    grammaticalForm: "глагол неправильный (find–found–found)",
    translation: "находить, обнаруживать",
    explanation: "«Studies find that...» — исследования обнаруживают, что..."
  },
  "found": {
    baseForm: "find",
    transcription: "[faʊnd]",
    grammaticalForm: "прошедшее время и причастие от find",
    translation: "нашёл, обнаружен, найдено",
    explanation: "«No pathology was found» — патологии не обнаружено. «We found that...» — мы обнаружили, что..."
  },
  "make": {
    baseForm: "make",
    transcription: "[meɪk]",
    grammaticalForm: "глагол неправильный (make–made–made)",
    translation: "делать, составлять, ставить (диагноз)",
    explanation: "«Make a diagnosis» — поставить диагноз. «Make a decision» — принять решение."
  },
  "made": {
    baseForm: "make",
    transcription: "[meɪd]",
    grammaticalForm: "прошедшее время и причастие от make",
    translation: "сделал, составлен, поставлен",
    explanation: "«Diagnosis was made» — диагноз был поставлен."
  },
  "see": {
    baseForm: "see",
    transcription: "[siː]",
    grammaticalForm: "глагол неправильный (see–saw–seen)",
    translation: "видеть, наблюдать",
    explanation: "«We see this pattern» — мы наблюдаем эту картину."
  },
  "saw": {
    baseForm: "see",
    transcription: "[sɔː]",
    grammaticalForm: "глагол, прошедшее время от see",
    translation: "видел, наблюдал",
    explanation: "«We saw improvement» — мы наблюдали улучшение."
  },
  "seen": {
    baseForm: "see",
    transcription: "[siːn]",
    grammaticalForm: "причастие прошедшего времени от see",
    translation: "виденный, наблюдаемый",
    explanation: "«Changes seen on X-ray» — изменения, наблюдаемые на рентгене."
  },
  "show": {
    baseForm: "show",
    transcription: "[ʃəʊ]",
    grammaticalForm: "глагол (show–showed–shown)",
    translation: "показывать, демонстрировать",
    explanation: "«Studies show that...» — исследования показывают, что..."
  },
  "showed": {
    baseForm: "show",
    transcription: "[ʃəʊd]",
    grammaticalForm: "глагол, прошедшее время от show",
    translation: "показал, продемонстрировал",
    explanation: "«Results showed improvement» — результаты показали улучшение."
  },
  "shown": {
    baseForm: "show",
    transcription: "[ʃəʊn]",
    grammaticalForm: "причастие прошедшего времени от show",
    translation: "показанный, продемонстрированный",
    explanation: "«As shown in the table» — как показано в таблице."
  },
  "take": {
    baseForm: "take",
    transcription: "[teɪk]",
    grammaticalForm: "глагол неправильный (take–took–taken)",
    translation: "принимать, брать",
    explanation: "«Take medication» — принимать лекарство. «Take a biopsy» — взять биопсию."
  },
  "took": {
    baseForm: "take",
    transcription: "[tʊk]",
    grammaticalForm: "глагол, прошедшее время от take",
    translation: "принял, взял",
    explanation: "«Patients took antibiotics» — пациенты принимали антибиотики."
  },
  "taken": {
    baseForm: "take",
    transcription: "[ˈteɪkən]",
    grammaticalForm: "причастие прошедшего времени от take",
    translation: "принятый, взятый",
    explanation: "«Samples were taken» — образцы были взяты."
  },
  "come": {
    baseForm: "come",
    transcription: "[kʌm]",
    grammaticalForm: "глагол неправильный (come–came–come)",
    translation: "приходить, поступать",
    explanation: "«Patients come to the clinic» — пациенты обращаются в клинику."
  },
  "came": {
    baseForm: "come",
    transcription: "[keɪm]",
    grammaticalForm: "глагол, прошедшее время от come",
    translation: "пришёл, поступил",
    explanation: "«The patient came with complaints» — пациент поступил с жалобами."
  },
  "become": {
    baseForm: "become",
    transcription: "[bɪˈkʌm]",
    grammaticalForm: "глагол неправильный (become–became–become)",
    translation: "становиться, развиваться",
    explanation: "«The condition may become chronic» — состояние может стать хроническим."
  },
  "became": {
    baseForm: "become",
    transcription: "[bɪˈkeɪm]",
    grammaticalForm: "глагол, прошедшее время от become",
    translation: "стал, стала",
    explanation: "«Symptoms became severe» — симптомы стали тяжёлыми."
  },
  "go": {
    baseForm: "go",
    transcription: "[ɡəʊ]",
    grammaticalForm: "глагол неправильный (go–went–gone)",
    translation: "идти, переходить",
    explanation: "«Go into remission» — войти в ремиссию."
  },
  "went": {
    baseForm: "go",
    transcription: "[went]",
    grammaticalForm: "глагол, прошедшее время от go",
    translation: "пошёл, перешёл",
    explanation: "«Infection went undetected» — инфекция осталась незамеченной."
  },
  "gone": {
    baseForm: "go",
    transcription: "[ɡɒn]",
    grammaticalForm: "причастие прошедшего времени от go",
    translation: "ушедший, прошедший",
    explanation: "«The fever has gone» — жар прошёл."
  },
  "get": {
    baseForm: "get",
    transcription: "[ɡet]",
    grammaticalForm: "глагол неправильный (get–got–gotten/got)",
    translation: "получать, становиться",
    explanation: "«Get worse» — ухудшаться. «Get better» — улучшаться."
  },
  "got": {
    baseForm: "get",
    transcription: "[ɡɒt]",
    grammaticalForm: "прошедшее время от get",
    translation: "получил, стал",
    explanation: "«The patient got worse» — состояние пациента ухудшилось."
  },
  "gotten": {
    baseForm: "get",
    transcription: "[ˈɡɒtən]",
    grammaticalForm: "причастие прошедшего времени от get (AmE)",
    translation: "получивший, ставший",
    explanation: "«Has gotten worse» — стало хуже (американский вариант)."
  },
  "lead": {
    baseForm: "lead",
    transcription: "[liːd]",
    grammaticalForm: "глагол неправильный (lead–led–led)",
    translation: "приводить к, вести к",
    explanation: "«This can lead to complications» — это может привести к осложнениям."
  },
  "led": {
    baseForm: "lead",
    transcription: "[led]",
    grammaticalForm: "прошедшее время и причастие от lead",
    translation: "привёл к, что привело к",
    explanation: "«Inflammation led to scarring» — воспаление привело к рубцеванию."
  },
  "leave": {
    baseForm: "leave",
    transcription: "[liːv]",
    grammaticalForm: "глагол неправильный (leave–left–left)",
    translation: "оставлять, покидать",
    explanation: "«Leave untreated» — оставить без лечения."
  },
  "left": {
    baseForm: "leave",
    transcription: "[left]",
    grammaticalForm: "прошедшее время и причастие от leave; также прилагательное",
    translation: "оставил; левый (сторона)",
    explanation: "«Left untreated, the condition...» — оставленное без лечения, состояние... Или: «left side» — левая сторона."
  },
  "lose": {
    baseForm: "lose",
    transcription: "[luːz]",
    grammaticalForm: "глагол неправильный (lose–lost–lost)",
    translation: "терять, утрачивать",
    explanation: "«Lose consciousness» — потерять сознание. «Lose weight» — терять вес."
  },
  "lost": {
    baseForm: "lose",
    transcription: "[lɒst]",
    grammaticalForm: "прошедшее время и причастие от lose",
    translation: "потерял, утраченный",
    explanation: "«Lost consciousness» — потерял сознание. «Lost to follow-up» — выбыл из наблюдения."
  },
  "think": {
    baseForm: "think",
    transcription: "[θɪŋk]",
    grammaticalForm: "глагол неправильный (think–thought–thought)",
    translation: "думать, считать",
    explanation: "«It is thought that...» — считается, что..."
  },
  "thought": {
    baseForm: "think",
    transcription: "[θɔːt]",
    grammaticalForm: "прошедшее время и причастие от think",
    translation: "думал; считавшийся",
    explanation: "«Previously thought to be rare» — ранее считавшийся редким."
  },
  "mean": {
    baseForm: "mean",
    transcription: "[miːn]",
    grammaticalForm: "глагол неправильный (mean–meant–meant)",
    translation: "означать, подразумевать",
    explanation: "«This means that...» — это означает, что..."
  },
  "meant": {
    baseForm: "mean",
    transcription: "[ment]",
    grammaticalForm: "прошедшее время и причастие от mean",
    translation: "означал, предназначенный",
    explanation: "«Meant to assess...» — предназначенный для оценки..."
  },
  "tell": {
    baseForm: "tell",
    transcription: "[tel]",
    grammaticalForm: "глагол неправильный (tell–told–told)",
    translation: "говорить, сообщать",
    explanation: "«Tell the patient» — сообщить пациенту."
  },
  "told": {
    baseForm: "tell",
    transcription: "[təʊld]",
    grammaticalForm: "прошедшее время и причастие от tell",
    translation: "сказал, сообщённый",
    explanation: "«Patients were told to avoid...» — пациентам было сказано избегать..."
  },
  "feel": {
    baseForm: "feel",
    transcription: "[fiːl]",
    grammaticalForm: "глагол неправильный (feel–felt–felt)",
    translation: "чувствовать, ощущать",
    explanation: "«Patients feel pain» — пациенты чувствуют боль."
  },
  "felt": {
    baseForm: "feel",
    transcription: "[felt]",
    grammaticalForm: "прошедшее время и причастие от feel",
    translation: "чувствовал, ощущался",
    explanation: "«Pain was felt in the chest» — боль ощущалась в грудной клетке."
  },
  "keep": {
    baseForm: "keep",
    transcription: "[kiːp]",
    grammaticalForm: "глагол неправильный (keep–kept–kept)",
    translation: "сохранять, поддерживать, держать",
    explanation: "«Keep records» — вести записи. «Keep under observation» — держать под наблюдением."
  },
  "kept": {
    baseForm: "keep",
    transcription: "[kept]",
    grammaticalForm: "прошедшее время и причастие от keep",
    translation: "сохранял, поддерживался",
    explanation: "«Patients were kept under monitoring» — пациенты находились под мониторингом."
  },
  "hold": {
    baseForm: "hold",
    transcription: "[həʊld]",
    grammaticalForm: "глагол неправильный (hold–held–held)",
    translation: "держать, содержать, проводить",
    explanation: "«Hold medication» — отменить лекарство. «Hold true» — оставаться верным."
  },
  "held": {
    baseForm: "hold",
    transcription: "[held]",
    grammaticalForm: "прошедшее время и причастие от hold",
    translation: "держал, проводился",
    explanation: "«Study was held» — исследование было проведено."
  },
  "put": {
    baseForm: "put",
    transcription: "[pʊt]",
    grammaticalForm: "глагол неправильный (put–put–put)",
    translation: "помещать, ставить, назначать",
    explanation: "«Put on medication» — назначить лекарство. «Put at risk» — подвергать риску."
  },
  "run": {
    baseForm: "run",
    transcription: "[rʌn]",
    grammaticalForm: "глагол неправильный (run–ran–run)",
    translation: "проводить (тест), течь",
    explanation: "«Run tests» — проводить тесты. «Run a trial» — проводить испытание."
  },
  "ran": {
    baseForm: "run",
    transcription: "[ræn]",
    grammaticalForm: "глагол, прошедшее время от run",
    translation: "провёл (тест), пробежал",
    explanation: "«Researchers ran a clinical trial» — исследователи провели клиническое испытание."
  },
  "set": {
    baseForm: "set",
    transcription: "[set]",
    grammaticalForm: "глагол неправильный (set–set–set)",
    translation: "устанавливать, задавать",
    explanation: "«Set a threshold» — установить порог. «Onset» (начало) содержит этот корень."
  },
  "begin": {
    baseForm: "begin",
    transcription: "[bɪˈɡɪn]",
    grammaticalForm: "глагол неправильный (begin–began–begun)",
    translation: "начинать, начинаться",
    explanation: "«Symptoms begin suddenly» — симптомы начинаются внезапно."
  },
  "began": {
    baseForm: "begin",
    transcription: "[bɪˈɡæn]",
    grammaticalForm: "глагол, прошедшее время от begin",
    translation: "начал, началось",
    explanation: "«Treatment began immediately» — лечение началось немедленно."
  },
  "begun": {
    baseForm: "begin",
    transcription: "[bɪˈɡʌn]",
    grammaticalForm: "причастие прошедшего времени от begin",
    translation: "начатый, начавшийся",
    explanation: "«Therapy has begun» — терапия началась."
  },
  "grow": {
    baseForm: "grow",
    transcription: "[ɡrəʊ]",
    grammaticalForm: "глагол неправильный (grow–grew–grown)",
    translation: "расти, увеличиваться",
    explanation: "«Bacteria grow» — бактерии растут."
  },
  "grew": {
    baseForm: "grow",
    transcription: "[ɡruː]",
    grammaticalForm: "глагол, прошедшее время от grow",
    translation: "рос, увеличивался",
    explanation: "«The tumor grew» — опухоль росла."
  },
  "grown": {
    baseForm: "grow",
    transcription: "[ɡrəʊn]",
    grammaticalForm: "причастие прошедшего времени от grow",
    translation: "выросший, grown",
    explanation: "«Has grown significantly» — значительно увеличился."
  },
  "fall": {
    baseForm: "fall",
    transcription: "[fɔːl]",
    grammaticalForm: "глагол неправильный (fall–fell–fallen)",
    translation: "падать, снижаться",
    explanation: "«Pressure falls» — давление падает."
  },
  "fell": {
    baseForm: "fall",
    transcription: "[fel]",
    grammaticalForm: "глагол, прошедшее время от fall",
    translation: "упал, снизился",
    explanation: "«Blood pressure fell» — артериальное давление снизилось."
  },
  "fallen": {
    baseForm: "fall",
    transcription: "[ˈfɔːlən]",
    grammaticalForm: "причастие прошедшего времени от fall",
    translation: "упавший, сниженный",
    explanation: "«Levels have fallen» — уровни снизились."
  },
  "write": {
    baseForm: "write",
    transcription: "[raɪt]",
    grammaticalForm: "глагол неправильный (write–wrote–written)",
    translation: "писать, назначать (рецепт)",
    explanation: "«Write a prescription» — выписать рецепт."
  },
  "wrote": {
    baseForm: "write",
    transcription: "[rəʊt]",
    grammaticalForm: "глагол, прошедшее время от write",
    translation: "написал, выписал",
    explanation: "«The doctor wrote a prescription» — врач выписал рецепт."
  },
  "written": {
    baseForm: "write",
    transcription: "[ˈrɪtən]",
    grammaticalForm: "причастие прошедшего времени от write",
    translation: "написанный, выписанный",
    explanation: "«Written consent» — письменное согласие."
  },
  "choose": {
    baseForm: "choose",
    transcription: "[tʃuːz]",
    grammaticalForm: "глагол неправильный (choose–chose–chosen)",
    translation: "выбирать",
    explanation: "«Choose a treatment» — выбрать лечение."
  },
  "chose": {
    baseForm: "choose",
    transcription: "[tʃəʊz]",
    grammaticalForm: "глагол, прошедшее время от choose",
    translation: "выбрал",
    explanation: "«Clinicians chose antibiotics» — клиницисты выбрали антибиотики."
  },
  "chosen": {
    baseForm: "choose",
    transcription: "[ˈtʃəʊzən]",
    grammaticalForm: "причастие прошедшего времени от choose",
    translation: "выбранный",
    explanation: "«The chosen treatment» — выбранное лечение."
  },
  "understand": {
    baseForm: "understand",
    transcription: "[ˌʌndəˈstænd]",
    grammaticalForm: "глагол неправильный (understand–understood–understood)",
    translation: "понимать",
    explanation: "«It is not yet fully understood» — это ещё не полностью понято/изучено."
  },
  "understood": {
    baseForm: "understand",
    transcription: "[ˌʌndəˈstʊd]",
    grammaticalForm: "прошедшее время и причастие от understand",
    translation: "понял; понятый, изученный",
    explanation: "«A well-understood mechanism» — хорошо изученный механизм."
  },
  "arise": {
    baseForm: "arise",
    transcription: "[əˈraɪz]",
    grammaticalForm: "глагол неправильный (arise–arose–arisen)",
    translation: "возникать, появляться",
    explanation: "«Complications may arise» — могут возникнуть осложнения."
  },
  "arose": {
    baseForm: "arise",
    transcription: "[əˈrəʊz]",
    grammaticalForm: "глагол, прошедшее время от arise",
    translation: "возник, появился",
    explanation: "«Resistance arose» — развилась резистентность."
  },
  "arisen": {
    baseForm: "arise",
    transcription: "[əˈrɪzən]",
    grammaticalForm: "причастие прошедшего времени от arise",
    translation: "возникший",
    explanation: "«Problems that have arisen» — возникшие проблемы."
  },
  "meet": {
    baseForm: "meet",
    transcription: "[miːt]",
    grammaticalForm: "глагол неправильный (meet–met–met)",
    translation: "соответствовать, встречаться",
    explanation: "«Meet criteria» — соответствовать критериям."
  },
  "met": {
    baseForm: "meet",
    transcription: "[met]",
    grammaticalForm: "прошедшее время и причастие от meet",
    translation: "соответствовал; встретил",
    explanation: "«Criteria were met» — критерии были соблюдены."
  },
  "win": {
    baseForm: "win",
    transcription: "[wɪn]",
    grammaticalForm: "глагол неправильный (win–won–won)",
    translation: "побеждать",
    explanation: "«Win the battle against infection» — победить инфекцию."
  },
  "won": {
    baseForm: "win",
    transcription: "[wʌn]",
    grammaticalForm: "прошедшее время и причастие от win",
    translation: "победил",
    explanation: "«Won regulatory approval» — получил одобрение регулятора."
  },
  "spread": {
    baseForm: "spread",
    transcription: "[spred]",
    grammaticalForm: "глагол неправильный (spread–spread–spread)",
    translation: "распространяться, распространять",
    explanation: "«Infection spreads through droplets» — инфекция передаётся воздушно-капельным путём."
  },
  "cut": {
    baseForm: "cut",
    transcription: "[kʌt]",
    grammaticalForm: "глагол неправильный (cut–cut–cut)",
    translation: "разрезать, сокращать",
    explanation: "«Cut the dose» — снизить дозу."
  },

  // ── АРТИКЛИ И МЕСТОИМЕНИЯ ────────────────────────────────────────────────────
  "the": {
    baseForm: "the",
    transcription: "[ðə] / [ðiː]",
    grammaticalForm: "определённый артикль",
    translation: "этот, та, то (определённый)",
    explanation: "Определённый артикль — указывает на конкретный предмет. «The patient» — конкретный пациент (о котором уже шла речь)."
  },
  "a": {
    baseForm: "a",
    transcription: "[ə]",
    grammaticalForm: "неопределённый артикль",
    translation: "один, какой-то, некий",
    explanation: "Неопределённый артикль — первое упоминание или один из многих. «A patient» — какой-то пациент, один из."
  },
  "an": {
    baseForm: "an",
    transcription: "[æn]",
    grammaticalForm: "неопределённый артикль (перед гласным звуком)",
    translation: "один, какой-то",
    explanation: "Форма артикля «a» перед гласным звуком. «An infection» — инфекция."
  },
  "it": {
    baseForm: "it",
    transcription: "[ɪt]",
    grammaticalForm: "местоимение 3-е лицо ед.ч. ср.р.",
    translation: "оно, это",
    explanation: "«It is important to note» — важно отметить. «It has been shown» — было показано."
  },
  "its": {
    baseForm: "it",
    transcription: "[ɪts]",
    grammaticalForm: "притяжательное местоимение от it",
    translation: "его, её, своё",
    explanation: "«The disease and its complications» — болезнь и её осложнения."
  },
  "they": {
    baseForm: "they",
    transcription: "[ðeɪ]",
    grammaticalForm: "местоимение 3-е лицо мн.ч.",
    translation: "они",
    explanation: "«Patients were enrolled; they received treatment» — пациентов включили; они получили лечение."
  },
  "their": {
    baseForm: "they",
    transcription: "[ðeər]",
    grammaticalForm: "притяжательное местоимение от they",
    translation: "их, свои",
    explanation: "«Patients and their families» — пациенты и их семьи."
  },
  "them": {
    baseForm: "they",
    transcription: "[ðem]",
    grammaticalForm: "объектный падеж от they",
    translation: "их, им",
    explanation: "«We treated them» — мы их лечили."
  },
  "this": {
    baseForm: "this",
    transcription: "[ðɪs]",
    grammaticalForm: "указательное местоимение / прилагательное",
    translation: "этот, эта, это",
    explanation: "«This condition» — это состояние. «This suggests» — это предполагает."
  },
  "that": {
    baseForm: "that",
    transcription: "[ðæt]",
    grammaticalForm: "указательное местоимение / союз",
    translation: "тот, та, то; что (союз)",
    explanation: "«It is known that...» — известно, что... «That patient» — тот пациент."
  },
  "these": {
    baseForm: "these",
    transcription: "[ðiːz]",
    grammaticalForm: "указательное местоимение мн.ч.",
    translation: "эти",
    explanation: "«These findings» — эти результаты."
  },
  "those": {
    baseForm: "those",
    transcription: "[ðəʊz]",
    grammaticalForm: "указательное местоимение мн.ч.",
    translation: "те",
    explanation: "«Those patients who...» — те пациенты, которые..."
  },
  "we": {
    baseForm: "we",
    transcription: "[wiː]",
    grammaticalForm: "местоимение 1-е лицо мн.ч.",
    translation: "мы",
    explanation: "В научных текстах авторы часто пишут «we» вместо «researchers»: «We found that...» — мы обнаружили, что..."
  },
  "our": {
    baseForm: "we",
    transcription: "[aʊər]",
    grammaticalForm: "притяжательное местоимение от we",
    translation: "наш, наши",
    explanation: "«Our study» — наше исследование."
  },
  "which": {
    baseForm: "which",
    transcription: "[wɪtʃ]",
    grammaticalForm: "относительное местоимение / союз",
    translation: "который, которая, которое",
    explanation: "«A condition which affects...» — состояние, которое влияет на..."
  },
  "who": {
    baseForm: "who",
    transcription: "[huː]",
    grammaticalForm: "относительное местоимение (для людей)",
    translation: "который, кто",
    explanation: "«Patients who received treatment» — пациенты, которые получили лечение."
  },
  "whose": {
    baseForm: "whose",
    transcription: "[huːz]",
    grammaticalForm: "притяжательное относительное местоимение",
    translation: "чей, которого",
    explanation: "«Patients whose symptoms persisted» — пациенты, у которых симптомы сохранялись."
  },
  "what": {
    baseForm: "what",
    transcription: "[wɒt]",
    grammaticalForm: "местоимение / союз",
    translation: "что, какой",
    explanation: "«What causes this?» — что это вызывает? «What is known» — то, что известно."
  },

  // ── ПРЕДЛОГИ ─────────────────────────────────────────────────────────────────
  "of": {
    baseForm: "of",
    transcription: "[əv] / [ɒv]",
    grammaticalForm: "предлог",
    translation: "из, у, от, принадлежности",
    explanation: "Самый частый предлог. Выражает принадлежность и состав. «History of disease» — история болезни. «Signs of infection» — признаки инфекции."
  },
  "in": {
    baseForm: "in",
    transcription: "[ɪn]",
    grammaticalForm: "предлог",
    translation: "в, во, при, у",
    explanation: "«Pain in the chest» — боль в грудной клетке. «In children» — у детей. «In 2023» — в 2023 году."
  },
  "to": {
    baseForm: "to",
    transcription: "[tuː] / [tə]",
    grammaticalForm: "предлог / частица инфинитива",
    translation: "к, в, до; знак инфинитива",
    explanation: "«Lead to complications» — приводить к осложнениям. «To treat» — лечить (инфинитив)."
  },
  "for": {
    baseForm: "for",
    transcription: "[fɔːr]",
    grammaticalForm: "предлог / союз",
    translation: "для, в течение, за",
    explanation: "«Treatment for infection» — лечение инфекции. «For 3 days» — в течение 3 дней."
  },
  "with": {
    baseForm: "with",
    transcription: "[wɪð]",
    grammaticalForm: "предлог",
    translation: "с, при, у (пациент с...)",
    explanation: "«Patients with diabetes» — пациенты с диабетом. «Treat with antibiotics» — лечить антибиотиками."
  },
  "at": {
    baseForm: "at",
    transcription: "[æt]",
    grammaticalForm: "предлог",
    translation: "при, на, в (точка), по",
    explanation: "«At diagnosis» — при постановке диагноза. «At risk» — в группе риска."
  },
  "by": {
    baseForm: "by",
    transcription: "[baɪ]",
    grammaticalForm: "предлог",
    translation: "посредством, к (времени), на",
    explanation: "«Caused by bacteria» — вызванный бактериями. «By day 3» — к 3-му дню."
  },
  "from": {
    baseForm: "from",
    transcription: "[frɒm]",
    grammaticalForm: "предлог",
    translation: "от, из, с",
    explanation: "«Ranging from mild to severe» — варьирующийся от лёгкого до тяжёлого."
  },
  "on": {
    baseForm: "on",
    transcription: "[ɒn]",
    grammaticalForm: "предлог",
    translation: "на, при, по, во время",
    explanation: "«On examination» — при осмотре. «On admission» — при поступлении. «On treatment» — на фоне лечения."
  },
  "as": {
    baseForm: "as",
    transcription: "[æz]",
    grammaticalForm: "предлог / союз / наречие",
    translation: "как, в качестве, по мере того как",
    explanation: "«Used as a marker» — используемый в качестве маркёра. «As symptoms progress» — по мере прогрессирования симптомов."
  },
  "between": {
    baseForm: "between",
    transcription: "[bɪˈtwiːn]",
    grammaticalForm: "предлог",
    translation: "между",
    explanation: "«Difference between groups» — разница между группами."
  },
  "through": {
    baseForm: "through",
    transcription: "[θruː]",
    grammaticalForm: "предлог",
    translation: "через, посредством",
    explanation: "«Transmitted through contact» — передаётся контактным путём."
  },
  "during": {
    baseForm: "during",
    transcription: "[ˈdjʊərɪŋ]",
    grammaticalForm: "предлог",
    translation: "во время, в период",
    explanation: "«During treatment» — во время лечения. «During the study» — в период исследования."
  },
  "after": {
    baseForm: "after",
    transcription: "[ˈɑːftər]",
    grammaticalForm: "предлог / союз",
    translation: "после",
    explanation: "«After surgery» — после операции. «After 48 hours» — через 48 часов."
  },
  "before": {
    baseForm: "before",
    transcription: "[bɪˈfɔːr]",
    grammaticalForm: "предлог / союз",
    translation: "до, перед",
    explanation: "«Before treatment» — до лечения. «Before admission» — до госпитализации."
  },
  "under": {
    baseForm: "under",
    transcription: "[ˈʌndər]",
    grammaticalForm: "предлог",
    translation: "под, при, в состоянии",
    explanation: "«Under observation» — под наблюдением. «Under anesthesia» — под анестезией."
  },
  "over": {
    baseForm: "over",
    transcription: "[ˈəʊvər]",
    grammaticalForm: "предлог",
    translation: "в течение, более, свыше",
    explanation: "«Over 6 months» — в течение 6 месяцев. «Over 50%» — более 50%."
  },
  "within": {
    baseForm: "within",
    transcription: "[wɪˈðɪn]",
    grammaticalForm: "предлог",
    translation: "в пределах, в течение",
    explanation: "«Within 24 hours» — в течение 24 часов. «Within normal range» — в пределах нормы."
  },
  "without": {
    baseForm: "without",
    transcription: "[wɪˈðaʊt]",
    grammaticalForm: "предлог",
    translation: "без",
    explanation: "«Without treatment» — без лечения. «Without complications» — без осложнений."
  },
  "against": {
    baseForm: "against",
    transcription: "[əˈɡenst]",
    grammaticalForm: "предлог",
    translation: "против",
    explanation: "«Effective against bacteria» — эффективен против бактерий."
  },
  "among": {
    baseForm: "among",
    transcription: "[əˈmʌŋ]",
    grammaticalForm: "предлог",
    translation: "среди",
    explanation: "«Among children» — среди детей. «Among risk factors» — среди факторов риска."
  },
  "around": {
    baseForm: "around",
    transcription: "[əˈraʊnd]",
    grammaticalForm: "предлог / наречие",
    translation: "около, примерно, вокруг",
    explanation: "«Around 30%» — около 30%. «Around the site of infection» — вокруг очага инфекции."
  },
  "despite": {
    baseForm: "despite",
    transcription: "[dɪˈspaɪt]",
    grammaticalForm: "предлог",
    translation: "несмотря на",
    explanation: "«Despite treatment, symptoms persisted» — несмотря на лечение, симптомы сохранялись."
  },
  "into": {
    baseForm: "into",
    transcription: "[ˈɪntə]",
    grammaticalForm: "предлог",
    translation: "в (движение), на",
    explanation: "«Divide into groups» — разделить на группы. «Go into remission» — войти в ремиссию."
  },
  "via": {
    baseForm: "via",
    transcription: "[ˈvaɪə]",
    grammaticalForm: "предлог",
    translation: "через, посредством, путём",
    explanation: "«Administered via injection» — вводится путём инъекции."
  },
  "per": {
    baseForm: "per",
    transcription: "[pɜːr]",
    grammaticalForm: "предлог",
    translation: "в (единицу), на",
    explanation: "«10 mg per kg» — 10 мг на кг. «Per day» — в день."
  },
  "versus": {
    baseForm: "versus",
    transcription: "[ˈvɜːrsəs]",
    grammaticalForm: "предлог",
    translation: "по сравнению с, против",
    explanation: "Часто сокращается как «vs.». «Treatment A versus treatment B» — лечение А по сравнению с лечением Б."
  },
  "vs": {
    baseForm: "versus",
    transcription: "[ˈvɜːrsəs]",
    grammaticalForm: "предлог (сокращение)",
    translation: "против, по сравнению с",
    explanation: "Сокращение от versus. «Group A vs Group B» — группа А против группы Б."
  },

  // ── СОЮЗЫ И СВЯЗУЮЩИЕ СЛОВА ──────────────────────────────────────────────────
  "and": {
    baseForm: "and",
    transcription: "[ænd] / [ənd]",
    grammaticalForm: "союз",
    translation: "и, а также",
    explanation: "Самый частый союз. «Pain and swelling» — боль и отёк."
  },
  "but": {
    baseForm: "but",
    transcription: "[bʌt]",
    grammaticalForm: "союз",
    translation: "но, однако, а",
    explanation: "«Effective but toxic» — эффективный, но токсичный."
  },
  "or": {
    baseForm: "or",
    transcription: "[ɔːr]",
    grammaticalForm: "союз",
    translation: "или, либо",
    explanation: "«Bacterial or viral» — бактериальный или вирусный."
  },
  "nor": {
    baseForm: "nor",
    transcription: "[nɔːr]",
    grammaticalForm: "союз",
    translation: "и не, также не",
    explanation: "«Neither fever nor cough» — ни жара, ни кашля."
  },
  "if": {
    baseForm: "if",
    transcription: "[ɪf]",
    grammaticalForm: "союз",
    translation: "если, ли",
    explanation: "«If symptoms persist» — если симптомы сохраняются."
  },
  "when": {
    baseForm: "when",
    transcription: "[wen]",
    grammaticalForm: "союз / наречие",
    translation: "когда",
    explanation: "«When diagnosis is uncertain» — когда диагноз неясен."
  },
  "while": {
    baseForm: "while",
    transcription: "[waɪl]",
    grammaticalForm: "союз / существительное",
    translation: "пока, тогда как, в то время как",
    explanation: "«While effective, it has side effects» — хотя эффективен, имеет побочные эффекты."
  },
  "because": {
    baseForm: "because",
    transcription: "[bɪˈkɒz]",
    grammaticalForm: "союз",
    translation: "потому что, так как",
    explanation: "«Because the infection spread» — потому что инфекция распространилась."
  },
  "although": {
    baseForm: "although",
    transcription: "[ɔːlˈðəʊ]",
    grammaticalForm: "союз",
    translation: "хотя, несмотря на то что",
    explanation: "«Although rare, complications occur» — хотя редко, осложнения возникают."
  },
  "though": {
    baseForm: "though",
    transcription: "[ðəʊ]",
    grammaticalForm: "союз / наречие",
    translation: "хотя, однако",
    explanation: "Неформальный вариант although. «Effective, though costly» — эффективный, хотя и дорогостоящий."
  },
  "unless": {
    baseForm: "unless",
    transcription: "[ənˈles]",
    grammaticalForm: "союз",
    translation: "если не, кроме случаев когда",
    explanation: "«Unless contraindicated» — если нет противопоказаний."
  },
  "until": {
    baseForm: "until",
    transcription: "[ənˈtɪl]",
    grammaticalForm: "союз / предлог",
    translation: "до тех пор пока, до",
    explanation: "«Continue until symptoms resolve» — продолжать до исчезновения симптомов."
  },
  "since": {
    baseForm: "since",
    transcription: "[sɪns]",
    grammaticalForm: "союз / предлог",
    translation: "так как, с тех пор как, с",
    explanation: "«Since 2010» — с 2010 года. «Since bacteria are resistant» — так как бактерии устойчивы."
  },
  "whether": {
    baseForm: "whether",
    transcription: "[ˈweðər]",
    grammaticalForm: "союз",
    translation: "является ли, независимо от того",
    explanation: "«Whether to treat or not» — лечить или нет. «It is unclear whether...» — неясно, является ли..."
  },
  "however": {
    baseForm: "however",
    transcription: "[haʊˈevər]",
    grammaticalForm: "наречие / союз",
    translation: "однако, тем не менее",
    explanation: "Очень частое слово в медицинских текстах. «However, the results were inconclusive» — однако результаты были неопределёнными."
  },
  "therefore": {
    baseForm: "therefore",
    transcription: "[ˈðeərfɔːr]",
    grammaticalForm: "наречие",
    translation: "поэтому, следовательно",
    explanation: "«Therefore, treatment is recommended» — поэтому лечение рекомендуется."
  },
  "thus": {
    baseForm: "thus",
    transcription: "[ðʌs]",
    grammaticalForm: "наречие",
    translation: "таким образом, следовательно",
    explanation: "«Thus, we conclude» — таким образом, мы заключаем."
  },
  "hence": {
    baseForm: "hence",
    transcription: "[hens]",
    grammaticalForm: "наречие",
    translation: "отсюда, поэтому",
    explanation: "«Hence the need for early diagnosis» — отсюда необходимость ранней диагностики."
  },
  "whereas": {
    baseForm: "whereas",
    transcription: "[weərˈæz]",
    grammaticalForm: "союз",
    translation: "тогда как, в то время как",
    explanation: "Выражает контраст. «Whereas adults recover quickly, children may not» — тогда как взрослые выздоравливают быстро, дети — нет."
  },
  "furthermore": {
    baseForm: "furthermore",
    transcription: "[ˈfɜːðəmɔːr]",
    grammaticalForm: "наречие",
    translation: "кроме того, более того",
    explanation: "«Furthermore, the study showed» — кроме того, исследование показало."
  },
  "moreover": {
    baseForm: "moreover",
    transcription: "[mɔːrˈəʊvər]",
    grammaticalForm: "наречие",
    translation: "более того, помимо этого",
    explanation: "«Moreover, complications were rare» — более того, осложнения были редки."
  },
  "nevertheless": {
    baseForm: "nevertheless",
    transcription: "[ˌnevəðəˈles]",
    grammaticalForm: "наречие",
    translation: "тем не менее, несмотря на это",
    explanation: "«Nevertheless, treatment should continue» — тем не менее, лечение следует продолжать."
  },
  "otherwise": {
    baseForm: "otherwise",
    transcription: "[ˈʌðəwaɪz]",
    grammaticalForm: "наречие / союз",
    translation: "иначе, в противном случае, иным образом",
    explanation: "«Treat immediately, otherwise complications may develop» — лечите немедленно, иначе могут развиться осложнения."
  },
  "either": {
    baseForm: "either",
    transcription: "[ˈaɪðər]",
    grammaticalForm: "союз / местоимение / прилагательное",
    translation: "либо...либо, любой из двух",
    explanation: "«Either drug can be used» — можно использовать любой из препаратов. «Either...or...» — либо...либо..."
  },
  "neither": {
    baseForm: "neither",
    transcription: "[ˈnaɪðər]",
    grammaticalForm: "союз / местоимение",
    translation: "ни тот ни другой, ни...ни",
    explanation: "«Neither drug was effective» — ни один из препаратов не был эффективен."
  },
  "both": {
    baseForm: "both",
    transcription: "[bəʊθ]",
    grammaticalForm: "союз / местоимение / прилагательное",
    translation: "оба, и то и другое",
    explanation: "«Both conditions» — оба состояния. «Both...and...» — как...так и..."
  },

  // ── НАРЕЧИЯ ──────────────────────────────────────────────────────────────────
  "also": {
    baseForm: "also",
    transcription: "[ˈɔːlsəʊ]",
    grammaticalForm: "наречие",
    translation: "также, кроме того",
    explanation: "«Also associated with fever» — также связано с жаром."
  },
  "often": {
    baseForm: "often",
    transcription: "[ˈɒfən]",
    grammaticalForm: "наречие",
    translation: "часто",
    explanation: "«Often present in children» — часто встречается у детей."
  },
  "usually": {
    baseForm: "usually",
    transcription: "[ˈjuːʒuəli]",
    grammaticalForm: "наречие",
    translation: "обычно, как правило",
    explanation: "«Usually resolves within a week» — обычно проходит в течение недели."
  },
  "typically": {
    baseForm: "typically",
    transcription: "[ˈtɪpɪkli]",
    grammaticalForm: "наречие",
    translation: "как правило, типично",
    explanation: "«Typically presents with fever» — как правило, проявляется жаром."
  },
  "generally": {
    baseForm: "generally",
    transcription: "[ˈdʒenərəli]",
    grammaticalForm: "наречие",
    translation: "в целом, как правило",
    explanation: "«Generally well tolerated» — в целом хорошо переносится."
  },
  "commonly": {
    baseForm: "commonly",
    transcription: "[ˈkɒmənli]",
    grammaticalForm: "наречие",
    translation: "часто, распространённо",
    explanation: "«Commonly seen in adults» — часто встречается у взрослых."
  },
  "frequently": {
    baseForm: "frequently",
    transcription: "[ˈfriːkwəntli]",
    grammaticalForm: "наречие",
    translation: "часто, нередко",
    explanation: "«Frequently misdiagnosed» — нередко неправильно диагностируется."
  },
  "rarely": {
    baseForm: "rarely",
    transcription: "[ˈreərli]",
    grammaticalForm: "наречие",
    translation: "редко",
    explanation: "«Rarely fatal» — редко приводит к летальному исходу."
  },
  "always": {
    baseForm: "always",
    transcription: "[ˈɔːlweɪz]",
    grammaticalForm: "наречие",
    translation: "всегда",
    explanation: "«Always confirm the diagnosis» — всегда подтверждайте диагноз."
  },
  "never": {
    baseForm: "never",
    transcription: "[ˈnevər]",
    grammaticalForm: "наречие",
    translation: "никогда",
    explanation: "«Never administer without testing» — никогда не вводите без тестирования."
  },
  "sometimes": {
    baseForm: "sometimes",
    transcription: "[ˈsʌmtaɪmz]",
    grammaticalForm: "наречие",
    translation: "иногда, порой",
    explanation: "«Sometimes asymptomatic» — иногда протекает бессимптомно."
  },
  "already": {
    baseForm: "already",
    transcription: "[ɔːlˈredi]",
    grammaticalForm: "наречие",
    translation: "уже",
    explanation: "«Already present at admission» — уже присутствовало при поступлении."
  },
  "still": {
    baseForm: "still",
    transcription: "[stɪl]",
    grammaticalForm: "наречие / прилагательное",
    translation: "ещё, всё ещё, по-прежнему",
    explanation: "«Still not fully understood» — всё ещё не полностью изучено."
  },
  "just": {
    baseForm: "just",
    transcription: "[dʒʌst]",
    grammaticalForm: "наречие / прилагательное",
    translation: "только, лишь, именно",
    explanation: "«Just 10% of patients» — лишь 10% пациентов."
  },
  "only": {
    baseForm: "only",
    transcription: "[ˈəʊnli]",
    grammaticalForm: "наречие / прилагательное",
    translation: "только, лишь, единственный",
    explanation: "«Only in severe cases» — только в тяжёлых случаях."
  },
  "mainly": {
    baseForm: "mainly",
    transcription: "[ˈmeɪnli]",
    grammaticalForm: "наречие",
    translation: "главным образом, в основном",
    explanation: "«Mainly affects children» — главным образом поражает детей."
  },
  "primarily": {
    baseForm: "primarily",
    transcription: "[praɪˈmerɪli]",
    grammaticalForm: "наречие",
    translation: "прежде всего, в первую очередь",
    explanation: "«Primarily a pediatric condition» — прежде всего педиатрическое заболевание."
  },
  "particularly": {
    baseForm: "particularly",
    transcription: "[pəˈtɪkjʊləli]",
    grammaticalForm: "наречие",
    translation: "особенно, в частности",
    explanation: "«Particularly in immunocompromised patients» — особенно у иммунокомпрометированных пациентов."
  },
  "especially": {
    baseForm: "especially",
    transcription: "[ɪˈspeʃəli]",
    grammaticalForm: "наречие",
    translation: "особенно, прежде всего",
    explanation: "«Especially in young children» — особенно у маленьких детей."
  },
  "recently": {
    baseForm: "recently",
    transcription: "[ˈriːsntli]",
    grammaticalForm: "наречие",
    translation: "недавно, в последнее время",
    explanation: "«Recently identified pathogen» — недавно идентифицированный патоген."
  },
  "previously": {
    baseForm: "previously",
    transcription: "[ˈpriːviəsli]",
    grammaticalForm: "наречие",
    translation: "ранее, прежде",
    explanation: "«Previously healthy patients» — ранее здоровые пациенты."
  },
  "subsequently": {
    baseForm: "subsequently",
    transcription: "[ˈsʌbsɪkwəntli]",
    grammaticalForm: "наречие",
    translation: "впоследствии, затем",
    explanation: "«Subsequently developed complications» — впоследствии развились осложнения."
  },
  "significantly": {
    baseForm: "significantly",
    transcription: "[sɪɡˈnɪfɪkəntli]",
    grammaticalForm: "наречие",
    translation: "значительно, существенно",
    explanation: "«Significantly reduced mortality» — значительно снизило смертность."
  },
  "relatively": {
    baseForm: "relatively",
    transcription: "[ˈrelətɪvli]",
    grammaticalForm: "наречие",
    translation: "относительно",
    explanation: "«Relatively rare» — относительно редко."
  },
  "approximately": {
    baseForm: "approximately",
    transcription: "[əˈprɒksɪmətli]",
    grammaticalForm: "наречие",
    translation: "примерно, около",
    explanation: "«Approximately 30% of cases» — примерно 30% случаев."
  },
  "not": {
    baseForm: "not",
    transcription: "[nɒt]",
    grammaticalForm: "отрицательная частица",
    translation: "не",
    explanation: "«Do not exceed the dose» — не превышать дозу. Сокращается в «isn't», «wasn't», «don't»."
  },
  "very": {
    baseForm: "very",
    transcription: "[ˈveri]",
    grammaticalForm: "наречие",
    translation: "очень",
    explanation: "«Very common» — очень распространённый."
  },
  "quite": {
    baseForm: "quite",
    transcription: "[kwaɪt]",
    grammaticalForm: "наречие",
    translation: "довольно, весьма, полностью",
    explanation: "«Quite effective» — довольно эффективный."
  },
  "rather": {
    baseForm: "rather",
    transcription: "[ˈrɑːðər]",
    grammaticalForm: "наречие",
    translation: "скорее, довольно, вместо",
    explanation: "«Rather than surgery» — вместо операции. «Rather effective» — довольно эффективный."
  },
  "even": {
    baseForm: "even",
    transcription: "[ˈiːvən]",
    grammaticalForm: "наречие / прилагательное",
    translation: "даже; равный, ровный",
    explanation: "«Even in mild cases» — даже в лёгких случаях."
  },
  "well": {
    baseForm: "well",
    transcription: "[wel]",
    grammaticalForm: "наречие / прилагательное",
    translation: "хорошо, хорошо переносится; здоровый",
    explanation: "«Well tolerated» — хорошо переносится. «Well documented» — хорошо задокументировано."
  },

  // ── ОПРЕДЕЛИТЕЛИ И МЕСТОИМЕНИЯ ───────────────────────────────────────────────
  "all": {
    baseForm: "all",
    transcription: "[ɔːl]",
    grammaticalForm: "местоимение / прилагательное / наречие",
    translation: "все, весь, полностью",
    explanation: "«All patients» — все пациенты. «In all cases» — во всех случаях."
  },
  "some": {
    baseForm: "some",
    transcription: "[sʌm]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "некоторые, какой-то, немного",
    explanation: "«Some patients» — некоторые пациенты. «Some evidence» — некоторые данные."
  },
  "any": {
    baseForm: "any",
    transcription: "[ˈeni]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "любой, какой-либо",
    explanation: "«Any contraindications» — какие-либо противопоказания. «Without any complications» — без каких-либо осложнений."
  },
  "each": {
    baseForm: "each",
    transcription: "[iːtʃ]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "каждый",
    explanation: "«Each patient received» — каждый пациент получил."
  },
  "every": {
    baseForm: "every",
    transcription: "[ˈevri]",
    grammaticalForm: "прилагательное",
    translation: "каждый, любой",
    explanation: "«Every 8 hours» — каждые 8 часов."
  },
  "several": {
    baseForm: "several",
    transcription: "[ˈsevərəl]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "несколько",
    explanation: "«Several studies have shown» — несколько исследований показали."
  },
  "many": {
    baseForm: "many",
    transcription: "[ˈmeni]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "много, многие",
    explanation: "«Many patients» — многие пациенты."
  },
  "much": {
    baseForm: "much",
    transcription: "[mʌtʃ]",
    grammaticalForm: "местоимение / прилагательное / наречие",
    translation: "много (неисчисляемое), очень",
    explanation: "«Much evidence» — много данных. «Much more effective» — значительно более эффективный."
  },
  "few": {
    baseForm: "few",
    transcription: "[fjuː]",
    grammaticalForm: "местоимение / прилагательное",
    translation: "мало, немного, несколько",
    explanation: "«Few cases were reported» — было зарегистрировано мало случаев. «A few patients» — несколько пациентов."
  },
  "more": {
    baseForm: "more",
    transcription: "[mɔːr]",
    grammaticalForm: "наречие / прилагательное / местоимение",
    translation: "больше, более",
    explanation: "«More effective» — более эффективный. «More than 50%» — более 50%."
  },
  "most": {
    baseForm: "most",
    transcription: "[məʊst]",
    grammaticalForm: "наречие / прилагательное / местоимение",
    translation: "наиболее, большинство",
    explanation: "«Most patients» — большинство пациентов. «Most effective» — наиболее эффективный."
  },
  "less": {
    baseForm: "less",
    transcription: "[les]",
    grammaticalForm: "наречие / прилагательное",
    translation: "менее, меньше",
    explanation: "«Less common» — менее распространённый. «Less than 10%» — менее 10%."
  },
  "other": {
    baseForm: "other",
    transcription: "[ˈʌðər]",
    grammaticalForm: "прилагательное / местоимение",
    translation: "другой, иной",
    explanation: "«Other risk factors» — другие факторы риска."
  },
  "another": {
    baseForm: "another",
    transcription: "[əˈnʌðər]",
    grammaticalForm: "прилагательное / местоимение",
    translation: "ещё один, другой",
    explanation: "«Another approach» — другой подход."
  },
  "same": {
    baseForm: "same",
    transcription: "[seɪm]",
    grammaticalForm: "прилагательное / местоимение",
    translation: "тот же самый",
    explanation: "«The same dose» — та же доза."
  },
  "such": {
    baseForm: "such",
    transcription: "[sʌtʃ]",
    grammaticalForm: "прилагательное / местоимение",
    translation: "такой, подобный",
    explanation: "«Such conditions» — такие состояния. «Such as fever» — такие как жар."
  },
  "various": {
    baseForm: "various",
    transcription: "[ˈveəriəs]",
    grammaticalForm: "прилагательное",
    translation: "различные, разнообразные",
    explanation: "«Various factors» — различные факторы."
  },
  "certain": {
    baseForm: "certain",
    transcription: "[ˈsɜːtən]",
    grammaticalForm: "прилагательное",
    translation: "определённый, некоторый, уверенный",
    explanation: "«Certain conditions» — определённые состояния. «Certain risk» — определённый риск."
  },

};

export default commonWords;
