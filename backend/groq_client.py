import logging
import requests
from deep_translator import GoogleTranslator
from .config import GROQ_API_KEY, MODEL_NAME
from backend.search import get_relevant_chunks
import unicodedata
import fasttext
import os

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
# Lazy model loader (Render-safe)
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
    return text

# ---------------------------
# Short word overrides
# ---------------------------
SPANISH_OVERRIDE = {
    "hola", "adios", "gracias", "que", "como", "cuando", "donde",
    "quien", "cual", "porque", "por", "para", "si", "no", "bien",
    "mal", "muy", "estoy", "eres", "es", "somos", "son", "hay",
    "tengo", "quiero", "puedo", "de", "el", "la", "lo", "un", "una",
        "yo", "tú", "él", "ella", "nosotros", "nosotras", "vosotros", "vosotras", "ellos", "ellas", "usted", "ustedes",

    # Common short verbs
    "estoy", "estas", "esta", "es", "soy", "eres", "somos", "son", "tengo", "tiene", "tenemos", "quiero", "puedo",

    # Question words
    "qué", "como", "cuándo", "dónde", "quién", "cuál", "por qué", "para qué",

    # Short prepositions / connectors
    "a", "de", "en", "con", "sin", "por", "para", "sobre", "entre",

    # Common short adverbs / adjectives
    "sí", "no", "bien", "mal", "muy", "ya", "más", "menos", "todo", "nada",

    # Greetings / polite words
    "hola", "adiós", "gracias", "buenos", "buenas", "tarde", "noche", "día",

    # Misc short words
    "lo", "la", "el", "un", "una", "y", "o", "pero", "porque",
     "hola?", "adios?", "gracias?", "que?", "como?", "cuando?", "donde?",
    "quien?", "cual?", "porque?", "por?", "para?", "si?", "no?", "bien?",
    "mal?", "muy?", "estoy?", "eres?", "es?", "somos?", "son?", "hay?",
    "tengo?", "quiero?", "puedo?", "de?", "el?", "la?", "lo?", "un?", "una?",
    "yo?", "tú?", "él?", "ella?", "nosotros?", "nosotras?", "vosotros?", "vosotras?", "ellos?", "ellas?", "usted?", "ustedes?",

    "estas?", "esta?", "soy?", "tiene?", "tenemos?",

    "qué?", "cuándo?", "dónde?", "quién?", "cuál?", "por qué?", "para qué?",

    "a?", "en?", "con?", "sin?", "sobre?", "entre?",

    "sí?", "ya?", "más?", "menos?", "todo?", "nada?",

    "adiós?", "buenos?", "buenas?", "tarde?", "noche?", "día?",

    "y?", "o?", "pero?"
}

ENGLISH_OVERRIDE = {
    "hi", "hello", "hey", "thanks", "ok", "yes", "no", "please",
    "i", "you", "he", "she", "we", "they", "am", "are", "is",
    "have", "has", "do", "does", "can", "could", "would", "will"
}

# ---------------------------
# Language Detection
# ---------------------------
def detect_lang_safe(text: str) -> str:
    try:
        norm_text = normalize_text(text)

        for word in norm_text.split():
            if word in SPANISH_OVERRIDE:
                return "es"
            if word in ENGLISH_OVERRIDE:
                return "en"

        ft_model = get_ft_model()
        labels, probs = ft_model.predict(norm_text, k=1)
        label = labels[0].replace("__label__", "")

        if label not in ["en", "es"]:
            if any(c in "áéíóúñü" for c in norm_text):
                return "es"
            return "en"

        return label

    except Exception as e:
        logger.error(f"Language detection error: {e}")
        return "en"

# ---------------------------
# Translation Safety
# ---------------------------
def force_language(text, target_lang):
    try:
        detected = detect_lang_safe(text)
        if detected == target_lang:
            return text
        return GoogleTranslator(source='auto', target=target_lang).translate(text)
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

        return force_language(reply, user_lang)

    except Exception as e:
        logger.error(f"Character query failed: {e}")
        return "Sorry, something went wrong. Please try again."

# ---------------------------
# Local test
# ---------------------------
if __name__ == "__main__":
    print(query_character("Gideon", "Hola"))
