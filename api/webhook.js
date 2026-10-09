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
      const lower = userText.toLowerCase();

      // COUNTRY LOCK
      const isPakistan = from.startsWith("92");

      let plans, basicOnly, proOnly, premiumOnly, payment, extra, endQuestion;

      if (isPakistan) {
        plans = `*Abali AI 360 - Plans*\n\nBASIC - Rs 3,000/month -> 1,500 Messages\nPRO - Rs 5,000/month (Most Popular) -> 5,000 Messages\nPREMIUM - Rs 10,000/month -> 15,000 Messages`;
        basicOnly = `BASIC - Rs 3,000/month -> 1,500 Messages\nPayment: Meezan Bank - MUHAMMAD ABID, 00300110014755, IBAN: PK56MEZN0000300110014755`;
        proOnly = `PRO - Rs 5,000/month (Most Popular) -> 5,000 Messages\nPayment: Meezan Bank - MUHAMMAD ABID, 00300110014755`;
        premiumOnly = `PREMIUM - Rs 10,000/month -> 15,000 Messages\nPayment: Meezan Bank - MUHAMMAD ABID, 00300110014755`;
        extra = `Agar 1,500 messages 1 month se pehle khatam ho gaye to Extra 1000 messages Rs 800 me mil jayenge ya aap PRO/PREMIUM pe upgrade kar sakte ho.`;
        endQuestion = `Konsa plan active kar dun aapke liye?`;
      } else {
        plans = `*Abali AI 360 - International Plans*\n\nBASIC - $49/month -> 1,500 Messages\nPRO - $99/month (Most Popular) -> 5,000 Messages\nPREMIUM - $199/month -> 15,000 Messages`;
        basicOnly = `BASIC - $49/month -> 1,500 Messages\nPayment: Payoneer - abid.abali63@gmail.com`;
        proOnly = `PRO - $99/month (Most Popular) -> 5,000 Messages\nPayment: Payoneer - abid.abali63@gmail.com`;
        premiumOnly = `PREMIUM - $199/month -> 15,000 Messages\nPayment: Payoneer - abid.abali63@gmail.com`;
        extra = `If your 1,500 messages finish before a month, you can get Extra 1000 messages for $15 or upgrade to PRO/PREMIUM instantly.`;
        endQuestion = `Which plan should I activate for you?`;
      }

      // LANGUAGE DETECT
      const isEnglish = /^[A-Za-z0-9\s?$.,!@]+$/.test(userText) && lower.match(/^(hi|hello|what|which|how|price|plan|basic|pro|premium)/);
      let aiReply = "";

      // DIRECT CODE REPLY - AI KO BYPASS
      if (lower.includes("1500") && (lower.includes("khatam") || lower.includes("finish") || lower.includes("extra") || lower.includes("limit"))) {
        aiReply = extra + "\n\n" + endQuestion;
      } else if (lower === "basic" || lower.includes("basic ki detail") || lower.includes("basic detail")) {
        aiReply = basicOnly + "\n\n" + endQuestion;
      } else if (lower === "pro" || lower.includes("pro ki detail")) {
        aiReply = proOnly + "\n\n" + endQuestion;
      } else if (lower === "premium" || lower.includes("premium ki detail")) {
        aiReply = premiumOnly + "\n\n" + endQuestion;
      } else if (lower.includes("plan") || lower.includes("price") || lower.includes("package") || lower.includes("kitne")) {
        aiReply = plans + "\n\n" + endQuestion;
      } else {
        // BAAKI SAWALO KE LIYE AI - LEKIN ZUBAN LOCK KE SATH
        const langInstruction = isPakistan
         ? (isEnglish? "Reply ONLY in English. No Roman Urdu." : "Reply ONLY in Roman Urdu. No English mixing.")
          : "Reply ONLY in English. No Roman Urdu, no Urdu. Pure English only.";

        const systemPrompt = `You are Abali AI 360 Sales Agent. Name=Abid Abali, Owner=Abid Abali. Customer=${from}, Currency=${isPakistan?'PKR':'USD'}. User Language Rule: ${langInstruction}. Available Data: ${isPakistan? plans + ' + Meezan Bank' : plans + ' + Payoneer'}. User said: "${userText}". Rule: Never show Rs if USD customer, never show $ if PKR customer. Short 2-3 lines. End with "${endQuestion}"`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
            max_tokens: 250,
            temperature: 0
          })
        });
        const data = await groqRes.json();
        aiReply = data.choices?.[0]?.message?.content || plans;
      }

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
