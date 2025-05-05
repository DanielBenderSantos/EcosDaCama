require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Substitua com a sua chave de API do arquivo .env
const apiKey = process.env.API_KEY;
const modelName = process.env.MODEL_NAME;

app.post('/api/interpretar-sonho', async (req, res) => {
    const { sonho } = req.body;
    if (!sonho) {
        return res.status(400).json({ error: 'O texto do sonho é obrigatório.' });
    }

    try {
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const prompt = `Interprete o significado do seguinte sonho: ${sonho}`;

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }),
        });

        const data = await response.json();
        let significado = 'Não foi possível interpretar o sonho.';
        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
            significado = data.candidates[0].content.parts[0].text;
        }

        res.json({ significado });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao comunicar com a API do Gemini.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
