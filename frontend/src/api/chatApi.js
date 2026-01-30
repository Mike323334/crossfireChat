export async function sendMessage(character, message) {
  const res = await fetch(`http://localhost:8000/chat/${character}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch from backend");
  }

  const data = await res.json();
  return data.response; // extract the actual AI response
}
