// src/utils/exportImport.ts
import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { initDB } from "@/db";

/**
 * Formato de backup/export do EcosDaCama
 */
type ExportPayload = {
  format: "ecosdacama.v1";
  exportedAt: string;
  table: "Sonhos";
  rows: any[];
};

const SAF = FileSystem.StorageAccessFramework;
const isWeb = Platform.OS === "web";

/* =========================
   Helpers de nome/tempo
========================= */
function tsName(base: string, ext: string) {
  return `${base}_${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
}
function jsonName() {
  return tsName("ecosdacama_sonhos", "json");
}

/* ==================================
   SELECT * dos sonhos (depende do driver ter select())
================================== */
async function getSonhos(): Promise<any[]> {
  const db = await initDB();
  if ((db as any).select) {
    return await (db as any).select("SELECT * FROM Sonhos ORDER BY id ASC");
  }
  throw new Error("Driver não expõe select(); implemente select() no driver.");
}

/* ==================================
   Download no Web (com fallbacks)
================================== */
function downloadJSONWeb(filename: string, text: string): boolean {
  try {
    // 1) Blob + <a download> (preferido)
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click(); // precisa ser disparado por gesto do usuário
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
    return true;
  } catch {}
  try {
    // 2) data URL (abre em nova aba)
    const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(text);
    window.open(dataUrl, "_blank");
    return true;
  } catch {}
  return false;
}

/* ==================================
   EXPORTAR JSON (Web/Android/iOS)
================================== */
export async function exportSonhosJSON(): Promise<{ uri?: string }> {
  const rows = await getSonhos();

  const payload: ExportPayload = {
    format: "ecosdacama.v1",
    exportedAt: new Date().toISOString(),
    table: "Sonhos",
    rows,
  };
  const json = JSON.stringify(payload, null, 2);

  if (isWeb) {
    const ok = downloadJSONWeb(jsonName(), json);
    if (!ok) {
      Alert.alert("Atenção", "Não foi possível iniciar o download. Desative bloqueadores de pop-up e tente novamente.");
    }
    return {};
  }

  // 1) share sheet (iOS/Android)
  try {
    const tmpUri = FileSystem.cacheDirectory! + jsonName();
    await FileSystem.writeAsStringAsync(tmpUri, json, { encoding: FileSystem.EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tmpUri, { dialogTitle: "Exportar sonhos" });
      return { uri: tmpUri };
    }
  } catch {
    // segue para fallback
  }

  // 2) Android: StorageAccessFramework (escolher pasta, ex.: Downloads)
  if (Platform.OS === "android") {
    try {
      const perms = await SAF.requestDirectoryPermissionsAsync();
      if (!perms.granted) throw new Error("Permissão negada para escolher diretório.");
      const fileUri = await SAF.createFileAsync(perms.directoryUri, jsonName(), "application/json");
      await SAF.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      return { uri: fileUri };
    } catch (e: any) {
      throw new Error("Falha ao salvar via SAF: " + (e?.message ?? String(e)));
    }
  }

  // 3) iOS: grava em Documents (visível no app Arquivos)
  const docUri = FileSystem.documentDirectory! + jsonName();
  await FileSystem.writeAsStringAsync(docUri, json, { encoding: FileSystem.EncodingType.UTF8 });
  return { uri: docUri };
}

/* ==================================
   Helpers de import (parse/merge)
================================== */
function parsePayload(text: string): ExportPayload {
  let data: ExportPayload;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("JSON inválido.");
  }
  if (data.format !== "ecosdacama.v1" || data.table !== "Sonhos" || !Array.isArray(data.rows)) {
    throw new Error("Arquivo não reconhecido para importação.");
  }
  return data;
}

async function mergePayloadIntoDB(payload: ExportPayload): Promise<{ imported: number; skipped: number }> {
  const db = await initDB();

  // descobrir colunas reais da tabela
  const pragma = await (db as any).select?.("PRAGMA table_info(Sonhos)")!;
  const cols = new Set<string>(pragma.map((c: any) => c.name));
  const hasUpdatedAt = cols.has("updated_at");

  // existentes por id
  const existing = await (db as any).select?.("SELECT * FROM Sonhos")!;
  const byId = new Map<number, any>();
  for (const r of existing) byId.set(r.id, r);

  const keepKnown = (o: any) => {
    const out: any = {};
    for (const k of Object.keys(o)) if (cols.has(k)) out[k] = o[k];
    return out;
  };

  let imported = 0;
  let skipped = 0;

  await (db as any).exec("BEGIN");
  try {
    for (const r of payload.rows) {
      const clean = keepKnown(r);

      if (typeof clean.id === "number" && byId.has(clean.id)) {
        if (hasUpdatedAt) {
          const curr = byId.get(clean.id);
          const a = new Date(curr.updated_at || curr.when_at || curr.created_at || 0).getTime();
          const b = new Date(clean.updated_at || clean.when_at || clean.created_at || 0).getTime();

          if (b > a) {
            const keys = Object.keys(clean).filter((k) => k !== "id");
            const set = keys.map((k) => `${k} = ?`).join(", ");
            const vals = keys.map((k) => clean[k]);
            await (db as any).exec(`UPDATE Sonhos SET ${set} WHERE id = ?`, [...vals, clean.id]);
            imported++;
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      } else {
        const { id, ...rest } = clean;
        const keys = Object.keys(rest);
        if (!keys.length) { skipped++; continue; }
        const q = keys.map(() => "?").join(", ");
        await (db as any).exec(
          `INSERT INTO Sonhos (${keys.join(",")}) VALUES (${q})`,
          keys.map((k) => (rest as any)[k])
        );
        imported++;
      }
    }
    await (db as any).exec("COMMIT");
  } catch (e) {
    await (db as any).exec("ROLLBACK");
    throw e;
  }

  return { imported, skipped };
}

/* ==================================
   Web: escolher arquivo via <input type=file>
================================== */
function pickJSONWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      document.body.removeChild(input);
      if (!file) return resolve(null);
      try {
        const text = await file.text();
        resolve(text);
      } catch {
        resolve(null);
      }
    };

    // precisa ser chamado em um gesto do usuário (onPress)
    input.click();
  });
}

/* ==================================
   IMPORTAR JSON (Web/Android/iOS)
================================== */
export async function importSonhosJSON(): Promise<{ imported: number; skipped: number }> {
  // WEB: usa File API nativa (não expo-file-system)
  if (isWeb) {
    const text = await pickJSONWeb();
    if (!text) return { imported: 0, skipped: 0 };
    const payload = parsePayload(text);
    const result = await mergePayloadIntoDB(payload);
    return result;
  }

  // MOBILE: DocumentPicker + FileSystem
  const picked = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (picked.canceled || !picked.assets?.[0]) return { imported: 0, skipped: 0 };

  const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri, { encoding: "utf8" });
  const payload = parsePayload(raw);
  const result = await mergePayloadIntoDB(payload);
  return result;
}
