export default async function handler(req, res) {
  if (req.method === 'GET') {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
      return res.status(200).send(req.query['hub.challenge']);
    }
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

      // YAHAN PE LOCK HAI - AI KO SIRF EK HI PLAN MILEGA
      let activePackages, activePayment, extraMsgPrice;
      if (isPakistan) {
        activePackages = `BASIC - Rs 3,000/month -> 1,500 Messages\nPRO - Rs 5,000/month (Most Popular) -> 5,000 Messages\nPREMIUM - Rs 10,000/month -> 15,000 Messages`;
        activePayment = `Meezan Bank - MUHAMMAD ABID\nAccount: 00300110014755\nIBAN: PK56MEZN0000300110014755\nScreenshot bhej den.`;
        extraMsgPrice = "Extra 1000 messages Rs 800 me";
      } else {
        activePackages = `BASIC - $49/month -> 1,500 Messages\nPRO - $99/month (Most Popular) -> 5,000 Messages\nPREMIUM - $199/month -> 15,000 Messages`;
        activePayment = `Payoneer: abid.abali63@gmail.com\nSend screenshot after payment.`;
        extraMsgPrice = "Extra 1000 messages $15 me";
      }

      const systemPrompt = `
Tum Abali AI 360 ke Sales Agent ho. Naam Abid hai, pura naam Abid Abali hai. Malik = Abid Abali.

TUMHARA KAAM:
Customer Number: ${from}
Country: ${isPakistan? 'Pakistan (PKR)' : 'International (USD)'}
User ne likha: "${userText}"

TUMHARE PAAS SIRF YE PLANS HAIN, ISKE ILAVA KOI PLAN NAHI HAI:
${activePackages}
Payment: ${activePayment}

STRICT RULES:
1. Customer jis zaban me likhe usi me jawab do. Roman Urdu -> Roman Urdu, English -> English.
2. Agar user "Basic ki detail do" bole to SIRF Basic wala plan batao, sari list mat do.
3. Agar user puche "1500 khatam ho gaye to / Agar 1 month se pehle khatam ho gaye to" -> TO KABHI BHI PLAN LIST MAT DIKHAO. SIRF YE JAWAB DO: "${extraMsgPrice} mil jayenge ya aap PRO/PREMIUM pe upgrade kar sakte ho, upgrade foran ho jata hai. Konsa plan active kar dun?"
4. Hamesha short jawab do 2-3 lines.
5. Kabhi Rs aur $ ek sath mat likho. Tumhare paas sirf ${isPakistan? 'Rs wala plan hai' : '$ wala plan hai'}.
`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
          max_tokens: 300,
          temperature: 0.1
        })
      });

      const data = await groqRes.json();
      let aiReply = data.choices?.[0]?.message?.content || activePackages;

      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: from, text: { body: aiReply } })
      });
      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
  return res.status(200).send('OK');
}
