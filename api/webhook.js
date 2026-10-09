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

      const isPakistan = true; // Sab ko PKR dikhayega

      const pakPackages = `
*Abali AI 360 - Plans*

BASIC - Rs 3,000/month
- 1,500 Messages

PRO - Rs 5,000/month (Most Popular)
- 5,000 Messages

PREMIUM - Rs 10,000/month
- 15,000 Messages
`;

      const pakPayment = `
Meezan Bank - MUHAMMAD ABID
Account: 00300110014755
IBAN: PK56MEZN0000300110014755

Payment ke baad screenshot bhej den, 10 min me active ho jayega.
`;

      const systemPrompt = `
You are Abali AI 360 Sales Assistant.
Packages: ${pakPackages}
Payment: ${pakPayment}

RULES - STRICT:
1. Use simple Roman Urdu, short.
2. If user asks Salam: Reply "Wa Alaikum Salam! Abali AI 360 me khush amdeed" - STOP, dont show plans.
3. If user asks plan/price: Show pakPackages ONLY and ask once "Kaunsa plan chahiye?"
4. If user says Basic/Pro/Premium longa: Say "Zabardast! Apne [PLAN] select kia. Payment details:" + pakPayment + "Screenshot bhej den." - Do NOT ask kaunsa plan again.
5. If user asks payment: Show pakPayment only.
6. NEVER write "1 Bot, 5 Bot, Unlimited Bot, Smart AI, Auto Reply". ONLY show plan name, price, message count.
7. Be human, don't repeat same sentence.
`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userText }
          ],
          max_tokens: 400
        })
      });

      const data = await groqRes.json();
      let aiReply = data.choices?.[0]?.message?.content || pakPackages;

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
      return res.status(200).send('OK');
    }
  }
  return res.status(200).send('OK');
}
