import os, json, re, sys, time
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')
import requests
from pathlib import Path

LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL = "medgemma-4b-it"
PDF_DIR = Path(__file__).parent / "pdfs"
ARTICLES_OUT = Path(__file__).parent / "src" / "data" / "articles.json"
CACHE_OUT = Path(__file__).parent / "src" / "data" / "wordCache.json"

STOP_WORDS = set("""
the a an is are was were be been being have has had do does did will would could
should may might shall can in on at to for of with by from as into through and or
but if this that these those it its they them their we our you your he she his her
i me my not no so than too very just also up about which who what when where how
all any while then after before more most other some such each both either over
under between during without within along across behind beyond plus except near
around down off above
""".split())

def call_lm(messages, max_tokens=800):
    resp = requests.post(LM_STUDIO_URL, json={
        "model": MODEL,
        "max_tokens": max_tokens,
        "messages": messages,
    }, timeout=120)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()

def clean_json(text):
    text = re.sub(r'^```json\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()

def extract_pdf_text(pdf_path):
    import pypdf
    reader = pypdf.PdfReader(str(pdf_path))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_article(pdf_path):
    print(f"\nПарсинг: {pdf_path.name}")
    raw_text = extract_pdf_text(pdf_path)

    prompt = f"""Из этого текста медицинской статьи извлеки структурированные данные.
Текст:
{raw_text[:5000]}

Верни ТОЛЬКО JSON без markdown:
{{
  "title": "заголовок статьи на английском",
  "tag": "специальность одним словом на русском, например: Педиатрия",
  "sentences": ["предложение 1", "предложение 2", ...]
}}
Правила:
- Только основной текст (без колонтитулов, номеров страниц, списка литературы)
- 20-60 предложений
- Каждое предложение — отдельный элемент массива"""

    response = call_lm([
        {"role": "system", "content": "Ты извлекаешь текст из медицинских статей. Отвечай ТОЛЬКО валидным JSON без markdown."},
        {"role": "user", "content": prompt},
    ], max_tokens=3000)

    return json.loads(clean_json(response))

def explain_word(word, sentence):
    prompt = f"""Слово: "{word}"
Предложение из медицинской статьи: "{sentence}"

Верни JSON:
{{
  "baseForm": "исходная словарная форма",
  "transcription": "транскрипция IPA в косых скобках",
  "grammaticalForm": "краткое объяснение грамматической формы на русском",
  "translation": "перевод на русском, основное значение",
  "explanation": "объяснение в медицинском контексте на русском, 1-2 предложения",
  "contextBefore": "3-5 слов до искомого слова",
  "contextAfter": "3-5 слов после искомого слова"
}}"""

    response = call_lm([
        {"role": "system", "content": "Отвечай ТОЛЬКО валидным JSON без markdown и без пояснений."},
        {"role": "user", "content": prompt},
    ], max_tokens=600)
    return json.loads(clean_json(response))

def extract_words(sentences):
    words = {}
    for sentence in sentences:
        for raw in sentence.split():
            clean = re.sub(r"[^a-zA-Z'-]", "", raw).lower()
            if len(clean) < 3:
                continue
            if clean in STOP_WORDS:
                continue
            if clean not in words:
                words[clean] = sentence
    return words

def main():
    PDF_DIR.mkdir(exist_ok=True)
    ARTICLES_OUT.parent.mkdir(parents=True, exist_ok=True)

    # Загружаем существующий кэш
    word_cache = {}
    if CACHE_OUT.exists():
        word_cache = json.loads(CACHE_OUT.read_text(encoding="utf-8"))
        print(f"Кэш загружен: {len(word_cache)} слов")

    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"Положи PDF файлы в папку: {PDF_DIR}")
        return

    print(f"Найдено PDF: {len(pdf_files)}")
    articles = []

    for pdf_path in pdf_files:
        try:
            article = parse_article(pdf_path)
        except Exception as e:
            print(f"  Ошибка парсинга: {e}")
            continue

        article["id"] = f"article_{int(time.time())}_{pdf_path.stem[:8]}"
        article["addedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        articles.append(article)
        print(f"  OK: {article['title']} ({len(article['sentences'])} предложений)")

        words = extract_words(article["sentences"])
        new_words = {w: s for w, s in words.items() if w not in word_cache}
        print(f"  Слов: {len(new_words)} новых из {len(words)} уникальных")

        for i, (word, sentence) in enumerate(new_words.items()):
            try:
                word_cache[word] = explain_word(word, sentence)
                if (i + 1) % 5 == 0:
                    print(f"\r  Прогресс: {i+1}/{len(new_words)}", end="", flush=True)
                    CACHE_OUT.write_text(json.dumps(word_cache, ensure_ascii=False, indent=2), encoding="utf-8")
            except Exception as e:
                print(f"\n  Пропуск '{word}': {e}")

        print(f"\n  Готово: {len(new_words)} слов")

    ARTICLES_OUT.write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding="utf-8")
    CACHE_OUT.write_text(json.dumps(word_cache, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nГОТОВО! Статей: {len(articles)} -> {ARTICLES_OUT}")
    print(f"ГОТОВО! Слов в кэше: {len(word_cache)} -> {CACHE_OUT}")

if __name__ == "__main__":
    main()
