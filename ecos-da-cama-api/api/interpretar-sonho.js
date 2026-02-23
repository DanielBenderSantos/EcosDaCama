const DEFAULT_PROMPT =
  "Analise o seguinte sonho e me diga seu possível significado com base em interpretações comuns da simbologia dos sonhos. Seja objetivo e considere aspectos psicológicos e simbólicos tradicionais.";

const FALLBACK_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function createSeededRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickUniqueNumbers({ min, max, count, rng }) {
  const selected = new Set();
  while (selected.size < count) {
    const number = Math.floor(rng() * (max - min + 1)) + min;
    selected.add(number);
  }
  return Array.from(selected).sort((a, b) => a - b);
}

function formatLuckyNumbers(sonho, prompt) {
  const seed = hashString(`${sonho}|${prompt || ""}`);
  const rng = createSeededRng(seed);

  const lotofacil = pickUniqueNumbers({ min: 1, max: 25, count: 15, rng });
  const megaSena = pickUniqueNumbers({ min: 1, max: 60, count: 6, rng });
  const diaDeSorte = pickUniqueNumbers({ min: 1, max: 31, count: 7, rng });

  const formatList = (numbers) => numbers.map((n) => String(n).padStart(2, "0")).join(", ");

  return [
    "",
    "🔢 Números da sorte baseados no sonho:",
    `- Lotofácil: ${formatList(lotofacil)}`,
    `- Mega-Sena: ${formatList(megaSena)}`,
    `- Dia de Sorte: ${formatList(diaDeSorte)}`,
    "Obs.: apenas diversão; sem garantia de resultados.",
  ].join("\n");
}

async function callGemini({ apiKey, modelName, promptFinal, sonhoLimpo }) {
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const geminiResponse = await fetch(geminiApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${promptFinal}\n\nSonho: ${sonhoLimpo}` }] }],
    }),
  });

  const geminiData = await geminiResponse.json();
  return { geminiResponse, geminiData };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY não configurada no ambiente da Vercel." });
  }

  const { sonho, prompt } = req.body || {};

  if (!sonho || typeof sonho !== "string" || !sonho.trim()) {
    return res.status(400).json({ error: "O campo 'sonho' é obrigatório." });
  }

  const sonhoLimpo = sonho.trim();
  if (sonhoLimpo.length > 4000) {
    return res.status(400).json({ error: "O texto do sonho está muito longo." });
  }

  const promptFinal = (typeof prompt === "string" && prompt.trim()) || DEFAULT_PROMPT;
  const modelsToTry = [configuredModel, ...FALLBACK_MODELS.filter((m) => m !== configuredModel)];

  try {
    let lastError = null;

    for (const modelName of modelsToTry) {
      const { geminiResponse, geminiData } = await callGemini({
        apiKey,
        modelName,
        promptFinal,
        sonhoLimpo,
      });

      if (!geminiResponse.ok) {
        const details = geminiData?.error?.message || "Sem detalhes.";
        const modelNotFound =
          geminiResponse.status === 404 &&
          typeof details === "string" &&
          details.toLowerCase().includes("not found");

        lastError = { status: geminiResponse.status, details, modelName };

        if (modelNotFound) {
          continue;
        }

        return res.status(geminiResponse.status).json({
          error: "Erro ao comunicar com a API do Gemini.",
          details,
          model: modelName,
        });
      }

      const significado = extractGeminiText(geminiData);

      if (!significado) {
        lastError = {
          status: 502,
          details: "Gemini respondeu sem conteúdo interpretável.",
          modelName,
        };
        continue;
      }

      const numerosDaSorte = formatLuckyNumbers(sonhoLimpo, promptFinal);
      return res.status(200).json({
        significado: `${significado}\n${numerosDaSorte}`,
        model: modelName,
      });
    }

    return res.status(lastError?.status || 502).json({
      error: "Erro ao comunicar com a API do Gemini.",
      details: lastError?.details || "Todos os modelos testados falharam.",
      triedModels: modelsToTry,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Falha inesperada ao interpretar o sonho.",
      details: error?.message || "Erro desconhecido",
    });
  }
};