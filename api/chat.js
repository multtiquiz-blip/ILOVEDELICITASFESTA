// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userMessage = req.body.message;
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    return res.status(400).json({ reply: 'Por favor, digite uma mensagem válida.' });
  }

  const SYSTEM_PROMPT = `Você é a Delinha, assistente virtual da I Love Delicitas.
REGRAS:
- Responda SOMENTE com as informações abaixo. NUNCA invente.
- Se não souber, diga: "Não sei. Fale com atendente pelo WhatsApp (31) 99999-9999."

FATOS:
- Produtos: salgados, doces, mini lanches. NÃO temos bolo, refrigerantes ou bebidas.
- Fritura: cliente retira já frito ou congelado (mesmo preço). Fritura no local tem custo extra (orçamento separado).
- Entrega: sem frota. Cliente retira ou chama Uber/99.
- Pagamento: Pix ou cartão em até 3x. Sinal 50%.
- Prazos: até 300 un = 72h; 300-800 = 7 dias; +800 ou fritura local = 15 dias.
- Orçamento: só WhatsApp. NUNCA dê preços.

RESPOSTAS PADRÃO:
- Prazo: "Prazo de [X] dias para [Y] unidades."
- Fritura: "Retira já frito ou congelado. Fritura local custa extra."
- Entrega: "Retirada ou app (Uber/99)."
- Pagamento: "Pix ou cartão em até 3x."
- Preço: "Consulte valores pelo WhatsApp."

Se a pergunta não for sobre isso, responda: "Fale com atendente pelo WhatsApp."`;

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

  // Se a chave não existir, retorna mensagem amigável (status 200)
  if (!MISTRAL_API_KEY) {
    console.error('MISTRAL_API_KEY não definida no ambiente.');
    return res.status(200).json({ 
      reply: "A Delinha está com problemas técnicos. Por favor, fale conosco pelo WhatsApp (31) 99999-9999." 
    });
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",  // ✅ Modelo atualizado
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.2,
        max_tokens: 600  // ✅ Aumentado para evitar cortes
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro da Mistral API:', response.status, errorData);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();
    res.status(200).json({ reply });
  } catch (error) {
    console.error('Erro ao chamar Mistral:', error);
    res.status(200).json({ 
      reply: "Desculpe, estou com problemas. Fale conosco pelo WhatsApp (31) 99999-9999." 
    });
  }
}
