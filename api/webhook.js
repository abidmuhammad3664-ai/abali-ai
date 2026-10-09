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

      const pakPackages = `*Abali AI 360 - Plans*\n\nBASIC - Rs 3,000/month -> 1,500 Messages\nPRO - Rs 5,000/month (Most Popular) -> 5,000 Messages\nPREMIUM - Rs 10,000/month -> 15,000 Messages`;
      const pakPayment = `Meezan Bank - MUHAMMAD ABID\nAccount: 00300110014755\nIBAN: PK56MEZN0000300110014755\nPayment ke baad screenshot bhej den.`;
      const intlPackages = `*Abali AI 360 - International Plans*\n\nBASIC - $49/month -> 1,500 Messages\nPRO - $99/month (Most Popular) -> 5,000 Messages\nPREMIUM - $199/month -> 15,000 Messages`;
      const intlPayment = `Payoneer: abid.abali63@gmail.com\nSend screenshot after payment.`;

      // Language Detect
      const isUrduScript = /[\u0600-\u06FF]/.test(userText);
      let detectedLang = "English";
      if (isUrduScript) detectedLang = "Urdu (اردو میں)";
      else if (/[ء-ي]/.test(userText) || userText.match(/\b(ye|kia|hai|kya|kaunsa|konsa|plan|chahiye|kitne|paisa|bhai)\b/i)) detectedLang = "Roman Urdu";

      // If user wrote only Hi/Hello in English, force English
      if (userText.toLowerCase().match(/^(hi|hello|hey|price|plans|how much)/)) detectedLang = "English";

      const systemPrompt = `
Tum Abali AI 360 ke Sales Agent ho. Naam Abid, pura naam Abid Abali hai.
Boss/Malik = Abid Abali.

CUSTOMER: Number=${from}, isPakistan=${isPakistan}, UserLanguage=${detectedLang}, UserText="${userText}"

COUNTRY RULE - STRICT - NO MISTAKE:
- isPakistan = ${isPakistan}
- Agar isPakistan TRUE hai -> SIRF YEH DIKHAO: ${pakPackages} + ${pakPayment}. Kabhi $ mat dikhana.
- Agar isPakistan FALSE hai -> SIRF YEH DIKHAO: ${intlPackages} + ${intlPayment}. Kabhi Rs mat dikhana. Kyunki ye +1 / bahir ka number hai.

LANGUAGE RULE - STRICT - NO MIXING:
- UserLanguage = ${detectedLang}
- Agar UserLanguage = English hai -> SIRF ENGLISH ME JAWAB DO. Roman Urdu ka ek lafz bhi mat likho.
- Agar UserLanguage = Roman Urdu hai -> SIRF ROMAN URDU ME JAWAB DO.
- Agar UserLanguage = Urdu hai -> SIRF اردو میں جواب دو.
- Kabhi 2 zubane mix mat karo.

SALAM RULE:
- Sirf tab "Wa Alaikum Salam" bolo jab user Salam likhe. "Hi" pe "Hi! Welcome to Abali AI 360" bolo.

FLOW:
- Plan puche to plan dikhao + last me pucho "Konsa plan active kar dun?" (English me "Which plan should I activate?")
- Limit puche to: PK = "Extra 1000 msgs Rs 800 me", Intl = "Extra 1000 msgs $15 me"
`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
          max_tokens: 350,
          temperature: 0.2
        })
      });

      const data = await groqRes.json();
      let aiReply = data.choices?.[0]?.message?.content || (isPakistan? pakPackages : intlPackages);

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
