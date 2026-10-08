import { useState, useEffect } from "react";

const PLANS = [
  { name: "Trial", pk: "Rs 0", us: "$0", per: "/mo", msgs: "50 Auto Replies", feat: ["50 Replies", "No Booking"], pop: false },
  { name: "Growth", pk: "Rs 9999", us: "$149", per: "/mo", msgs: "ABALI 360°", feat: ["Auto Price Reply", "Auto Booking", "Location Auto"], pop: true },
  { name: "Scale", pk: "Rs 19999", us: "$299", per: "/mo", msgs: "GEO Empire", feat: ["Unlimited", "Multi-Branch", "Powered by GEO Lab"], pop: false },
];
const PAY = { title: "MUHAMMAD ABID", acc: "00300110014755", iban: "PK56MEZN0000300110014755", payoneer: "abid.abali63@gmail.com", wa: "923001001475" };

export default function App() {
  const [bizName, setBizName] = useState(localStorage.getItem("bizName")||"");
  const [services, setServices] = useState(localStorage.getItem("services")||"Haircut - Rs 1000\nBeard - Rs 500\nFacial - Rs 2000");
  const [location, setLocation] = useState(localStorage.getItem("loc")||"");
  const [ownerNum, setOwnerNum] = useState(localStorage.getItem("owner")||"");
  const [customers, setCustomers] = useState(JSON.parse(localStorage.getItem("custs")||"[]"));
  const [cName, setCName] = useState(""); const [cPhone, setCPhone] = useState("");
  const [log, setLog] = useState(""); const [showPay, setShowPay] = useState(false);
  const [botPreview, setBotPreview] = useState("");

  useEffect(()=>{ localStorage.setItem("bizName", bizName); localStorage.setItem("services", services); localStorage.setItem("loc", location); localStorage.setItem("owner", ownerNum); localStorage.setItem("custs", JSON.stringify(customers)); }, [bizName, services, location, ownerNum, customers]);

  const addCust = ()=>{ if(!cName||!cPhone) return; setCustomers([...customers, {id: Date.now(), name: cName, phone: cPhone}]); setCName(""); setCPhone(""); setLog(`✅ ${cName} added`); };
  const generateBotReply = (msg) => {
    if(msg.includes("price") || msg.includes("rate") || msg.includes("kitna")){
      return `Welcome to ${bizName}! 🚀\n\nPowered by ABALI AI 360°\n\nServices:\n${services}\n\n📍 ${location || "Location on booking"}\n\nBooking ke liye "booking" likhein!`;
    }
    if(msg.includes("book")){ return `Great! ${bizName} booking:\n1. Naam\n2. Service?\n3. Time?\n\nBhejein - ABALI AI 360° confirm karega! ✅`; }
    if(msg.includes("location")){ return `📍 ${bizName}\n${location}\n\nPowered by Abali GEO Lab`; }
    return `Hi! ${bizName} me khush amdid! 👋\nABALI AI 360° active hai!\n\n${services}\n\n"price" likhein ya "booking" likhein.`;
  };
  const testBot = ()=>{ setBotPreview(generateBotReply("price")); };

  if(!bizName){
    return (
      <div style={{background:"black", minHeight:"100vh", color:"white", padding:"20px", textAlign:"center"}}>
        <h1 style={{fontSize:"32px", letterSpacing:"2px"}}>ABALI AI 360°</h1>
        <p style={{color:"#00ff88", fontSize:"13px", letterSpacing:"1px"}}>A PRODUCT BY ABALI GEO LAB</p>
        <p style={{color:"#aaa", fontSize:"12px", marginTop:"5px"}}>Generative Engine for Local Business - Auto-Pilot</p>
        <div style={{background:"#111", padding:"20px", borderRadius:"16px", maxWidth:"400px", margin:"25px auto", textAlign:"left", border:"1px solid #222"}}>
          <h3 style={{margin:0}}>Business Setup</h3><p style={{fontSize:"11px", color:"#666", margin:"4px 0 12px"}}>Jo detail daloge, bot usi se jawab dega</p>
          <input value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="Business Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", marginTop:"8px"}}/>
          <textarea value={services} onChange={e=>setServices(e.target.value)} rows={4} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", marginTop:"10px"}}/>
          <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Google Map Link" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", marginTop:"10px"}}/>
          <input value={ownerNum} onChange={e=>setOwnerNum(e.target.value)} placeholder="Owner WhatsApp 92300..." style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", marginTop:"10px"}}/>
          <button onClick={()=>{if(bizName) setBizName(bizName)}} style={{width:"100%", padding:"14px", background:"#00ff88", border:"none", borderRadius:"12px", fontWeight:"bold", marginTop:"15px", fontSize:"15px"}}>Launch ABALI AI 360° 🚀</button>
          <p style={{textAlign:"center", color:"#444", fontSize:"10px", marginTop:"12px"}}>Abali GEO Lab | LinkedIn • Reddit • X</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{background:"#0a0a0a", minHeight:"100vh", color:"white", padding:"15px"}}><div style={{maxWidth:"700px", margin:"auto"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}><div><h2 style={{margin:0, fontSize:"18px"}}>ABALI AI 360°</h2><p style={{margin:0, fontSize:"10px", color:"#00ff88"}}>BY ABALI GEO LAB • {bizName}</p></div><div><button onClick={()=>setShowPay(!showPay)} style={{background:"#00ff88", color:"black", border:"none", padding:"9px 14px", borderRadius:"10px", fontWeight:"bold", marginRight:"8px"}}>💳 $149 / $299</button><button onClick={()=>setBizName("")} style={{background:"#222", color:"white", border:"none", padding:"8px 12px", borderRadius:"8px"}}>Edit</button></div></div>

      {showPay && (
        <div style={{background:"#111", padding:"16px", borderRadius:"16px", marginTop:"16px", border:"1.5px solid #00ff88"}}>
          <h3 style={{textAlign:"center", margin:"0"}}>ABALI AI 360° Plans</h3><p style={{textAlign:"center", color:"#666", fontSize:"11px", margin:"4px 0 10px"}}>Powered by Abali GEO Lab - Monthly Only</p>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px"}}>
            {PLANS.map(p=><div key={p.name} style={{background: p.pop?"#1a2e1a":"#1e1e1e", padding:"12px", borderRadius:"12px", border: p.pop?"2px solid #00ff88":"1px solid #333", textAlign:"center"}}><b>{p.name}</b><div style={{fontSize:"10px", color:"#aaa"}}>{p.msgs}</div><div style={{margin:"8px 0", fontWeight:"bold", fontSize:"13px"}}>{p.pk}<br/><span style={{color:"#00aaff"}}>{p.us}{p.per}</span></div><div style={{fontSize:"11px", textAlign:"left"}}>{p.feat.map(f=><div key={f}>✅ {f}</div>)}</div></div>)}
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"14px", fontSize:"12px"}}>
            <div style={{background:"#222", padding:"12px", borderRadius:"10px"}}><b style={{color:"#00ff88"}}>🇵🇰 Meezan</b><br/>{PAY.title}<br/>{PAY.acc}<br/><a href={`https://wa.me/${PAY.wa}?text=ABALI AI 360 Paid`} target="_blank" style={{display:"block", background:"#25D366", color:"white", textAlign:"center", padding:"8px", borderRadius:"8px", textDecoration:"none", marginTop:"8px", fontWeight:"bold"}}>Receipt</a></div>
            <div style={{background:"#222", padding:"12px", borderRadius:"10px"}}><b style={{color:"#00aaff"}}>🌍 Payoneer</b><br/>{PAY.payoneer}<br/>$149 / $299<br/><a href={`https://wa.me/${PAY.wa}?text=Paid $149 ABALI AI 360`} target="_blank" style={{display:"block", background:"#008CFF", color:"white", textAlign:"center", padding:"8px", borderRadius:"8px", textDecoration:"none", marginTop:"8px", fontWeight:"bold"}}>Receipt</a></div>
          </div>
        </div>
      )}

      <div style={{background:"#111", padding:"15px", borderRadius:"15px", marginTop:"15px"}}>
        <h4 style={{margin:"0 0 8px"}}>🤖 Auto-Reply Preview (Entry-Based)</h4>
        <div style={{background:"#1e1e1e", padding:"12px", borderRadius:"10px", fontSize:"13px", whiteSpace:"pre-wrap", borderLeft:"3px solid #00ff88"}}>{services}</div>
        <button onClick={testBot} style={{width:"100%", padding:"12px", background:"#222", color:"#00ff88", border:"1px solid #00ff88", borderRadius:"10px", marginTop:"10px", fontWeight:"bold"}}>🔍 Test Bot - "price" ka jawab dekho</button>
        {botPreview && <div style={{background:"#00ff88", color:"black", padding:"12px", borderRadius:"10px", marginTop:"10px", whiteSpace:"pre-wrap", fontSize:"13px"}}>{botPreview}</div>}
      </div>

      <div style={{background:"#111", padding:"15px", borderRadius:"15px", marginTop:"15px"}}><h4>👥 Customers</h4><input value={cName} onChange={e=>setCName(e.target.value)} placeholder="Name" style={{width:"45%", padding:"11px", borderRadius:"8px", border:"none", marginRight:"5%", background:"#1e1e1e", color:"white"}}/><input value={cPhone} onChange={e=>setCPhone(e.target.value)} placeholder="92300..." style={{width:"45%", padding:"11px", borderRadius:"8px", border:"none", background:"#1e1e1e", color:"white"}}/><button onClick={addCust} style={{width:"100%", marginTop:"10px", padding:"12px", background:"#00ff88", border:"none", borderRadius:"10px", fontWeight:"bold"}}>Add</button><div style={{color:"#00ff88", fontSize:"12px", marginTop:"8px"}}>{log}</div></div>

      <p style={{textAlign:"center", color:"#333", fontSize:"10px", marginTop:"25px", lineHeight:"1.5"}}>ABALI AI 360°<br/>A Product by Abali GEO Lab<br/>LinkedIn • Reddit • X • Generative Engine Optimization<br/>Meezan {PAY.acc} | {PAY.payoneer}</p>
    </div></div>
  )
                                                                                                                                                                                                                                                             }
