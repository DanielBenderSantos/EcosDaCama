// src/utils/ai.ts
export async function interpretarSonhoIA(dream: string): Promise<string> {
  const base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

  const r = await fetch(`${base}/interpret-dream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dream, lang: "pt" })
  });

  if (!r.ok) {
    const e = await r.text().catch(() => "");
    throw new Error(`Falha ao interpretar (status ${r.status}). ${e}`);
  }

  const data = await r.json();
  return data.interpretation as string;
}
