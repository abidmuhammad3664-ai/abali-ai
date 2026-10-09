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

      // Country Check
      const isPakistan = from.startsWith("92");

      const pakPrice = `
Pakistan Packages (PKR):
- Basic: Rs 3,000/month
- Pro: Rs 5,000/month
- Premium: Rs 10,000/month
Payment: MUHAMMAD ABID, Meezan Bank, Acc: 00300110014755, IBAN: PK56MEZN0000300110014755. Screenshot bhejo.
`;

      const intlPrice = `
International Packages (USD):
- Basic: $49/month
- Pro: $99/month
- Premium: $199/month
Payment: Payoneer: abid.abali63@gmail.com. Send screenshot.
`;

      const systemPrompt = `
Tum Abali AI 360 ho. Malik Abid hai. Urdu Roman me short friendly jawab do.
Customer Number: ${from}, isPakistan: ${isPakistan}

RULES:
- Agar isPakistan true hai (92 se start), to sirf ye dikhao: ${pakPrice} Aur Urdu Roman me bolo.
- Agar isPakistan false hai, to sirf ye dikhao: ${intlPrice} Aur English me bolo.
- Dono PKR aur USD kabhi ek sath mat dikhana.
- Agar access mange to bolo abali-ai.vercel.app pe jao aur payment ke baad screenshot isi WhatsApp pe bhejo.
- Fazool sawal ka jawab mat do, bolo me sirf Abali AI 360 ke bare me bata sakta hun.
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
      let aiReply = data.choices?.[0]?.message?.content;
      if (!aiReply) aiReply = isPakistan? pakPrice : intlPrice;

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
