const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function http(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

export async function getEntries() {
  const data = await http("/entries");
  return data?.entries ?? [];
}

export async function createEntry(entry) {
  const data = await http("/entries", { method: "POST", body: JSON.stringify(entry) });
  return data?.entry ?? null;
}

export async function updateEntry(id, patch) {
  const data = await http(`/entries/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(patch) });
  return data?.entry ?? null;
}

export async function deleteEntry(id) {
  await http(`/entries/${encodeURIComponent(id)}`, { method: "DELETE" });
  return true;
}
