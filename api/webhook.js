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

      let reply = "";

      // 1. LIFETIME / MONTHLY - SAB SE PEHLE
      if (lower.includes("life time") || lower.includes("lifetime") || lower.includes("life-time")) {
        reply = isPakistan
        ? `Nahi, ye lifetime nahi hai, ye monthly plans hain.\nBASIC - Rs 3,000/month -> 1,500 Msgs/month`
          : `No, this is not lifetime, these are monthly plans.\nBASIC - $49/month -> 1,500 Msgs/month`;
      }
      // 2. NAME - Ap ka name / Ap kon ho
      else if (lower.includes("ap ka name") || lower.includes("apka name") || lower.includes("your name") || lower.includes("ap kon ho") || lower.includes("tum kon ho") || lower.includes("who are you") || lower.includes("ap ka naam")) {
        reply = `Mera naam Abid hai, pura naam Abid Abali hai.`;
      }
      // 3. OWNER
      else if (lower.includes("owner") || lower.includes("malik") || lower.includes("boss")) {
        reply = `Mere malik / owner ka naam Abid Abali hai.`;
      }
      // 4. GREETING
      else if (lower === "hi" || lower === "hello" || lower === "hey" || lower === "salam") {
        reply = lower.includes("salam")? `Wa Alaikum Salam!` : `Hi! Welcome to Abali AI 360.`;
      }
      // 5. EXTRA / KHATAM
      else if (lower.includes("khatam") || lower.includes("pehlay") || lower.includes("pehle") || lower.includes("extra")) {
        reply = isPakistan
        ? `Agar 1 month se pehle msg khatam ho gaye to Extra 1000 messages Rs 800/month me mil jayenge ya PRO/PREMIUM pe upgrade foran ho jata hai.`
          : `If messages finish before 1 month, extra 1000 messages for $15/month or upgrade to PRO/PREMIUM instantly.`;
      }
      // 6. SINGLE PLAN
      else if (lower.includes("basic")) {
        reply = isPakistan
        ? `BASIC - Rs 3,000/month -> 1,500 Messages/month\nPayment: Meezan Bank - MUHAMMAD ABID, 00300110014755`
          : `BASIC - $49/month -> 1,500 Messages/month\nPayment: Payoneer - abid.abali63@gmail.com`;
      }
      else if (lower.includes("pro")) {
        reply = isPakistan
        ? `PRO - Rs 5,000/month (Most Popular) -> 5,000 Messages/month\nPayment: Meezan Bank`
          : `PRO - $99/month (Most Popular) -> 5,000 Messages/month\nPayment: Payoneer`;
      }
      else if (lower.includes("premium")) {
        reply = isPakistan
        ? `PREMIUM - Rs 10,000/month -> 15,000 Messages/month\nPayment: Meezan Bank`
          : `PREMIUM - $199/month -> 15,000 Messages/month\nPayment: Payoneer`;
      }
      // 7. ALL PLANS
      else if (lower.includes("plan") || lower.includes("price") || lower.includes("kitne")) {
        reply = isPakistan
        ? `BASIC - Rs 3,000/month -> 1,500 Msgs/month\nPRO - Rs 5,000/month -> 5,000 Msgs/month\nPREMIUM - Rs 10,000/month -> 15,000 Msgs/month`
          : `BASIC - $49/month -> 1,500 Msgs/month\nPRO - $99/month -> 5,000 Msgs/month\nPREMIUM - $199/month -> 15,000 Msgs/month`;
      }
      else {
        reply = `Ji bataiye, konsa plan chahiye?`;
      }

      // End question add - Name/Owner pe nahi
      if (!lower.includes("name") &&!lower.includes("naam") &&!lower.includes("kon ho") &&!lower.includes("owner") &&!lower.includes("malik") &&!lower.includes("who")) {
        reply += `\n\nKonsa plan active kar dun?`;
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
