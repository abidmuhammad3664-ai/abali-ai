export default async function handler(req, res) {
  // VERIFY
  if (req.method === 'GET') {
    if (req.query['hub.verify_token'] === 'abali123') {
      return res.status(200).send(req.query['hub.challenge']);
    }
    return res.status(403).send('Forbidden');
  }

  // RECEIVE MESSAGE
  if (req.method === 'POST') {
    try {
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const msg = value?.messages?.[0];

      if (msg) {
        const from = msg.from; // sender number
        const text = msg.text?.body || "Hi";
        const phoneNumberId = value.metadata.phone_number_id;

        console.log(`Message from ${from}: ${text}`);

        // --- AI REPLY LOGIC ---
        let reply = `Assalam-o-Alaikum! Main Abali AI hun 🤖\n\nAapne kaha: "${text}"\n\nIN SHA ALLAH main jald hi aapke sawaalon ka jawab dunga!`;

        // Simple smart replies
        if (text.toLowerCase().includes('salam')) reply = "Walaikum As Salam! Kaise madad kar sakta hun?";
        if (text.toLowerCase().includes('price') || text.toLowerCase().includes('qimat')) reply = "Abali ki qimat ke liye hamare catalog dekhen ya 'price list' likhen!";
        if (text.toLowerCase().includes('order')) reply = "Order ke liye apna naam, address aur product likh kar bhejen!";

        // SEND BACK TO WHATSAPP
        await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: { body: reply }
          })
        });
      }
      return res.status(200).send('EVENT_RECEIVED');
    } catch (e) {
      console.error(e);
      return res.status(200).send('EVENT_RECEIVED');
    }
  }
}
