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
      const lower = userText.toLowerCase().trim();

      const isPakistan = from.startsWith("92");
      const isUrdu = /[\u0600-\u06FF]/.test(userText);
      const isEnglishWord = lower.match(/^(hi|hello|hey|other|another|payment|plan|price|what|basic|pro|premium)/);

      let reply = "";

      // 1. GREETING LOCK - Hi pe sirf Hi
      if (lower === "hi" || lower === "hello" || lower === "hey" || lower === "salam" || lower === "as-salamu alaikum") {
        if (lower.includes("salam")) {
          reply = isPakistan? "Wa Alaikum Salam! Abali AI 360 me khush amdeed." : "Wa Alaikum Salam! Welcome to Abali AI 360.";
        } else {
          reply = isPakistan &&!isEnglishWord? "Hi! Abali AI 360 me khush amdeed." : "Hi! Welcome to Abali AI 360. How can I help you?";
        }
        // Hi pe plan mat dikhao
      }
      else if (lower.includes("other") || lower.includes("another")) {
        reply = isPakistan
         ? (isEnglishWord? "We accept Meezan Bank. If you need other method, tell me." : "Payment Meezan Bank ke zariye hoti hai, agar aur method chahiye to batao.")
          : "We accept Payoneer: abid.abali63@gmail.com. Let me know if you need another method.";
      }
      else if (lower === "basic" || lower === "bacic") {
        reply = isPakistan
         ? `BASIC - Rs 3,000/month -> 1,500 Messages\nPayment: Meezan Bank - MUHAMMAD ABID, 00300110014755`
          : `BASIC - $49/month -> 1,500 Messages\nPayment: Payoneer - abid.abali63@gmail.com`;
      }
      else if (lower === "pro") {
        reply = isPakistan
         ? `PRO - Rs 5,000/month -> 5,000 Messages\nPayment: Meezan Bank`
          : `PRO - $99/month -> 5,000 Messages\nPayment: Payoneer`;
      }
      else if (lower === "premium") {
        reply = isPakistan
         ? `PREMIUM - Rs 10,000/month -> 15,000 Messages\nPayment: Meezan Bank`
          : `PREMIUM - $199/month -> 15,000 Messages\nPayment: Payoneer`;
      }
      else if (lower.includes("khatam") || lower.includes("finish") || lower.includes("limit") || lower.includes("extra")) {
        reply = isPakistan
         ? `Extra 1000 messages Rs 800 me mil jayenge ya PRO/PREMIUM pe upgrade foran ho jata hai.`
          : `Extra 1000 messages for $15 or upgrade to PRO/PREMIUM instantly.`;
      }
      else if (lower.includes("plan") || lower.includes("price") || lower.includes("package")) {
        reply = isPakistan
         ? `BASIC - Rs 3,000 -> 1,500 Msgs\nPRO - Rs 5,000 -> 5,000 Msgs\nPREMIUM - Rs 10,000 -> 15,000 Msgs`
          : `BASIC - $49 -> 1,500 Msgs\nPRO - $99 -> 5,000 Msgs\nPREMIUM - $199 -> 15,000 Msgs`;
      }
      else {
        // Default - zuban ke hisab se chota jawab
        if (isUrdu) reply = "Ji hukum? Konsa plan chahiye aapko?";
        else if (isPakistan &&!isEnglishWord) reply = "Ji bataiye, konsa plan chahiye?";
        else reply = "Hello! How can I help you today?";
      }

      // Last line - zuban ke hisab se
      if (!lower.includes("hi") &&!lower.includes("hello") &&!lower.includes("hey")) {
        if (isPakistan &&!isEnglishWord &&!isUrdu) {
          reply += `\n\nKonsa plan active kar dun?`;
        } else if (isEnglishWord ||!isPakistan) {
          reply += `\n\nWhich plan should I activate for you?`;
        }
      }

      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: from, text: { body: reply } })
      });
      return res.status(200).send('OK');
    } catch (err) { return res.status(200).send('OK'); }
  }
  return res.status(200).send('OK');
}
