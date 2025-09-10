// src/utils/ai.ts
import Constants from "expo-constants";

function getBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  // @ts-ignore (SDKs variam)
  const fromExtra =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ??
    // @ts-ignore
    Constants.manifest?.extra?.EXPO_PUBLIC_API_URL;

  const base = (fromEnv || fromExtra || "").replace(/\/+$/, "");
  if (!base) throw new Error("EXPO_PUBLIC_API_URL ausente.");
  return base;
}

// —— modos aceitos pelo backend
export type InterpretMode =
  | "mistico"
  | "psicologico"
  | "acolhedor"
  | "historico"
  | "oraculo"
  | "motivacional"
  | "objetivo";

export type InterpretLang = "pt" | "en";

export type InterpretResponse = {
  interpretation: string;
  mode?: string;
  lang?: string;
  version?: string;
  error?: string;
  detail?: string;
};

// Util interno: fetch com timeout (opcional)
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 45000
) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Chama o backend /interpret-dream e retorna APENAS o texto da interpretação.
 * @param dream Texto do sonho (mín. 10 chars)
 * @param mode Estilo de interpretação (default: 'mistico')
 * @param lang Idioma ('pt' | 'en') (default: 'pt')
 */
export async function interpretarSonhoIA(
  dream: string,
  mode: InterpretMode = "mistico",
  lang: InterpretLang = "pt",
  timeoutMs = 45000
): Promise<string> {
  if (!dream || dream.trim().length < 10) {
    throw new Error("Forneça o texto do sonho (≥ 10 caracteres).");
  }

  const base = getBaseUrl();
  const r = await fetchWithTimeout(
    `${base}/interpret-dream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: dream.trim(), mode, lang }),
    },
    timeoutMs
  );

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Falha ao interpretar (status ${r.status}). ${txt}`);
  }

  const data: InterpretResponse = await r.json();
  if (!data?.interpretation) {
    throw new Error("Resposta inválida do servidor (sem 'interpretation').");
  }
  return data.interpretation;
}

/**
 * Versão que retorna também metadados (mode, lang, version).
 */
export async function interpretarSonhoIAFull(
  dream: string,
  mode: InterpretMode = "mistico",
  lang: InterpretLang = "pt",
  timeoutMs = 45000
): Promise<InterpretResponse> {
  if (!dream || dream.trim().length < 10) {
    throw new Error("Forneça o texto do sonho (≥ 10 caracteres).");
  }

  const base = getBaseUrl();
  const r = await fetchWithTimeout(
    `${base}/interpret-dream`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: dream.trim(), mode, lang }),
    },
    timeoutMs
  );

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Falha ao interpretar (status ${r.status}). ${txt}`);
  }

  const data: InterpretResponse = await r.json();
  if (!data?.interpretation) {
    throw new Error("Resposta inválida do servidor (sem 'interpretation').");
  }
  return data;
}
