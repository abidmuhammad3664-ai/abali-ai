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
      const value = req.body.entry?.[0]?.changes?.[0]?.value;
      if (!value?.messages) return res.status(200).send('No message');
      const message = value.messages[0];
      const from = message.from;
      const text = message.text?.body || "";
      const phoneNumberId = value.metadata.phone_number_id;
      let reply = "";
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: "You are Abali AI 360, helpful Islamic AI assistant from Pakistan. Reply in same language as user. Be friendly, concise. Use IN SHA ALLAH." },
              { role: "user", content: text }
            ],
            temperature: 0.7, max_tokens: 400
          })
        });
        const data = await groqRes.json();
        reply = data.choices?.[0]?.message?.content || "Walaikum As Salam! Kaise madad kar sakta hun?";
      } catch (e) {
        reply = `Assalam-o-Alaikum! Main Abali AI hun 🤖\n\nAapne kaha: "${text}"\n\nIN SHA ALLAH main jald jawab dunga!`;
      }
      await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: from, text: { body: reply } })
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(200).send("OK");
    }
  }
}
