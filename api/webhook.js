export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      const value = body.entry?.[0]?.changes?.[0]?.value;
      if (!value?.messages) return res.status(200).send('OK');

      const msg = value.messages[0];
      const from = msg.from;
      const text = msg.text?.body || "Salam";
      const phoneId = value.metadata.phone_number_id;

      let reply = "Walaikum As Salam!";
      try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + process.env.GROQ_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are Abali AI 360 from Pakistan. Friendly, helpful. Reply in user's language. Use IN SHA ALLAH." },
              { role: "user", content: text }
            ],
            max_tokens: 300
          })
        });
        const d = await r.json();
        if (d.choices && d.choices[0]) reply = d.choices[0].message.content;
      } catch (err) {
        reply = "Assalam-o-Alaikum! Aapne kaha: " + text + " - IN SHA ALLAH jawab deta hun!";
      }

      await fetch("https://graph.facebook.com/v20.0/" + phoneId + "/messages", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.WHATSAPP_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        })
      });

      return res.status(200).send('OK');
    } catch (e) {
      return res.status(200).send('OK');
    }
  }
  return res.status(200).send('OK');
}
