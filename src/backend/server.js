require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 45000); // 45s
const VERSION = "v-lucky-6-modes";

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

  const patterns = [
    /(?:^|\n)[ \t]*(?:\d+\)|[#*•-])?[ \t]*N[uú]meros da sorte\b[\s\S]*/i,
    /(?:^|\n)[ \t]*(?:\d+\)|[#*•-])?[ \t]*Lucky numbers\b[\s\S]*/i,
    /(?:^|\n)[ \t]*(Lotof[aá]cil|Mega-?Sena|Dia de Sorte)\b[\s\S]*/i,
  ];

  let cleaned = text;
  for (const re of patterns) {
    cleaned = cleaned.replace(re, '');
  }
  return cleaned.trimEnd();
}

// ---------- Map de modos ----------
const MODE_PROMPTS = {
  // PT
  pt: {
    mistico:
      "Você é um sábio intérprete dos sonhos. Traga significados simbólicos inspirados em tradições espirituais e arquetípicas, com tom poético, acolhedor e enigmático.",
    psicologico:
      "Você é um guia inspirado na psicologia dos sonhos. Relacione símbolos e emoções com arquétipos, inconsciente coletivo e aspectos internos, de forma clara e reflexiva.",
    acolhedor:
      "Você é um amigo acolhedor. Ajude a pessoa a refletir sobre os símbolos dos sonhos e suas emoções, trazendo encorajamento e conselhos práticos simples para o dia.",
    historico:
      "Você é um contador de histórias. Conecte os símbolos do sonho a mitos, lendas e narrativas antigas, trazendo interpretações criativas e inspiradoras.",
    oraculo:
      "Você é um oráculo dos sonhos. Suas interpretações são simbólicas, intuitivas e misteriosas, com uma linguagem ritualística, oferecendo insights como mensagens ocultas.",
    motivacional:
      "Você é um guia motivacional dos sonhos. Extraia símbolos como aprendizados e transforme-os em mensagens positivas e práticas para fortalecer o dia da pessoa.",
    objetivo:
      "Você é um analista objetivo de sonhos. Forneça interpretações curtas e diretas, com foco nos símbolos principais, emoções centrais e reflexões rápidas.",
  },
  // EN (fallback se lang !== 'pt')
  en: {
    mistico:
      "You are a wise interpreter of dreams. Bring symbolic meanings inspired by spiritual and archetypal traditions, with a poetic, welcoming, and enigmatic tone.",
    psicologico:
      "You are a guide inspired by dream psychology. Relate symbols and emotions to archetypes, the collective unconscious, and inner aspects, clearly and reflectively.",
    acolhedor:
      "You are a supportive friend. Help the person reflect on dream symbols and emotions, offering encouragement and simple, practical advice for the day.",
    historico:
      "You are a storyteller. Connect the dream's symbols to myths, legends, and ancient narratives, bringing creative and inspiring interpretations.",
    oraculo:
      "You are a dream oracle. Your interpretations are symbolic, intuitive, and mysterious, with a ritualistic language offering insights like hidden messages.",
    motivacional:
      "You are a motivational dream coach. Extract symbols as learnings and turn them into positive, practical messages to strengthen the person's day.",
    objetivo:
      "You are an objective dream analyst. Provide short and direct interpretations, focusing on the main symbols, core emotions, and quick reflections.",
  },
};

// ---------- health ----------
app.get('/', (_req, res) =>
  res.json({ ok: true, service: 'EcosDaCama Dream API', version: VERSION })
);

// Preflight explícito (web)
app.options('/interpret-dream', cors());

// ---------- rota principal ----------
app.post('/interpret-dream', async (req, res) => {
  try {
    const { dream, lang = 'pt', mode = 'mistico' } = req.body || {};
    if (!dream || typeof dream !== 'string' || dream.trim().length < 10) {
      return res.status(400).json({ error: 'Envie o texto do sonho (≥ 10 chars).' });
    }

    // normaliza língua e modo
    const isPt = (lang || 'pt').toLowerCase().startsWith('pt');
    const langKey = isPt ? 'pt' : 'en';
    const modeKey = String(mode || 'mistico').toLowerCase();

    // escolhe system por modo (fallback: mistico)
    const system = MODE_PROMPTS[langKey][modeKey] || MODE_PROMPTS[langKey].mistico;

    // instruções do usuário (mantidas como no seu código)
    const user = isPt
      ? `Texto do sonho: """${dream.trim()}"""
Forneça os símbolos e possíveis significados do sonho;
tema central e emoções.
No final coloque perguntas de auto reflexão.
E uma ação simples pra hoje.`
      : `Dream text: """${dream.trim()}"""
Provide the dream's symbols and possible meanings;
the central theme and emotions.
At the end, include reflection questions
and one simple action for today.`;

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
    let text = removeModelLuckyNumbersSection(raw || (isPt ? 'Não consegui interpretar agora.' : 'Could not interpret now.'));

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

    if (!text.endsWith('\n')) text += '\n';
    text += numeros;

    console.log('[INTERP OK]', { mode: modeKey, lang: langKey });
    res.json({ interpretation: text, mode: modeKey, lang: langKey, version: VERSION });
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
