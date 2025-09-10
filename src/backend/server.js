// ---------- rota principal ----------
app.post('/interpret-dream', async (req, res) => {
  try {
    const { dream, lang = 'pt' } = req.body || {};
    if (!dream || typeof dream !== 'string' || dream.trim().length < 10) {
      return res.status(400).json({ error: 'Envie o texto do sonho (≥ 10 chars).' });
    }

    const system =
      lang === 'pt'
        ? 'Você é um sábio intérprete dos sonhos. Traga significados simbólicos inspirados em tradições espirituais e arquetípicas, com tom poético, acolhedor e enigmático'
        : 'You are a wise interpreter of dreams. You bring symbolic meanings inspired by spiritual and archetypal traditions, with a poetic, welcoming, and enigmatic tone.';

    // ⚠️ Novo prompt simplificado
    const user =
      lang === 'pt'
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

    let text = removeModelLuckyNumbersSection(raw || 'Não consegui interpretar agora.');

    // ---------- gera os números da sorte ----------
    const rng = rngFromText(dream.trim());
    const lotofacil = pickUnique(rng, 15, 25);
    const megasena  = pickUnique(rng, 6, 60);

    const numeros = [
      '',
      '🔢 Números da sorte (entretenimento):',
      `   • Lotofácil (15/25): ${formatNums(lotofacil)}`,
      `   • Mega-Sena (6/60): ${formatNums(megasena)}`,
      '   _Obs.: apenas diversão; sem garantia de resultados._',
    ].join('\n');

    if (!text.endsWith('\n')) text += '\n';
    text += numeros;

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
