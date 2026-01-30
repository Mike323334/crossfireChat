import logging
import requests
import pycld3
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

BASE_DIR = os.path.dirname(__file__)
OVERRIDE_PATH = os.path.join(BASE_DIR, "language_overrides.json")

# ---------------------------
# Override Storage
# ---------------------------
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
# Text Normalization
# ---------------------------
def normalize_text(text: str) -> str:
    text = text.strip().lower()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    return re.sub(r"[^\w\s]", "", text)

def clean_word(word: str) -> str:
    return re.sub(r"[^\w]", "", normalize_text(word))

# ---------------------------
# Static Overrides
# ---------------------------
SPANISH_OVERRIDE = {
    "hola","adios","gracias","que","como","cuando","donde","quien","cual",
    "porque","por","para","si","no","bien","mal","muy","estoy","eres","es",
    "somos","son","hay","tengo","quiero","puedo","de","el","la","lo","un",
    "una","yo","tu","ella","nosotros","ellos","usted","ustedes",
    "mas","tambien","ahora","ayer","manana","hoy","nunca","siempre",
    "vamos","vienes","vengo","creo","parece","entiendo",
    "amigo","amiga","familia","casa","vida","amor","feliz","triste",
    "estas","ahi","todo","bien"
}

ENGLISH_OVERRIDE = {
    "hi","hello","hey","thanks","ok","yes","no","please",
    "i","you","he","she","we","they","am","are","is",
    "have","has","do","does","can","could","would","will"
}

PHRASE_OVERRIDE = {
    "q tal": "es","xq": "es","tmb": "es","bn": "es",
    "lol": "en","brb": "en","xd": "es","jaja": "es","jeje": "es",
    "q onda": "es","q haces": "es","q pasa": "es","tqm": "es",
    "bno": "es","saludos": "es","nos vemos": "es","hasta luego": "es",
    "x favor": "es","pls": "en","thx": "en","np": "en"
}

# ---------------------------
# Learning Overrides
# ---------------------------
def learn_override(word: str, lang: str):
    word = clean_word(word)
    if word and word not in DYNAMIC_OVERRIDES[lang]:
        DYNAMIC_OVERRIDES[lang].append(word)
        save_overrides(DYNAMIC_OVERRIDES)
        logger.info(f"Learned new {lang} word: {word}")

# ---------------------------
# Language Detection
# ---------------------------
def detect_lang_safe(text: str) -> str:
    try:
        norm_text = normalize_text(text)
        words = [clean_word(w) for w in norm_text.split() if w]

        # 1️⃣ Phrase overrides
        for phrase, lang in sorted(PHRASE_OVERRIDE.items(), key=lambda x: -len(x[0])):
            if phrase in norm_text:
                learn_override(phrase, lang)
                return lang

        # 2️⃣ Static word overrides
        if sum(w in SPANISH_OVERRIDE for w in words) >= 1:
            return "es"
        if sum(w in ENGLISH_OVERRIDE for w in words) >= 1:
            return "en"

        # 3️⃣ Learned overrides
        for w in words:
            if w in DYNAMIC_OVERRIDES["es"]:
                return "es"
            if w in DYNAMIC_OVERRIDES["en"]:
                return "en"

        # 4️⃣ Accent heuristic
        if any(c in "áéíóúñü" for c in text.lower()):
            return "es"

        # 5️⃣ 🔥 CLD3 main detector
        result = pycld3.get_language(text)
        if result and result.language in ["es", "en"]:
            if result.probability > 0.65:
                return result.language

        return "en"

    except Exception as e:
        logger.error(f"Language detection error: {e}")
        return "en"

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
IMPORTANT LANGUAGE RULE: {lang_instruction}
Stay fully in character. Never say you are an AI.
"""

        user_prompt = f"Context:\n{context}\n\nUser message:\n{message}"

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
        return response.json()["choices"][0]["message"]["content"]

    except Exception as e:
        logger.error(f"Character query failed: {e}")
        return "Sorry, something went wrong. Please try again."

# ---------------------------
# Local test
# ---------------------------
if __name__ == "__main__":
    print(query_character("Gideon", "estas ahi?"))
