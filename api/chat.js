export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userMessage = req.body.message || '';

  // Substitua pela sua chave real da Mistral (use variável de ambiente)
  const apiKey = process.env.MISTRAL_API_KEY;

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny', // ou 'mistral-small', 'mistral-medium'
        messages: [
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Erro ao chamar Mistral:', error);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
