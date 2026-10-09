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

      const isPakistan = from.startsWith("92");

      const pakPackages = `
PAKISTAN PLANS (PKR):

1. BASIC - Rs 3,000/month
- 1,500 Messages / month
- 1 WhatsApp AI Bot
- Auto Reply 24/7

2. PRO - Rs 5,000/month (Most Popular)
- 5,000 Messages / month
- 5 WhatsApp AI Bots
- Smart AI Reply

3. PREMIUM - Rs 10,000/month
- 15,000 Messages / month
- Unlimited AI Bots
- Advanced AI + Full Customization
`;

      const intlPackages = `
INTERNATIONAL PLANS (USD):

1. BASIC - $49/month
- 2,000 Messages / month
- 1 WhatsApp AI Bot
- Auto Reply 24/7

2. PRO - $99/month (Most Popular)
- 7,000 Messages / month
- 5 WhatsApp AI Bots
- Smart AI Reply

3. PREMIUM - $199/month
- 20,000 Messages / month
- Unlimited AI Bots
- Advanced AI + Full Customization
`;

      const pakPayment = `
Pakistan Payment:
Meezan Bank - MUHAMMAD ABID
Account: 00300110014755
IBAN: PK56MEZN0000300110014755
Payment ke baad screenshot bhejen. 10 min me access active.
`;

      const intlPayment = `
International Payment:
Payoneer: abid.abali63@gmail.com
After payment, send screenshot here. Access active in 10 mins.
Website: abali-ai.vercel.app
`;

      const systemPrompt = `
You are Abali AI 360 Sales Assistant. Owner: Muhammad Abid.
Customer: ${from}, isPakistan: ${isPakistan}

PACKAGES:
${isPakistan? pakPackages : intlPackages}

PAYMENT:
${isPakistan? pakPayment : intlPayment}

RULES:
1. Be professional, short. Use Roman Urdu if Pakistan, else English.
2. If user asks price/plan/package - show ONLY packages with message limits. NO payment.
3. If user asks payment/buy - show ONLY payment info.
4. If Hi/Hello - Greet: "As-salamu Alaikum! Abali AI 360 me khush amdeed. Me apki kia madad kar sakta hun?"
5. Show only ${isPakistan? 'PKR' : 'USD'} plans. Never mix.
6. Never mention PayPal or Free Website.
7. End with: "Kaunsa plan lena chahenge?" / "Which plan would you like?"
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
