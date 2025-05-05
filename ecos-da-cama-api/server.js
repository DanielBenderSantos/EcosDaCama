const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Substitua com a sua chave de API real
const apiKey = 'AIzaSyB9h_j18wnJMQKUDzWqrXcSxfh6HhSVIJc';
const modelName = 'gemini-1.5-pro-latest'; // Use o modelo que funcionou no teste direto

// Endpoint para receber o sonho do aplicativo Android
app.post('/api/interpretar-sonho', async (req, res) => {
    const { sonho } = req.body;
    console.log (sonho)
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
        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            significado = data.candidates[0].content.parts[0].text;
        }

        res.json({ significado });

    } catch (error) {
        console.error('Erro ao comunicar com a API do Gemini:', error);
        res.status(500).json({ error: 'Erro ao obter o significado do sonho.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});