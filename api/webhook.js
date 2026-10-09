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

      // FINAL COUNTRY LOCK - +1 (555) is always international
      const isPakistan = from.startsWith("92")? true : false;

      let activePackages, activePaymentSingle, activePaymentAll, extraPrice, currency;

      if (isPakistan) {
        currency = "PKR";
        activePackages = `*Abali AI 360 - Plans (PKR)*\n\nBASIC - Rs 3,000/month -> 1,500 Messages\nPRO - Rs 5,000/month (Most Popular) -> 5,000 Messages\nPREMIUM - Rs 10,000/month -> 15,000 Messages`;
        activePaymentAll = `Payment: Meezan Bank - MUHAMMAD ABID, Account: 00300110014755, IBAN: PK56MEZN0000300110014755`;
        extraPrice = "Extra 1000 messages Rs 800 me";
      } else {
        currency = "USD";
        activePackages = `*Abali AI 360 - Plans (USD)*\n\nBASIC - $49/month -> 1,500 Messages\nPRO - $99/month (Most Popular) -> 5,000 Messages\nPREMIUM - $199/month -> 15,000 Messages`;
        activePaymentAll = `Payment: Payoneer - abid.abali63@gmail.com`;
        extraPrice = "Extra 1000 messages $15 me";
      }

      const systemPrompt = `
You are Abali AI 360 Sales Agent. Name = Abid, Full Name = Abid Abali, Owner = Abid Abali.
Customer Number: ${from} | Country Type: ${currency} | isPakistan=${isPakistan}
User said: "${userText}"

YOU HAVE ONLY THIS DATA, NOTHING ELSE:
${activePackages}
${activePaymentAll}
Extra: ${extraPrice}

RULES - FOLLOW 100%:
1. Language: User English -> English only. Roman Urdu -> Roman Urdu only. Never mix.
2. PLAN LIST: If user says "plan / whats your plan / price", show ONLY ${activePackages}. DO NOT show payment with plan list.
3. SINGLE PLAN: If user says "Basic / Bacic / Pro / Premium", show ONLY that one plan detail + payment. Example: User says "Basic" -> Show "BASIC - ${isPakistan? 'Rs 3,000' : '$49'} -> 1500 Msgs + ${activePaymentAll} + Konsa plan active kar dun?" Do NOT show other 2 plans.
4. LIMIT QUESTION: If user says "1500 khatam / limit / agar pehle khatam ho gaye", NEVER show plan list. Only say "${extraPrice} mil jayenge ya PRO/PREMIUM pe upgrade foran ho jata hai".
5. NEVER EVER write Rs if currency is USD, and NEVER write $ if currency is PKR. Your currency is ${currency} only.
6. Short reply 2-3 lines. End with "Konsa plan active kar dun?" (English: "Which plan should I activate for you?")
`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
          max_tokens: 300,
          temperature: 0
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
