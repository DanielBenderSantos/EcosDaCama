// src/backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 45000); // 45s
const VERSION = "v-lucky-5-one-block";

if (!OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY não definida no .env');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---------- Utils: timeout ----------
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

// ---------- Utils: extração de texto da Responses API ----------
function extractOutputText(data) {
  try {
    if (data?.output && Array.isArray(data.output)) {
      const first = data.output[0];
      const part = first?.content?.find?.((c) => c?.type === 'output_text');
      if (part?.text) return part.text;
      const allText = first?.content
        ?.map((c) => (c?.text ? c.text : ''))
        ?.filter(Boolean)
        ?.join('\n')
        ?.trim();
      if (allText) return allText;
    }
    if (data?.output_text) return data.output_text;
    if (data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
  } catch (_) {}
  return '';
}

// ---------- Utils: retry simples ----------
async function callOpenAI(body) {
  const headers = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };

  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetchWithTimeout('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        throw new Error(`OpenAI HTTP ${r.status} ${txt.slice(0, 300)}`);
      }
      return await r.json();
    } catch (e) {
      lastErr = e;
      console.error(`[OpenAI] tentativa ${attempt} falhou:`, e?.message || e);
      await new Promise(res => setTimeout(res, attempt * 800));
    }
  }
  throw lastErr;
}

// ---------- Utils: Números da sorte (determinísticos por sonho) ----------
function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFromText(text) {
  const h = crypto.createHash('sha256').update(text).digest();
  const seed = h.readUInt32BE(0); // 32 bits do hash
  return mulberry32(seed);
}

function pickUnique(rng, count, maxInclusive) {
  const set = new Set();
  while (set.size < count) {
    const v = Math.floor(rng() * maxInclusive) + 1; // 1..max
    set.add(v);
  }
  return Array.from(set).sort((a, b) => a - b);
}

function pad2(n) { return String(n).padStart(2, '0'); }
function formatNums(arr) { return arr.map(pad2).join(', '); }

// ---------- Remove qualquer bloco "Números da sorte" que o modelo tenha escrito ----------
function removeModelLuckyNumbersSection(text) {
  if (!text) return text;

  // Padrões comuns de título (pt/en) + possíveis formatos
  const patterns = [
    /(?:^|\n)[ \t]*(?:\d+\)|[#*•-])?[ \t]*N[uú]meros da sorte\b[\s\S]*/i,
    /(?:^|\n)[ \t]*(?:\d+\)|[#*•-])?[ \t]*Lucky numbers\b[\s\S]*/i,
    // às vezes o modelo usa linhas com loterias direto
    /(?:^|\n)[ \t]*(Lotof[aá]cil|Mega-?Sena|Dia de Sorte)\b[\s\S]*/i,
  ];

  let cleaned = text;
  for (const re of patterns) {
    cleaned = cleaned.replace(re, ''); // remove tudo a partir do match
  }

  // remove espaços e linhas duplas extras no fim
  return cleaned.trimEnd();
}

// ---------- health ----------
app.get('/', (_req, res) => res.json({ ok: true, service: 'EcosDaCama Dream API', version: VERSION }));

// Preflight explícito (web)
app.options('/interpret-dream', cors());

// ---------- rota principal ----------
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

    // ⚠️ Agora o prompt pede só 4 itens. O item 5 (números) será sempre injetado pelo backend.
    const user =
      lang === 'pt'
        ? `Texto do sonho: """${dream.trim()}"""
Forneça:
1) Principais símbolos e possíveis significados (bullets).
2) Temas centrais e emoções (breve).
3) Duas perguntas de reflexão.
4) Uma ação/ritual prático simples para hoje.
Observação: não inclua números de loteria.`
        : `Dream text: """${dream.trim()}"""
Provide:
1) Key symbols and possible meanings (bullets).
2) Core themes & emotions (brief).
3) Two reflection questions.
4) One simple practical action/ritual for today.
Note: do not include lottery numbers.`;

    const body = {
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_output_tokens: 600,
      temperature: 0.7,
    };

    const data = await callOpenAI(body);
    const raw = extractOutputText(data);

    // remove qualquer "Números da sorte" que o modelo colocou
    let text = removeModelLuckyNumbersSection(raw || 'Não consegui interpretar agora.');

    // ---------- gera os números da sorte (determinístico por texto) ----------
    const rng = rngFromText(dream.trim());
    const lotofacil = pickUnique(rng, 15, 25);
    const megasena  = pickUnique(rng, 6, 60);
    const diaSorte  = pickUnique(rng, 7, 31);

    const numeros = [
      '',
      '5) 🔢 Números da sorte (entretenimento):',
      `   • Lotofácil (15/25): ${formatNums(lotofacil)}`,
      `   • Mega-Sena (6/60): ${formatNums(megasena)}`,
      `   • Dia de Sorte (7/31): ${formatNums(diaSorte)}`,
      '   _Obs.: apenas diversão; sem garantia de resultados._',
    ].join('\n');

    // concatena como 5º item, garantindo quebra de linha
    if (!text.endsWith('\n')) text += '\n';
    text += numeros;

    // opcional: loga o final para auditoria
    console.log('[INTERP OK]', dream.trim());

    res.json({ interpretation: text });
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
