import { useState } from "react";
export default function App() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResult("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"];
      let lastError = "";
      for (const model of models) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Write a detailed SEO optimized article in English on: ${topic}` }] }] })
          });
          const data = await res.json();
          if(data.error) throw new Error(data.error.message);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if(text){ setResult(text); return; }
        } catch(err){ lastError = err.message; }
      }
      throw new Error(lastError);
    } catch(e){ setResult("ERROR: "+e.message); }
    finally{ setLoading(false); }
  };
  return (
    <div style={{ background: "black", minHeight: "100vh", color: "white", padding: "20px", textAlign: "center" }}>
      <h1>⚡ Abali AI</h1>
      <div style={{ background: "#111", padding: "20px", borderRadius: "15px", maxWidth: "500px", margin: "20px auto" }}>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Enter topic" style={{ width: "90%", padding: "14px", borderRadius: "10px" }} />
        <button onClick={generate} style={{ width: "95%", marginTop: "10px", padding: "14px", background: "#00ff88", border: "none", borderRadius: "10px", fontWeight: "bold" }}>{loading? "Generating..." : "Generate with Abali AI 🚀"}</button>
      </div>
      {result && <div style={{ background: "white", color: "black", padding: "15px", borderRadius: "15px", maxWidth: "500px", margin: "auto", textAlign: "left", whiteSpace: "pre-wrap" }}>{result}</div>}
      <p>Made by Abid Muhammad ❤️</p>
    </div>
  );
}
