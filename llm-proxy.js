const http = require('http');

const PORT = 3001;
const LM_STUDIO_HOST = 'localhost';
const LM_STUDIO_PORT = 1234;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/explain') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const { word, sentence } = JSON.parse(body);

    const prompt = `Слово: "${word}"
Предложение из медицинской статьи: "${sentence}"

Верни JSON строго в таком формате:
{
  "baseForm": "исходная словарная форма",
  "transcription": "транскрипция IPA в косых скобках",
  "grammaticalForm": "краткое объяснение грамматической формы на русском",
  "translation": "перевод на русском, основное значение",
  "explanation": "объяснение значения в медицинском контексте на русском, 1-2 предложения",
  "contextBefore": "текст предложения ДО искомого слова (последние 3-5 слов)",
  "contextAfter": "текст предложения ПОСЛЕ искомого слова (первые 3-5 слов)"
}
Отвечай ТОЛЬКО валидным JSON без markdown-блоков и без пояснений.`;

    const payload = JSON.stringify({
      model: 'medgemma-4b-it',
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'Ты помощник для изучения медицинского английского. Отвечай ТОЛЬКО валидным JSON.' },
        { role: 'user', content: prompt },
      ],
    });

    const options = {
      hostname: LM_STUDIO_HOST,
      port: LM_STUDIO_PORT,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const proxyReq = http.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.choices[0].message.content.trim();
          const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(cleaned);
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
    });

    proxyReq.on('error', e => {
      res.writeHead(502);
      res.end(JSON.stringify({ error: 'LM Studio недоступен: ' + e.message }));
    });

    proxyReq.write(payload);
    proxyReq.end();
  });
});

server.listen(PORT, () => {
  console.log(`Прокси запущен на порту ${PORT}`);
  console.log('Запусти туннель: npx localtunnel --port 3001');
});
