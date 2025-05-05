require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL;

app.post('/api/interpretar-sonho', async (req, res) => {
    const { sonho } = req.body;
    if (!sonho) {
        return res.status(400).json({ error: 'O texto do sonho é obrigatório.' });
    }

    try {
        console.log("Sonho recebido:", sonho);

        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const prompt = `Interprete o significado do seguinte sonho: ${sonho}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
        });

        const data = await response.json();
        console.log("Resposta da API:", data);

        let significado = 'Não foi possível interpretar o sonho.';
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            significado = data.candidates[0].content.parts[0].text;
        }

        res.json({ significado });
    } catch (error) {
        console.error("Erro ao comunicar com a API:", error);
        res.status(500).json({ error: 'Erro ao comunicar com a API do Gemini.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
