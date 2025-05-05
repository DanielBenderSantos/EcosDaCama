const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Substitua com a sua chave de API do Google AI Studio
const apiKey = 'AIzaSyB9h_j18wnJMQKUDzWqrXcSxfh6HhSVIJc';
const modelName = 'gemini-1.5-pro-latest'; // Ou outro modelo listado que suporte generateContent


async function generateContent(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const headers = {
        'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
        contents: [{
            parts: [{ text: prompt }]
        }]
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body,
        });

        console.log('Status da Resposta HTTP:', response.status);
        const responseText = await response.text();
        console.log('Resposta Bruta da API:', responseText);

        const data = JSON.parse(responseText);

        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else if (data && data.error) {
            console.error('Erro da API do Gemini:', data.error);
            return null;
        } else {
            console.log('Resposta da API do Gemini sem conteúdo claro.');
            return null;
        }
    } catch (error) {
        console.error('Erro ao chamar a API do Gemini:', error);
        return null;
    }
}

readline.question('Digite o seu prompt para o Gemini: ', async (prompt) => {
    if (prompt) {
        console.log('Enviando prompt...');
        const responseText = await generateContent(prompt);

        if (responseText) {
            console.log('\nResposta do Gemini:');
            console.log(responseText);
        } else {
            console.log('\nNão foi possível obter uma resposta do Gemini.');
        }
    } else {
        console.log('Nenhum prompt fornecido.');
    }
    readline.close();
});