// src/utils/ai.ts
import { Alert, Platform } from "react-native";
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

export async function interpretarSonhoIA(dream: string): Promise<string> {
  const base = getBaseUrl();
console.log("API BASE =", base);
if (Platform.OS === "web") alert(`API: ${base}`);
  const r = await fetch(`${base}/interpret-dream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dream, lang: "pt" }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Falha ao interpretar (status ${r.status}). ${txt}`);
  }

  const data = await r.json();
  return data.interpretation as string;
}
