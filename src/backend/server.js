// src/backend/server.js  (CommonJS)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ======= Config =======
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_TIMEOUT_MS = 15000; // 15s

if (!OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY não definida no .env');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Helper: fetch com timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

// Helper: extrai texto da Responses API
function extractOutputText(data) {
  try {
    // Formato Responses API (modelo novo)
    if (data?.output && Array.isArray(data.output)) {
      const first = data.output[0];
      const part = first?.content?.find?.((c) => c?.type === 'output_text');
      if (part?.text) return part.text;
      // fallback: concatena qualquer pedaço de texto
      const allText = first?.content
        ?.map((c) => (c?.text ? c.text : ''))
        ?.filter(Boolean)
        ?.join('\n')
        ?.trim();
      if (allText) return allText;
    }
    // Fallbacks comuns (modelos/chat antigos)
    if (data?.output_text) return data.output_text;
    if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
  } catch (_) {}
  return '';
}

// Rota simples de saúde
app.get('/', (_req, res) => res.json({ ok: true, service: 'EcosDaCama Dream API' }));

// Interpretar sonho
app.post('/interpret-dream', async (req, res) => {
  try {
    const { dream, lang = 'pt' } = req.body || {};
    if (!dream || typeof dream !== 'string' || dream.trim().length < 10) {
      return res.status(400).json({ error: 'Envie o texto do sonho (≥ 10 chars).' });
    }

    const system =
      lang === 'pt'
        ? 'Você é um guia onírico. Ofereça interpretações simbólicas e possibilidades (não diagnósticos), de forma breve, acolhedora e clara.'
        : 'You are a dream guide. Offer symbolic, possibility-oriented interpretations (not clinical), briefly and clearly.';

    const user =
      lang === 'pt'
        ? `Texto do sonho: """${dream.trim()}"""
Forneça:
1) Principais símbolos e possíveis significados (bullets).
2) Temas centrais e emoções (breve).
3) Duas perguntas de reflexão.
4) Uma ação/ritual prático simples para hoje.
Observação: interpretação, não diagnóstico.`
        : `Dream text: """${dream.trim()}"""
Provide:
1) Key symbols and possible meanings (bullets).
2) Core themes & emotions (brief).
3) Two reflection questions.
4) One simple practical action/ritual for today.
Reminder: interpretation, not diagnosis.`;

    const body = {
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_output_tokens: 600,
      temperature: 0.7,
    };

    const r = await fetchWithTimeout('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.error('[OpenAI] HTTP', r.status, txt?.slice?.(0, 300));
      return res.status(r.status).json({ error: 'Falha na API de IA', detail: txt?.slice?.(0, 300) });
    }

    const data = await r.json();
    const output = extractOutputText(data);

    if (!output) {
      console.error('[OpenAI] Sem texto extraído. Payload curto:', JSON.stringify(data).slice(0, 500));
      return res.json({ interpretation: 'Não consegui interpretar agora.' });
    }

    res.json({ interpretation: output });
  } catch (e) {
    const isAbort = e?.name === 'AbortError';
    console.error(isAbort ? '[Timeout]' : '[Server error]', e?.message || e);
    res
      .status(isAbort ? 504 : 500)
      .json({ error: isAbort ? 'Tempo limite atingido ao chamar a IA.' : 'Erro interno', detail: String(e?.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Dream API rodando em http://localhost:${PORT}`);
  console.log(`⏱️  Timeout de requests: ${REQUEST_TIMEOUT_MS} ms`);
});
