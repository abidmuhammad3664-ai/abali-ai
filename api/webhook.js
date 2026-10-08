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
      const v = req.body.entry?.[0]?.changes?.[0]?.value;
      if (!v?.messages) return res.status(200).send('OK');
      const m = v.messages[0];
      const from = m.from;
      const text = m.text?.body || "Salam";
      const phoneId = v.metadata.phone_number_id;
      let reply = "Walaikum As Salam! " + text;
      try {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + process.env.GROQ_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "system", content: "You are Abali AI. Friendly reply." }, { role: "user", content: text }],
            max_tokens: 200
          })
        });
        const d = await r.json();
        if (d.choices?.[0]?.message?.content) reply = d.choices[0].message.content;
      } catch (e) {}
      await fetch("https://graph.facebook.com/v20.0/" + phoneId + "/messages", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.WHATSAPP_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messaging_product: "whatsapp", to: from, text: { body: reply } })
      });
      return res.status(200).send('OK');
    } catch (e) { return res.status(200).send('OK'); }
  }
  return res.status(200).send('OK');
}
