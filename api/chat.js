export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userMessage = req.body.message || '';

  // Resposta fixa para testar a comunicação
  return res.status(200).json({
    reply: `Olá, Rubemar! Eu sou a Delinha. Você disse: "${userMessage}"`
  });
}
