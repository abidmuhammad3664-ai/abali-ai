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

      const isPakistan = from.startsWith("92") || true; // Test ke liye PK dikhayega

      const pakPackages = `
*Pakistan Plans (PKR):*

1. *BASIC* - Rs 3,000/month
- 1,500 Messages / month
- 1 WhatsApp AI Bot
- Auto Reply 24/7

2. *PRO* - Rs 5,000/month (Most Popular)
- 5,000 Messages / month
- 5 WhatsApp AI Bots
- Smart AI Reply

3. *PREMIUM* - Rs 10,000/month
- 15,000 Messages / month
- Unlimited AI Bots
- Advanced AI + Full Customization
`;

      const pakPayment = `
Pakistan Payment:
Meezan Bank - MUHAMMAD ABID
Account: 00300110014755
IBAN: PK56MEZN0000300110014755

Payment ke baad screenshot yahin bhej den, 10 min me access active ho jayega.
`;

      const intlPackages = `
*International Plans (USD):*
1. BASIC - $49 - 2,000 Messages
2. PRO - $99 - 7,000 Messages
3. PREMIUM - $199 - 20,000 Messages
`;
      const intlPayment = `Payoneer: abid.abali63@gmail.com - Screenshot bhej den`;

      const systemPrompt = `
You are Abali AI 360 Sales Assistant. Owner Muhammad Abid.
Customer: ${from}, isPakistan: ${isPakistan}

PACKAGES: ${isPakistan? pakPackages : intlPackages}
PAYMENT: ${isPakistan? pakPayment : intlPayment}

SMART RULES:
1. Language: Roman Urdu for Pakistan, English for international. Short & professional.
2. If user says Salam/Hi: Greet ONCE only "As-salamu Alaikum! Abali AI 360 me khush amdeed. Me apki kia madad kar sakta hun?" Do NOT add plan question here.
3. If user asks plan/price/detail: Show packages and END with "Kaunsa plan lena chahenge?" - ONLY HERE.
4. If user asks payment/detail: Show ONLY payment info. Do NOT ask Kaunsa plan again. Say "Screenshot bhej den".
5. If user says "Basic longa / Pro longa": Do NOT show plans again. Directly say "Behtareen! Basic ke liye [payment info]" and then stop.
6. NEVER repeat same line twice. Be natural like human.
7. Never mention PayPal or Free Website.
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
          max_tokens: 500
        })
      });

      const data = await groqRes.json();
      let aiReply = data.choices?.[0]?.message?.content || (isPakistan? pakPackages : intlPackages);

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
