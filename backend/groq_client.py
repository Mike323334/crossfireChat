import logging
import requests
from deep_translator import GoogleTranslator
from backend.config import GROQ_API_KEY, MODEL_NAME
from backend.search import get_relevant_chunks
import unicodedata
import fasttext
import os

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("lang_pipeline")

# ---------------------------
# Load FastText model
# ---------------------------
# You need to download the model once from:
# https://fasttext.cc/docs/en/language-identification.html
# Example: lid.176.ftz
MODEL_PATH = "C:\\IA_character_GPT\\backend\\fasttext\\lid.176.ftz"

ft_model = fasttext.load_model(MODEL_PATH)
print(os.path.exists(r"C:\\IA_character_GPT\\backend\\fasttext\\lid.176.ftz"))

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
# Dictionary override for very short words
# ---------------------------
SPANISH_OVERRIDE = {
    "hola", "adios", "gracias", "que", "como", "cuando", "donde",
    "quien", "cual", "porque", "por", "para", "si", "no", "bien",
    "mal", "muy", "estoy", "eres", "es", "somos", "son", "hay",
    "tengo", "quiero", "puedo", "de", "el", "la", "lo", "un", "una"
}

ENGLISH_OVERRIDE = {
    "hi", "hello", "hey", "thanks", "ok", "yes", "no", "please",
    "i", "you", "he", "she", "we", "they", "am", "are", "is",
    "have", "has", "do", "does", "can", "could", "would", "will"
}

# ---------------------------
# Detect language with FastText
# ---------------------------
def detect_lang_safe(text: str) -> str:
    norm_text = normalize_text(text)
    logger.debug(f"Normalized text: '{norm_text}'")

    # 1️⃣ Short-word override
    for word in norm_text.split():
        if word in SPANISH_OVERRIDE:
            logger.info(f"Spanish override detected: '{word}'")
            return "es"
        if word in ENGLISH_OVERRIDE:
            logger.info(f"English override detected: '{word}'")
            return "en"

    # 2️⃣ FastText prediction
    labels, probs = ft_model.predict(norm_text, k=2)
    label = labels[0].replace("__label__", "")
    prob = probs[0]

    logger.debug(f"FastText prediction: {label} ({prob:.2f})")

    # 3️⃣ Restrict to only en/es
    if label not in ["en", "es"]:
        # fallback: if contains accents, Spanish
        if any(c in "áéíóúñü" for c in norm_text):
            logger.info("Detected Spanish by accent heuristic")
            return "es"
        logger.info("Defaulting to English")
        return "en"

    return label

# ---------------------------
# Force language translation
# ---------------------------
def force_language(text, target_lang):
    detected = detect_lang_safe(text)
    logger.debug(f"force_language → detected: {detected}, target: {target_lang}")
    if detected == target_lang:
        return text
    logger.info(f"Translating text from {detected} → {target_lang}")
    return GoogleTranslator(source='auto', target=target_lang).translate(text)

# ---------------------------
# Query character
# ---------------------------
def query_character(character, message, history=None):
    logger.info(f"User message received: {message}")

    context = get_relevant_chunks(message)
    logger.debug(f"Extracted context: {context}")

    user_lang = detect_lang_safe(message)
    logger.info(f"User language detected as: {user_lang}")

    lang_instruction = "Reply ONLY in Spanish. Never use English." if user_lang == "es" else "Reply ONLY in English. Never use Spanish."

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

    logger.debug("Sending request to Groq API")
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
        }
    )

    logger.debug(f"Groq response status: {response.status_code}")
    data = response.json()
    reply = data["choices"][0]["message"]["content"]

    reply = force_language(reply, user_lang)
    logger.info(f"Final reply language enforced: {user_lang}")
    logger.debug(f"Final reply content: {reply}")

    return reply

# ---------------------------
# Example usage
# ---------------------------
if __name__ == "__main__":
    test_messages = ["Hola", "Adiós", "estas ahi?", "Hello", "Thanks", "Hi"]
    for msg in test_messages:
        reply = query_character("Hero", msg)
        print(f"User: {msg} → Reply: {reply}")
