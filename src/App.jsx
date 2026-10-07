import { useState } from 'react'

function App() {
  const [topic, setTopic] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if(!topic) return alert("Topic likho bhai!");
    setLoading(true);
    setResult("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          contents: [{parts: [{text: `You are Abali AI, SEO expert. Write a full 1000 word SEO optimized article in Roman Urdu + English mix on topic: ${topic}. Give Title, Description, 5 Keywords, and Full Article with headings.`}]}]
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: API Key check karo";
      setResult(text);
    } catch(e){
      setResult("Error: " + e.message)
    }
    setLoading(false);
  }

  return (
    <div style={{background:"#000", color:"#fff", minHeight:"100vh", padding:"20px", fontFamily:"sans-serif"}}>
      <h1 style={{textAlign:"center"}}>⚡ Abali AI</h1>
      <p style={{textAlign:"center"}}>Your AI SaaS - SEO Content Generator</p>
      <div style={{maxWidth:"600px", margin:"20px auto", background:"#111", padding:"20px", borderRadius:"15px"}}>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic likho: e.g. Best Biryani Recipe" style={{width:"100%", padding:"12px", borderRadius:"8px", border:"none"}} />
        <button onClick={generate} style={{width:"100%", marginTop:"10px", padding:"12px", background:"#00ff88", border:"none", borderRadius:"8px", fontWeight:"bold", cursor:"pointer"}}>
          {loading? "Generating..." : "Generate with Abali AI 🚀"}
        </button>
      </div>
      {result && <div style={{maxWidth:"600px", margin:"20px auto", background:"#fff", color:"#000", padding:"20px", borderRadius:"15px", whiteSpace:"pre-wrap"}}>🔥 Abali AI - Result for: {topic}{"\n\n"}{result}</div>}
      <p style={{textAlign:"center", marginTop:"30px", color:"#888"}}>Made by Abid Muhammad ❤️ abali-ai</p>
    </div>
  )
}
export default App;
