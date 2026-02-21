const DEFAULT_PROMPT =
  "Analise o seguinte sonho e me diga seu possível significado com base em interpretações comuns da simbologia dos sonhos. Seja objetivo e considere aspectos psicológicos e simbólicos tradicionais.";

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

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

  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const geminiResponse = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${promptFinal}\n\nSonho: ${sonhoLimpo}` }] }],
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        error: "Erro ao comunicar com a API do Gemini.",
        details: geminiData?.error?.message || "Sem detalhes.",
      });
    }

    const significado = extractGeminiText(geminiData);

    if (!significado) {
      return res.status(502).json({
        error: "Gemini respondeu sem conteúdo interpretável.",
      });
    }

    return res.status(200).json({ significado });
  } catch (error) {
    return res.status(500).json({
      error: "Falha inesperada ao interpretar o sonho.",
      details: error?.message || "Erro desconhecido",
    });
  }
};
