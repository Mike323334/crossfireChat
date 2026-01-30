import logging
import requests
from google.cloud import translate_v2 as translate  # Google Cloud Translate API
from .config import GROQ_API_KEY, MODEL_NAME
from backend.search import get_relevant_chunks
import unicodedata
import os
import json
import re

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("lang_pipeline")

# ---------------------------
# Dynamic Override Storage
# ---------------------------
OVERRIDE_PATH = os.path.join(os.path.dirname(__file__), "language_overrides.json")

def load_overrides():
    if not os.path.exists(OVERRIDE_PATH):
        return {"es": [], "en": []}
    with open(OVERRIDE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_overrides(data):
    with open(OVERRIDE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

DYNAMIC_OVERRIDES = load_overrides()

# ---------------------------
# Google Cloud Translate client
# ---------------------------
translate_client = translate.Client()

def detect_language_google_cloud(text: str) -> str:
    """Detect the language of a text using Google Cloud Translate API."""
    try:
        result = translate_client.detect_language(text)
        lang = result['language']
        return lang if lang in ['es', 'en'] else 'en'
    except Exception as e:
        logger.error(f"Google Cloud detection failed: {e}")
        return 'en'

# ---------------------------
# Normalize text
# ---------------------------
def normalize_text(text: str) -> str:
    text = text.strip().lower()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    return text

def clean_word(word: str) -> str:
    word = normalize_text(word)
    word = re.sub(r"[^\wáéíóúñü]", "", word)
    return word

# ---------------------------
# Static Overrides
# ---------------------------
SPANISH_OVERRIDE = {
    "hola","adios","gracias","que","como","cuando","donde","quien","cual",
    "porque","por","para","si","no","bien","mal","muy","estoy","eres","es",
    "somos","son","hay","tengo","quiero","puedo","de","el","la","lo","un",
    "una","yo","tu","el","ella","nosotros","ellos","usted","ustedes",
    "mas","sí","más"
}

ENGLISH_OVERRIDE = {
    "hi","hello","hey","thanks","ok","yes","no","please",
    "i","you","he","she","we","they","am","are","is",
    "have","has","do","does","can","could","would","will"
}

# ---------------------------
# Short chat phrases
# ---------------------------
PHRASE_OVERRIDE = {
    "q tal": "es",
    "xq": "es",
    "tmb": "es",
    "bn": "es",
    "ok": "en",
    "lol": "en",
    "brb": "en",
}

# ---------------------------
# Learning New Words
# ---------------------------
def learn_override(word: str, lang: str):
    word = clean_word(word)
    if not word:
        return
    if word not in DYNAMIC_OVERRIDES[lang]:
        DYNAMIC_OVERRIDES[lang].append(word)
        save_overrides(DYNAMIC_OVERRIDES)
        logger.info(f"Learned new {lang} override word: {word}")

# ---------------------------
# Language Detection
# ---------------------------
def detect_lang_safe(text: str) -> str:
    try:
        norm_text = normalize_text(text)

        # 1️⃣ Phrase-level overrides
        for phrase, lang in sorted(PHRASE_OVERRIDE.items(), key=lambda x: -len(x[0])):
            if phrase in norm_text:
                learn_override(phrase, lang)
                return lang

        words = [clean_word(w) for w in norm_text.split() if w]

        # 2️⃣ Static word overrides
        for word in words:
            if word in SPANISH_OVERRIDE:
                return "es"
            if word in ENGLISH_OVERRIDE:
                return "en"

        # 3️⃣ Learned overrides
        for word in words:
            if word in DYNAMIC_OVERRIDES["es"]:
                return "es"
            if word in DYNAMIC_OVERRIDES["en"]:
                return "en"

        # 4️⃣ Use Google Cloud detection for short/unknown phrases
        return detect_language_google_cloud(text)

    except Exception as e:
        logger.error(f"Language detection error: {e}")
        return "en"

# ---------------------------
# Translation Safety + Learning
# ---------------------------
def force_language(text, target_lang, original_text=None):
    try:
        detected = detect_lang_safe(text)
        if detected == target_lang:
            # Learn unknown words
            words = [clean_word(w) for w in normalize_text(text).split()]
            for w in words:
                if len(w) <= 4:
                    learn_override(w, target_lang)
            return text

        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)

        # Learn words from original input
        if original_text:
            words = [clean_word(w) for w in normalize_text(original_text).split()]
            for w in words:
                if len(w) <= 4:
                    learn_override(w, target_lang)

        return translated

    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text

# ---------------------------
# Character Query
# ---------------------------
def query_character(character, message, history=None):
    try:
        context = get_relevant_chunks(message)
        user_lang = detect_lang_safe(message)

        lang_instruction = (
            "Reply ONLY in Spanish. Never use English."
            if user_lang == "es"
            else "Reply ONLY in English. Never use Spanish."
        )

        system_prompt = f"""
You are {character} from the Crossfire novel series.

IMPORTANT LANGUAGE RULE:
{lang_instruction}

Stay fully in character with emotional depth and intensity.
Never say you are an AI.
"""

        user_prompt = f"""
Book context:
{context}

User message:
{message}
"""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.6
            },
            timeout=25
        )

        response.raise_for_status()
        data = response.json()
        reply = data["choices"][0]["message"]["content"]

        return force_language(reply, user_lang, original_text=message)

    except Exception as e:
        logger.error(f"Character query failed: {e}")
        return "Sorry, something went wrong. Please try again."

# ---------------------------
# Local test
# ---------------------------
if __name__ == "__main__":
    print(query_character("Gideon", "estas ahi?"))
