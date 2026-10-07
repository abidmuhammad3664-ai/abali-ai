import { useState } from 'react'

function App() {
  const [topic, setTopic] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if(!topic) return alert("Topic likho!");
    setLoading(true);
    setResult("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if(!apiKey){
        setResult("ERROR: Vercel pe VITE_GEMINI_API_KEY nahi mili! Settings > Environment Variables check karo.");
        setLoading(false);
        return;
      }
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ contents: [{ parts: [{ text: `Write 1000 word SEO article on: ${topic}. Give title, keywords, and full article.` }] }] })
      });
      const data = await res.json();
      console.log(data);
      if(data.error){
        setResult(`GOOGLE ERROR: ${data.error.message}`);
      } else {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
        setResult(text);
      }
    } catch(e){
      setResult("Catch Error: " + e.message)
    }
    setLoading(false);
  }

  return (
    <div style={{background:"#000", color:"#fff", minHeight:"100vh", padding:"20px", fontFamily:"sans-serif"}}>
      <h1 style={{textAlign:"center"}}>⚡ Abali AI</h1>
      <p style={{textAlign:"center"}}>Your AI SaaS - SEO Content Generator</p>
      <div style={{maxWidth:"600px", margin:"20px auto", background:"#111", padding:"20px", borderRadius:"15px"}}>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic likho..." style={{width:"100%", padding:"12px", borderRadius:"8px", border:"none"}} />
        <button onClick={generate} style={{width:"100%", marginTop:"10px", padding:"12px", background:"#00ff88", border:"none", borderRadius:"8px", fontWeight:"bold", cursor:"pointer"}}>
          {loading? "Generating..." : "Generate with Abali AI 🚀"}
        </button>
      </div>
      {result && <div style={{maxWidth:"600px", margin:"20px auto", background:"#fff", color:"#000", padding:"20px", borderRadius:"15px", whiteSpace:"pre-wrap"}}>{result}</div>}
      <p style={{textAlign:"center", marginTop:"30px", color:"#888"}}>Made by Abid Muhammad ❤️</p>
    </div>
  )
}
export default App;
