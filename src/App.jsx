import { useState, useEffect } from "react";
const TYPES = {
  "Barber Shop": { icon: "💈", t: ["Hi {name}, kal cutting 5 baje hai 💈", "10% OFF next visit {name}!"] },
  "Beauty Parlour": { icon: "💅", t: ["Hi {name}, Bridal 30% OFF 💅", "Appointment kal 3 baje {name}"] },
  "Gym": { icon: "💪", t: ["{name}, fees kal due hai 💪", "Aaj leg day hai {name}!"] },
  "Laptop Shop": { icon: "💻", t: ["{name}, laptop ready hai 💻", "Invoice Rs 5000 - {name}"] },
  "General": { icon: "🏪", t: ["Hi {name}, naya stock aaya!", "Shukriya {name}!"] },
};
const PLANS = [
  { name: "Trial", pricePK: "Rs 0", priceUS: "$0", per: "/month", msgs: "30 Msgs", desc: "Free Trial", features: ["30 Messages", "1 Business"], popular: false },
  { name: "Growth", pricePK: "Rs 3999", priceUS: "$55", per: "/month", msgs: "2000 Msgs", desc: "Most Popular", features: ["2000 Messages/mo", "All Templates", "Support"], popular: true },
  { name: "Scale", pricePK: "Rs 7999", priceUS: "$101", per: "/month", msgs: "Unlimited", desc: "For Big Shops", features: ["Unlimited Msgs", "Multi-Branch", "API Access"], popular: false },
];
const PAYMENT = { title: "MUHAMMAD ABID", acc: "00300110014755", iban: "PK56MEZN0000300110014755", branch: "MEEZAN DIGITAL CENTRE", payoneer: "abid.abali63@gmail.com", whatsapp: "923001001475" };

