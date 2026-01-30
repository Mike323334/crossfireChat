import logging
import requests
from deep_translator import GoogleTranslator
from .config import GROQ_API_KEY, MODEL_NAME
from backend.search import get_relevant_chunks
import unicodedata
import fasttext
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
# FastText Model Path
# ---------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fasttext/lid.176.ftz")

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
# Lazy model loader
# ---------------------------
def get_ft_model():
    if not hasattr(get_ft_model, "model"):
        logger.info("Loading FastText model...")
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"FastText model not found at {MODEL_PATH}")
        get_ft_model.model = fasttext.load_model(MODEL_PATH)
        logger.info("FastText model loaded successfully")
    return get_ft_model.model

# ---------------------------
# Normalize text
# ---------------------------
def normalize_text(text: str) -> str:
    text = text.strip().lower()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    text = re.sub(r"[^\w\s]", "", text)  # remove punctuation
    return text

def clean_word(word: str) -> str:
    word = normalize_text(word)
    return re.sub(r"[^\w]", "", word)

# ---------------------------
# Static Overrides
# ---------------------------
SPANISH_OVERRIDE = {
    "hola","adios","gracias","que","como","cuando","donde","quien","cual",
    "porque","por","para","si","no","bien","mal","muy","estoy","eres","es",
    "somos","son","hay","tengo","quiero","puedo","de","el","la","lo","un",
    "una","yo","tu","el","ella","nosotros","ellos","usted","ustedes",
    "mas","sí","más","tambien","ahora","ayer","manana","hoy","nunca","siempre",
    "alguno","ninguno","algo","nada","todos","todas","ellos","ellas",
    "vamos","vamosa","vienes","vengo","creo","parece","entiendo","entiendes",
    "amigo","amiga","chico","chica","familia","gente","persona","personas",
    "grande","pequeno","pequena","bueno","buena","malo","mala","nuevo","nueva",
    "viejo","vieja","mejor","peor","antes","despues","dentro","fuera",
    "arriba","abajo","cerca","lejos","sientate","levantate","hablar","hablo",
    "hablas","comer","beber","leer","escribir","ver","mirar","escuchar",
    "oir","sentir","pensar","saber","conocer","entender","ayuda","ayudar",
    "trabajo","dinero","escuela","clase","profesor","profesora","amigos",
    "familia","casa","hogar","vida","amor","feliz","triste","enojado","enojada",
    "contento","contenta","cansado","cansada","estas","ahi","todo","bien"
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
    "xd": "es",
    "jaja": "es",
    "jeje": "es",
    "q onda": "es",
    "q haces": "es",
    "q pasa": "es",
    "tqm": "es",
    "bno": "es",
    "saludos": "es",
    "nos vemos": "es",
    "hasta luego": "es",
    "x favor": "es",
    "pls": "en",
    "thx": "en",
    "np": "en"
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
# Google Translate fallback
# ---------------------------
def detect_with_google(text: str) -> str:
    try:
        translated = GoogleTranslator(source='auto', target='es').translate(text)
        if translated.lower() != text.lower():
            return "es"
        return "en"
    except Exception as e:
        logger.error(f"Google Translate detection failed: {e}")
        return "en"

# ---------------------------
# Language Detection
# ---------------------------
def detect_lang_safe(text: str) -> str:
    try:
        norm_text = normalize_text(text)
        words = [clean_word(w) for w in norm_text.split() if w]

        # 1️⃣ Phrase-level overrides
        for phrase, lang in sorted(PHRASE_OVERRIDE.items(), key=lambda x: -len(x[0])):
            if phrase in norm_text:
                learn_override(phrase, lang)
                return lang

        # 2️⃣ Static word overrides
        spanish_hits = sum(1 for w in words if w in SPANISH_OVERRIDE)
        english_hits = sum(1 for w in words if w in ENGLISH_OVERRIDE)
        if spanish_hits >= 2:
            return "es"
        if english_hits >= 2:
            return "en"

        # 3️⃣ Learned overrides
        for word in words:
            if word in DYNAMIC_OVERRIDES["es"]:
                return "es"
            if word in DYNAMIC_OVERRIDES["en"]:
                return "en"

        # 4️⃣ FastText fallback (longer texts)
        if len(words) >= 3:
            ft_model = get_ft_model()
            labels, probs = ft_model.predict(norm_text, k=1)
            label = labels[0].replace("__label__", "")
            if label in ["es", "en"]:
                return label

        # 5️⃣ Short phrases: Google Translate
        if len(words) <= 2:
            return detect_with_google(norm_text)

        # 6️⃣ Accents heuristic
        if any(c in "áéíóúñü" for c in norm_text):
            return "es"

        return "en"

    except Exception as e:
        logger.error(f"Language detection error: {e}")
        return "en"

# ---------------------------
# Translation + Learning
# ---------------------------
def force_language(text, target_lang, original_text=None):
    try:
        detected = detect_lang_safe(text)
        if detected == target_lang:
            words = [clean_word(w) for w in normalize_text(text).split()]
            for w in words:
                if len(w) <= 4:
                    learn_override(w, target_lang)
            return text

        translated = GoogleTranslator(source='auto', target=target_lang).translate(text)

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
