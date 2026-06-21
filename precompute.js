const fs = require('fs');
const path = require('path');
const http = require('http');
const _pdfModule = require('pdf-parse');
const pdfParse = typeof _pdfModule === 'function' ? _pdfModule : (_pdfModule.default || _pdfModule);

const LM_STUDIO = { host: 'localhost', port: 1234 };
const MODEL = 'medgemma-4b-it';
const PDF_DIR = path.join(__dirname, 'pdfs');
const ARTICLES_OUT = path.join(__dirname, 'src', 'data', 'articles.json');
const CACHE_OUT = path.join(__dirname, 'src', 'data', 'wordCache.json');

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','shall','can',
  'in','on','at','to','for','of','with','by','from','as','into','through',
  'and','or','but','if','this','that','these','those','it','its','they','them',
  'their','we','our','you','your','he','she','his','her','i','me','my',
  'not','no','so','than','too','very','just','also','up','about','which',
  'who','what','when','where','how','all','any','while','then','after','before',
  'more','most','other','some','such','each','both','either','over','under',
  'between','during','without','within','along','following','across','behind',
  'beyond','plus','except','up','out','around','down','off','above','near',
]);

function callLMStudio(messages, maxTokens = 800) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages,
    });
    const req = http.request({
      ...LM_STUDIO,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.choices[0].message.content.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function cleanWord(w) {
  return w.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
}

function extractWords(sentences) {
  const words = new Map(); // word -> {sentence, index}
  sentences.forEach((sentence, idx) => {
    sentence.split(/\s+/).forEach(raw => {
      const clean = cleanWord(raw);
      if (clean.length < 3) return;
      if (STOP_WORDS.has(clean)) return;
      if (/^\d+$/.test(clean)) return;
      if (!words.has(clean)) {
        words.set(clean, { sentence, idx });
      }
    });
  });
  return words;
}

async function parsePDF(filePath) {
  console.log(`\nПарсинг PDF: ${path.basename(filePath)}`);
  const buffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(buffer);
  const rawText = pdfData.text;

  const prompt = `Из этого текста медицинской статьи извлеки структурированные данные.
Текст:
${rawText.slice(0, 6000)}

Верни ТОЛЬКО JSON без markdown:
{
  "title": "заголовок статьи на английском",
  "tag": "специальность одним словом на русском, например: Педиатрия",
  "sentences": ["предложение 1", "предложение 2", ...]
}
Правила:
- Только основной текст (без колонтитулов, номеров страниц, списка литературы)
- 20-60 предложений
- Каждое предложение — отдельный элемент массива`;

  const response = await callLMStudio([
    { role: 'system', content: 'Ты извлекаешь текст из медицинских статей. Отвечай ТОЛЬКО валидным JSON без markdown.' },
    { role: 'user', content: prompt },
  ], 3000);

  const cleaned = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function explainWord(word, sentence) {
  const prompt = `Слово: "${word}"
Предложение из медицинской статьи: "${sentence}"

Верни JSON:
{
  "baseForm": "исходная словарная форма",
  "transcription": "транскрипция IPA в косых скобках",
  "grammaticalForm": "краткое объяснение грамматической формы на русском",
  "translation": "перевод на русском, основное значение",
  "explanation": "объяснение в медицинском контексте на русском, 1-2 предложения",
  "contextBefore": "3-5 слов до искомого слова",
  "contextAfter": "3-5 слов после искомого слова"
}`;

  const response = await callLMStudio([
    { role: 'system', content: 'Отвечай ТОЛЬКО валидным JSON без markdown и без пояснений.' },
    { role: 'user', content: prompt },
  ], 600);

  const cleaned = response.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  // Создаём папки
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR);
  if (!fs.existsSync(path.join(__dirname, 'src', 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
  }

  // Загружаем существующий кэш (для продолжения после прерывания)
  let wordCache = {};
  if (fs.existsSync(CACHE_OUT)) {
    wordCache = JSON.parse(fs.readFileSync(CACHE_OUT, 'utf8'));
    console.log(`Загружен кэш: ${Object.keys(wordCache).length} слов`);
  }

  const pdfFiles = fs.readdirSync(PDF_DIR).filter(f => f.endsWith('.pdf'));
  if (pdfFiles.length === 0) {
    console.log(`Положи PDF файлы в папку: ${PDF_DIR}`);
    return;
  }

  console.log(`Найдено PDF: ${pdfFiles.length}`);
  const articles = [];

  for (const file of pdfFiles) {
    let article;
    try {
      article = await parsePDF(path.join(PDF_DIR, file));
    } catch (e) {
      console.error(`Ошибка парсинга ${file}:`, e.message);
      continue;
    }

    article.id = `article_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    article.addedAt = new Date().toISOString();
    articles.push(article);
    console.log(`✓ Статья: ${article.title} (${article.sentences.length} предложений)`);

    // Извлекаем слова
    const words = extractWords(article.sentences);
    const newWords = [...words.entries()].filter(([w]) => !wordCache[w]);
    console.log(`  Слов для обработки: ${newWords.length} новых из ${words.size} уникальных`);

    let done = 0;
    for (const [word, { sentence }] of newWords) {
      try {
        const explanation = await explainWord(word, sentence);
        wordCache[word] = explanation;
        done++;
        if (done % 10 === 0) {
          process.stdout.write(`\r  Прогресс: ${done}/${newWords.length}`);
          // Сохраняем промежуточный результат
          fs.writeFileSync(CACHE_OUT, JSON.stringify(wordCache, null, 2), 'utf8');
        }
      } catch (e) {
        console.error(`\n  Ошибка для слова "${word}":`, e.message);
      }
    }
    console.log(`\n  Готово: ${done} слов`);
  }

  // Сохраняем финальные файлы
  fs.writeFileSync(ARTICLES_OUT, JSON.stringify(articles, null, 2), 'utf8');
  fs.writeFileSync(CACHE_OUT, JSON.stringify(wordCache, null, 2), 'utf8');

  console.log(`\n✓ Статей: ${articles.length} → ${ARTICLES_OUT}`);
  console.log(`✓ Слов в кэше: ${Object.keys(wordCache).length} → ${CACHE_OUT}`);
}

main().catch(console.error);
