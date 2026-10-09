export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) return res.status(200).send(req.query['hub.challenge']);
    return res.status(403).send('Forbidden');
  }
  if (req.method === 'POST') {
    try {
      const value = req.body.entry?.[0]?.changes?.[0]?.value;
      if (!value?.messages) return res.status(200).send('OK');
      const from = value.messages[0].from;
      const userText = value.messages[0].text?.body || "";
      const phoneId = value.metadata.phone_number_id;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "Tum Abali AI 360 ho. Malik Abid hai. Urdu Roman me jawab do. Agar access mange to bolo abali-ai.vercel.app pe jao." },
            { role: "user", content: userText }
          ],
          max_tokens: 400
        })
      });

      const data = await groqRes.json();
      let aiReply = data.choices?.[0]?.message?.content;

      if (!aiReply) {
        aiReply = "Bhai Groq se jawab nahi aaya, Error: " + JSON.stringify(data).slice(0,200);
      }

      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: aiReply }
        })
      });
      return res.status(200).send('OK');
    } catch(err){
      console.log(err);
      return res.status(200).send('OK');
    }
  }
  return res.status(200).send('OK');
}
