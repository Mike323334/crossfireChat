export async function sendMessage(character, message) {
  try {
    const res = await fetch(
      `https://crossfirechat.onrender.com/chat/${encodeURIComponent(character)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    // network-level problem or CORS / server unreachable
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `❌ Request failed: status=${res.status}, body=${text}`
      );
      throw new Error(
        `Backend returned status ${res.status}`
      );
    }

    const data = await res.json();

    // safe check for response field
    if (!data || typeof data.response !== "string") {
      console.warn("⚠️ Unexpected data format from backend:", data);
      return null;
    }

    return data.response;
  } catch (err) {
    console.error("🔥 sendMessage error:", err);
    throw err;
  }
}
