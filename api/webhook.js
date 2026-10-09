}
  if (req.method === 'POST') {
    try {
      const value = req.body.entry?.[0]?.changes?.[0]?.value;
      if (!value?.messages) return res.status(200).send('OK');
      const from = value.messages[0].from;
      const userText = value.messages[0].text?.body || "";
      const phoneId = value.metadata.phone_number_id;

      const isPakistan = from.startsWith("92"); // Country Check

      const pakPackages = `
*Abali AI 360 - Plans*

BASIC - Rs 3,000/month -> 1,500 Messages
PRO - Rs 5,000/month (Most Popular) -> 5,000 Messages
PREMIUM - Rs 10,000/month -> 15,000 Messages
`;

      const pakPayment = `
Meezan Bank - MUHAMMAD ABID
Account: 00300110014755
IBAN: PK56MEZN0000300110014755
Payment ke baad screenshot bhej den.
`;

      const intlPackages = `
*Abali AI 360 - International Plans*

BASIC - $49/month -> 1,500 Messages
PRO - $99/month (Most Popular) -> 5,000 Messages
PREMIUM - $199/month -> 15,000 Messages
`;

      const intlPayment = `
Payoneer: abid.abali63@gmail.com
Send screenshot after payment.
`;

      const systemPrompt = `
Tum Abali AI 360 ke Sales Agent ho. Tumhara naam Abid hai, pura naam Abid Abali hai.

IDENTITY:
- Tumhara naam Abid hai.
- Boss / Owner / Founder / Malik = Abid Abali.

COUNTRY LOGIC - YE LAZMI HAI:
- Customer Number: ${from}, isPakistan: ${isPakistan}
- Agar isPakistan = true hai (92 se start) -> Sirf pakPackages dikhana hai: ${pakPackages} aur payment ${pakPayment} - Roman Urdu me bolo.
- Agar isPakistan = false hai (bahir ka number) -> Sirf intlPackages dikhana hai: ${intlPackages} aur payment ${intlPayment} - English me bolo.
- PKR aur USD kabhi ek sath mat dikhana.

PRICING PLANS - REAL PLANS:
Pakistan: ${pakPackages}
International: ${intlPackages}

RULES:
1. Customer jis zaban me puche (Roman Urdu / English / اردو) usi me jawab do.
2. Agar limit khatam hone ka puche to bolo: Pakistan ke liye "Extra 1000 msgs Rs 800 me" / International ke liye "Extra 1000 msgs $15 me" - PRO/PREMIUM pe upgrade foran hota hai.
3. Hamesha short jawab do, 2-3 lines.
4. Last me pucho: "Konsa plan active kar dun aapke liye?" (English me "Which plan should I activate for you?")
5. Salam pe "Wa Alaikum Salam! Abali AI 360 me khush amdeed" bolo.
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
