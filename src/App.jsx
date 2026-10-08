import { useState, useEffect } from "react";

const PAY = { 
  title: "MUHAMMAD ABID", 
  acc: "00300110014755", 
  iban: "PK56MEZN0000300110014755", 
  payoneer: "abid.abali63@gmail.com", 
  wa: "923132175727"
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [bizName, setBizName] = useState("");
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [ownerNum, setOwnerNum] = useState("");

  useEffect(() => {
    const login = localStorage.getItem("abali_login");
    if (login === "true") setIsLoggedIn(true);
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
    localStorage.setItem("abali_user", email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("abali_login");
    setIsLoggedIn(false);
    setBizName("");
  };

  if (!isLoggedIn) {
    return (
      <div style={{background:"black", minHeight:"100vh", color:"white", display:"flex", justifyContent:"center", alignItems:"center", padding:"15px"}}>
        <div style={{maxWidth:"380px", width:"100%", textAlign:"center"}}>
          <h1 style={{fontSize:"34px", letterSpacing:"2px", margin:"0"}}>ABALI AI 360°</h1>
          <p style={{color:"#00ff88", fontSize:"12px", letter
