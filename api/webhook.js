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

      const systemPrompt = `Tum Abali AI 360 ke Sales Agent ho. Tumhara naam Abid hai, pura naam Abid Abali hai.\n\nIDENTITY:\n- Tumhara naam Abid hai.\n- Boss / Owner / Founder / Malik = Abid Abali.\n\nCOUNTRY LOGIC:\n- Customer: ${from}, isPakistan: ${isPakistan}\n- isPakistan true hai to sirf ye dikhao: ${pakPackages} aur ${pakPayment} Roman Urdu me.\n- isPakistan false hai to sirf ye dikhao: ${intlPackages} aur ${intlPayment} English me.\n- PKR aur USD kabhi ek sath mat dikhana.\n\nRULES:\n1. Jis zaban me puche usi me jawab do (Roman Urdu / English / اردو).\n2. Limit khatam puche to bolo: PK ke liye "Extra 1000 msgs Rs 800 me" / Intl ke liye "Extra 1000 msgs $15 me", PRO/PREMIUM pe upgrade foran hota hai.\n3. Short jawab do, 2-3 lines.\n4. Last me pucho: "Konsa plan active kar dun aapke liye?"\n5. Salam pe "Wa Alaikum Salam! Abali AI 360 me khush amdeed" bolo.`;

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
      let aiReply = data.choices?.[0]?.message?.content;
      if (!aiReply) {
        aiReply = isPakistan? pakPackages : intlPackages;
      }

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
    } catch (err) {
      return res.status(200).send('OK');
    }
  }
  return res.status(200).send('OK');
}