export default function App() {
  const [biz, setBiz] = useState(localStorage.getItem("biz")||"");
  const [custs, setCusts] = useState(JSON.parse(localStorage.getItem("custs")||"[]"));
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tpl, setTpl] = useState("");
  const [log, setLog] = useState("");
  const [showPay, setShowPay] = useState(false);

  useEffect(()=>{localStorage.setItem("custs", JSON.stringify(custs))},[custs]);
  useEffect(()=>{if(biz) localStorage.setItem("biz", biz)},[biz]);

  const add = ()=>{ if(!name||!phone) return; setCusts([...custs, {id: Date.now(), name, phone}]); setName(""); setPhone(""); };

  const send = async (c) => {
    if(!tpl){ setLog("⚠️ Template select karo!"); return; }
    const msg = tpl.replace("{name}", c.name);
    try {
      const pid = import.meta.env.VITE_WA_PHONE_ID;
      const token = import.meta.env.VITE_WA_TOKEN;
      if(pid && token){
        setLog(`⏳ ${c.name} ko bhej raha...`);
        const res = await fetch(`https://graph.facebook.com/v20.0/${pid}/messages`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: c.phone.replace(/[^0-9]/g,""), type: "text", text: { body: msg } })
        });
        const data = await res.json();
        if(data.error) throw new Error(data.error.message);
        setLog(`✅ ${c.name} ko bhej diya!`);
        return;
      }
    } catch(e){ setLog(`❌ ${e.message}`); }
    window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}`, "_blank");
    setLog(`✅ WhatsApp khula - ${c.name}`);
  };

  if(!biz){
    return (<div style={{background:"black", minHeight:"100vh", color:"white", padding:"20px", textAlign:"center"}}>
      <h1 style={{fontSize:"36px"}}>⚡ EplyMate</h1>
      <p style={{color:"#aaa"}}>Monthly WhatsApp SaaS - No Yearly</p>
      <h3 style={{marginTop:"30px"}}>Business Select Karo</h3>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", maxWidth:"400px", margin:"20px auto"}}>
        {Object.keys(TYPES).map(b=><div key={b} onClick={()=>setBiz(b)} style={{background:"#111", padding:"22px", borderRadius:"16px", cursor:"pointer", border:"1px solid #333"}}><div style={{fontSize:"32px"}}>{TYPES[b].icon}</div><b>{b}</b></div>)}
      </div>
    </div>)
  }

  return (<div style={{background:"#0a0a0a", minHeight:"100vh", color:"white", padding:"15px"}}><div style={{maxWidth:"700px", margin:"auto"}}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><h2 style={{margin:0}}>{TYPES[biz].icon} {biz}</h2><div><button onClick={()=>setShowPay(!showPay)} style={{background:"#00ff88", color:"black", border:"none", padding:"9px 14px", borderRadius:"10px", fontWeight:"bold", marginRight:"8px"}}>💳 ${"55 / $101"}</button><button onClick={()=>setBiz("")} style={{background:"#222", color:"white", border:"none", padding:"8px 12px", borderRadius:"8px"}}>Change</button></div></div>

    {showPay && (<div style={{background:"#111", padding:"16px", borderRadius:"16px", marginTop:"16px", border:"1.5px solid #00ff88"}}>
      <h3 style={{textAlign:"center", margin:"0 0 4px"}}>Monthly Plans Only</h3>
      <p style={{textAlign:"center", color:"#888", fontSize:"12px", margin:"0 0 14px"}}>No yearly - Pay monthly, cancel anytime</p>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px"}}>
        {PLANS.map(p=><div key={p.name} style={{background: p.popular? "#1a2e1a" : "#1e1e1e", padding:"12px", borderRadius:"12px", border: p.popular? "2px solid #00ff88" : "1px solid #333", textAlign:"center"}}>
          {p.popular && <div style={{background:"#00ff88", color:"black", fontSize:"10px", padding:"3px 8px", borderRadius:"10px", display:"inline-block", marginBottom:"5px", fontWeight:"bold"}}>POPULAR</div>}
          <b>{p.name}</b><br/><span style={{fontSize:"11px", color:"#aaa"}}>{p.desc}</span><div style={{fontSize:"11px", background:"#222", padding:"4px 6px", borderRadius:"6px", margin:"8px 0"}}>{p.msgs}</div><div style={{fontSize:"13px", fontWeight:"bold"}}><div>{p.pricePK}{p.per}</div><div style={{color:"#00aaff"}}>{p.priceUS}{p.per}</div></div><div style={{textAlign:"left", fontSize:"11px", marginTop:"8px", lineHeight:"1.6"}}>{p.features.map(f=><div key={f}>✅ {f}</div>)}</div>
        </div>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"14px", fontSize:"12px"}}>
        <div style={{background:"#222", padding:"12px", borderRadius:"10px"}}><b style={{color:"#00ff88"}}>🇵🇰 Meezan</b><br/>Title: {PAYMENT.title}<br/>Acc: {PAYMENT.acc}<br/>IBAN: {PAYMENT.iban}<br/><a href={`https://wa.me/${PAYMENT.whatsapp}?text=Salam, EplyMate Monthly Plan ke liye Meezan me payment kiya`} target="_blank" style={{display:"block", background:"#25D366", color:"white", textAlign:"center", padding:"8px", borderRadius:"8px", textDecoration:"none", marginTop:"8px", fontWeight:"bold"}}>📱 Receipt</a></div>
        <div style={{background:"#222", padding:"12px", borderRadius:"10px"}}><b style={{color:"#00aaff"}}>🌍 Payoneer $55 / $101</b><br/>Email: {PAYMENT.payoneer}<br/>Monthly Only<br/>No Yearly<br/><a href={`https://wa.me/${PAYMENT.whatsapp}?text=Hi, Paid for EplyMate Monthly via Payoneer to ${PAYMENT.payoneer}`} target="_blank" style={{display:"block", background:"#008CFF", color:"white", textAlign:"center", padding:"8px", borderRadius:"8px", textDecoration:"none", marginTop:"8px", fontWeight:"bold"}}>💳 Receipt</a></div>
      </div>
    </div>)}

    <div style={{background:"#111", padding:"15px", borderRadius:"15px", marginTop:"15px"}}><h4 style={{margin:"0 0 8px"}}>➕ Customer Add</h4><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" style={{width:"45%", padding:"11px", borderRadius:"8px", border:"none", marginRight:"5%", background:"#1e1e1e", color:"white"}}/><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="923001234567" style={{width:"45%", padding:"11px", borderRadius:"8px", border:"none", background:"#1e1e1e", color:"white"}}/><button onClick={add} style={{width:"100%", marginTop:"10px", padding:"12px", background:"#00ff88", border:"none", borderRadius:"10px", fontWeight:"bold"}}>Add Customer</button></div>
    <div style={{background:"#111", padding:"15px", borderRadius:"15px", marginTop:"15px"}}><h4 style={{margin:"0 0 8px"}}>📩 Template</h4>{TYPES[biz].t.map((t,i)=><div key={i} onClick={()=>setTpl(t)} style={{background:tpl===t?"#00ff88":"#222", color:tpl===t?"black":"white", padding:"11px", borderRadius:"10px", marginBottom:"8px", cursor:"pointer", fontSize:"13px"}}>{t}</div>)}</div>
    <div style={{background:"#111", padding:"15px", borderRadius:"15px", marginTop:"15px"}}><h4 style={{margin:"0 0 5px"}}>👥 Customers ({custs.length})</h4><div style={{fontSize:"12px", color:"#00ff88", minHeight:"18px", marginBottom:"8px"}}>{log}</div>{custs.map(c=><div key={c.id} style={{background:"#1a1a1a", padding:"12px", borderRadius:"10px", marginTop:"8px", display:"flex", justifyContent:"space-between", alignItems:"center"}}><div><b>{c.name}</b><br/><span style={{fontSize:"12px", color:"#aaa"}}>{c.phone}</span></div><button onClick={()=>send(c)} style={{background:"#25D366", color:"white", border:"none", padding:"9px 14px", borderRadius:"9px", fontWeight:"bold"}}>Send</button></div>)}</div>
  </div></div>)
    }
