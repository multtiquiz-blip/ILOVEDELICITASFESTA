export default async function handler(req, res) {
  // Verifica o método da requisição
  if (req.method !== 'POST') {
    console.warn('Método não permitido:', req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userMessage = req.body.message;
  console.log('📩 Mensagem recebida do usuário:', userMessage);

  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    console.warn('Mensagem vazia ou inválida');
    return res.status(400).json({ reply: 'Por favor, digite uma mensagem válida.' });
  }

  // SYSTEM_PROMPT completo (mesmo do seu HTML)
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
  console.log('🔑 Chave da Mistral:', MISTRAL_API_KEY ? 'Configurada (sim)' : 'NÃO CONFIGURADA');

  if (!MISTRAL_API_KEY) {
    console.error('❌ Chave da Mistral não encontrada nas variáveis de ambiente');
    return res.status(200).json({ 
      reply: "A Delinha está com problemas técnicos. Por favor, fale conosco pelo WhatsApp (31) 99999-9999." 
    });
  }

  try {
    console.log('📤 Chamando a API da Mistral...');
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ],
        temperature: 0.2,
        max_tokens: 600
      })
    });

    console.log('📥 Resposta da Mistral - Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na Mistral API:', response.status, errorData);
      return res.status(200).json({ 
        reply: "Desculpe, estou com problemas. Fale conosco pelo WhatsApp (31) 99999-9999." 
      });
    }

    const data = await response.json();
    console.log('📦 Dados recebidos da Mistral:', data);

    const reply = data.choices?.[0]?.message?.content?.trim() || 
                   "Não consegui processar sua pergunta. Fale com atendente pelo WhatsApp.";
    console.log('✅ Resposta gerada:', reply);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('❌ Erro crítico ao chamar a Mistral:', error);
    return res.status(200).json({ 
      reply: "Desculpe, estou com problemas. Fale conosco pelo WhatsApp (31) 99999-9999." 
    });
  }
}
