import { useState } from 'react'

export default function App(){
  const [topic,setTopic]=useState('')
  const [result,setResult]=useState('')
  const [loading,setLoading]=useState(false)

  const generate=()=>{
    if(!topic) return alert('Topic likho bhai!')
    setLoading(true)
    setTimeout(()=>{
      setResult(`🔥 Abali AI - Result for: ${topic}

1. Title: ${topic} - Best Guide 2025
2. Description: Learn everything about ${topic} with Abali AI. SEO optimized, human style.
3. Keywords: ${topic}, ${topic} guide, best ${topic}

Article Intro:
${topic} is one of the most important topics in 2025. In this guide by Abali AI, we will explain everything step by step...

Full 1000 word article + images will be available after Vercel deployment.`)
      setLoading(false)
    },1500)
  }

  return (
    <div style={{fontFamily:'system-ui', background:'#0a0a0a', color:'white', minHeight:'100vh', padding:'20px'}}>
      <div style={{maxWidth:'700px', margin:'0 auto'}}>
        <h1 style={{fontSize:'36px', textAlign:'center'}}>⚡ Abali AI</h1>
        <p style={{textAlign:'center', opacity:0.7}}>Your AI SaaS - SEO Content Generator</p>
        <div style={{background:'#1e1e1e', padding:'20px', borderRadius:'16px', marginTop:'30px', border:'1px solid #333'}}>
          <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Topic likho: e.g. Best Biryani Recipe" style={{width:'100%', padding:'14px', borderRadius:'10px', border:'none', fontSize:'16px', boxSizing:'border-box'}} />
          <button onClick={generate} style={{width:'100%', marginTop:'12px', padding:'14px', background:'#00ff88', color:'black', fontWeight:'bold', borderRadius:'10px', border:'none', fontSize:'18px'}}>
            {loading?'Generating...':'Generate with Abali AI 🚀'}
          </button>
        </div>
        {result && <div style={{background:'white', color:'black', padding:'20px', borderRadius:'16px', marginTop:'20px', whiteSpace:'pre-wrap', lineHeight:'1.6'}}>{result}</div>}
        <p style={{textAlign:'center', marginTop:'30px', opacity:0.5}}>Made by Abid Muhammad ❤️ abali-ai</p>
      </div>
    </div>
  )
}
