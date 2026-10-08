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
      const entry = req.body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      if (!value?.messages) return res.status(200).send('OK');
      const msg = value.messages[0];
      const from = msg.from;
      const userText = msg.text?.body || "Salam";
      const phoneId = value.metadata.phone_number_id;
      let aiReply = "";
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are Abali AI 360 made by Abid. Reply short friendly in user's language (Urdu Roman/English)." },
              { role: "user", content: userText }
            ],
            max_tokens: 250
          })
        });
        const data = await groqRes.json();
        aiReply = data.choices?.[0]?.message?.content || "";
      } catch(e){}
      if (!aiReply) aiReply = `Walaikum Salam! Main Abali AI hun, batao kya help karun?`;

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
    } catch(err){ return res.status(200).send('OK'); }
  }
  return res.status(200).send('OK');
}
