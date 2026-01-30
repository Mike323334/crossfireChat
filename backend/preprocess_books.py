import json
from backend.utils import pdf_to_text, chunk_text
from backend.config import BOOK_PATHS

all_chunks = []

print("📚 Preprocessing books...")

for character, paths in BOOK_PATHS.items():
    if isinstance(paths, str):
        paths = [paths]

    for path in paths:
        print(f"Processing {character}: {path}")
        text = pdf_to_text(path)
        chunks = chunk_text(text)
        all_chunks.extend(chunks)

with open("backend/books_chunks.json", "w", encoding="utf-8") as f:
    json.dump(all_chunks, f)

print(f"✅ Saved {len(all_chunks)} chunks to books_chunks.json")
