import { useState, useEffect } from "react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [bizName, setBizName] = useState("");
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [ownerNum, setOwnerNum] = useState("");

  const WA_NUMBER = "923132175727";

  useEffect(() => {
    if (localStorage.getItem("abali_login") === "true") {
      setIsLoggedIn(true);
    }
    const b = localStorage.getItem("bizName");
    if (b) setBizName(b);
    const s = localStorage.getItem("services");
    if (s) setServices(s);
    const l = localStorage.getItem("loc");
    if (l) setLocation(l);
    const o = localStorage.getItem("owner");
    if (o) setOwnerNum(o);
  }, []);

  useEffect(() => {
    localStorage.setItem("bizName", bizName);
    localStorage.setItem("services", services);
    localStorage.setItem("loc", location);
    localStorage.setItem("owner", ownerNum);
  }, [bizName, services, location, ownerNum]);

  const handleLogin = () => {
    if (!email || !pass) {
      alert("Email aur Password dalo!");
      return;
    }
    localStorage.setItem("abali_login", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("abali_login");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{background:"black", minHeight:"100vh", color:"white", display:"flex", justifyContent:"center", alignItems:"center", padding:"15px"}}>
        <div style={{maxWidth:"380px", width:"100%", textAlign:"center"}}>
          <h1 style={{fontSize:"34px", margin:"0"}}>ABALI AI 360°</h1>
          <p style={{color:"#00ff88", fontSize:"12px", marginTop:"5px", fontWeight:"bold"}}>BY ABALI GEO LAB</p>
          
          <div style={{background:"#111", padding:"22px", borderRadius:"18px", marginTop:"25px", textAlign:"left", border:"1px solid #222"}}>
            <h3 style={{margin:"0 0 15px", textAlign:"center"}}>Login to Continue</h3>
            
            <label style={{fontSize:"12px", color:"#aaa"}}>Email / WhatsApp</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" style={{width:"100%", padding:"13px", borderRadius:"11px", border:"none", background:"#1e1e1e", color:"white", margin:"6px 0 14px"}}/>

            <label style={{fontSize:"12px", color:"#aaa"}}>Password</label>
            <input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} placeholder="Access code" style={{width:"100%", padding:"13px", borderRadius:"11px", border:"none", background:"#1e1e1e", color:"white", margin:"6px 0 18px"}}/>

            <button onClick={handleLogin} style={{width:"100%", padding:"14px", background:"#00ff88", border:"none", borderRadius:"12px", fontWeight:"bold", fontSize:"15px"}}>Login & Launch</button>

            <div style={{marginTop:"18px", textAlign:"center"}}>
              <a href={"https://wa.me/" + WA_NUMBER + "?text=Salam Abali AI 360 ka access chahiye"} target="_blank" style={{display:"inline-block", background:"#222", color:"#00ff88", padding:"10px 18px", borderRadius:"10px", textDecoration:"none", fontSize:"12px", fontWeight:"bold", border:"1px solid #333"}}>Buy Access - Rs 9999 / $149</a>
              <p style={{fontSize:"10px", color:"#555", marginTop:"8px"}}>Contact: +92 313 2175727</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"black", minHeight:"100vh", color:"white", padding:"15px"}}>
      <div style={{maxWidth:"500px", margin:"auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"10px"}}>
          <h2 style={{margin:0, fontSize:"18px"}}>ABALI AI 360°</h2>
          <button onClick={handleLogout} style={{background:"#222", color:"#aaa", border:"none", padding:"8px 12px", borderRadius:"8px", fontSize:"11px"}}>Logout</button>
        </div>

        <div style={{background:"#111", padding:"18px", borderRadius:"16px", marginTop:"20px", textAlign:"left", border:"1px solid #222"}}>
          <h3 style={{textAlign:"center"}}>Business Setup</h3>
          <input value={bizName} onChange={(e)=>setBizName(e.target.value)} placeholder="Business Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", margin:"10px 0"}}/>
          <textarea value={services} onChange={(e)=>setServices(e.target.value)} placeholder="Products / Services + Price" rows={5} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", margin:"10px 0"}}/>
          <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Google Map Link" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", margin:"10px 0"}}/>
          <input value={ownerNum} onChange={(e)=>setOwnerNum(e.target.value)} placeholder="Owner WhatsApp" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"none", background:"#222", color:"white", margin:"10px 0"}}/>
          <div style={{background:"#1a2e1a", padding:"12px", borderRadius:"10px", marginTop:"10px", border:"1px solid #00ff88"}}>
            <p style={{fontSize:"12px", margin:0, color:"#00ff88"}}>Bot Active for: {bizName || "Your Business"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
