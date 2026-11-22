"use client"
import { useState } from "react"

const GOLD = "#c9a86a"

const videos = [
  { src: "/torre-01-exterior.mp4", kicker: "ACTO 1 — EXTERIOR", title: "De vectores. A Hudson Yards.", desc: "Vectores → 3D → Render. El edificio nace delante de ti. Hudson Yards, New York." },
  { src: "/torre-02-interior.mp4", kicker: "ACTO 2 — INTERIOR", title: "Entrar y sentir que llegaste.", desc: "Lobby doble altura. Gimnasio. Café-Bar. Restaurante. Todo en millones." },
  { src: "/torre-03-parking.mp4", kicker: "ACTO 3 — PARKING", title: "Llegas. Te reciben.", desc: "Sótano privado. Portón. Flechas LED en el piso. Host que te acompaña al elevador." },
  { src: "/torre-04-suite.mp4", kicker: "ACTO 4 — SUITE PRESIDENCIAL", title: "La suite que no se muestra. Se vive.", desc: "Biométrico + voz. Lobby presidencial. Isla curva de parota. Extractor oro 24K. Lámparas de millón. TV 200 pulgadas." },
  { src: "/torre-05-master.mp4", kicker: "ACTO 5 — MASTER BEDROOM", title: "La cama de Dios.", desc: "80m2. Piso parota con epoxi transparente. Jacuzzi. Sauna. Hidro. Bar. Super King. Mármol negro con venas oro y titanio. Luces halo. Cortinas que se cierran solas. Luces de la ciudad. Modo íntimo." },
]

export default function Home() {
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim()) return
    setEnviando(true)
    try {
      const form = new FormData()
      form.append("access_key", "e39fe332-98d5-455c-95f5-664eee8ffb01")
      form.append("subject", "Mensaje")
      form.append("from_name", "")
      form.append("message", mensaje.trim())
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: form })
      if (res.ok) { setEnviado(true); setMensaje("") }
    } catch {}
    setEnviando(false)
  }

  return (
    <main style={{ background: "#000", color: "white", fontFamily: "Arial, Helvetica, sans-serif", overflowX: "hidden" }}>
      {/* HERO */}
      <section style={{ minHeight: "100vh", padding: "28px 8% 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 4, color: GOLD }}>
          <span>MICHEL GUERRERO — ARCHITECT — NEW YORK</span><span>HUDSON YARDS</span>
        </div>
        <div>
          <p style={{ letterSpacing: 6, fontSize: 12, color: GOLD, marginBottom: 16 }}>HUDSON YARDS — NEW YORK</p>
          <h1 style={{ fontSize: "clamp(52px, 10vw, 128px)", lineHeight: 0.88, fontWeight: 900, letterSpacing: -2, margin: 0, textTransform: "uppercase" }}>De cero.<br /><span style={{ color: GOLD }}>A Hudson</span><br />Yards.</h1>
          <p style={{ fontSize: 19, maxWidth: 640, color: "#ccc", lineHeight: 1.5, marginTop: 22 }}>Arquitectura del nivel Pritzker. Formada en el lenguaje de Zaha Hadid.<br />Un edificio que nace delante de ti. Del primer vector a la última silla.</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
          <p style={{ fontSize: 11, letterSpacing: 3, color: "#888" }}>HAZ SCROLL — LA PELÍCULA EMPIEZA ↓</p>
          <p style={{ fontSize: 11, letterSpacing: 3, color: GOLD }}>TORRE GUERRERO — 5 VIDEOS — FULL SCROLL</p>
        </div>
      </section>

      {/* 5 VIDEOS */}
      {videos.map((v, i) => (
        <section key={i} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "end" }}>
          <video src={v.src} autoPlay muted loop playsInline preload="auto" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
          <div style={{ position: "relative", padding: "60px 8%", maxWidth: 900 }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>{v.kicker}</p>
            <h2 style={{ fontSize: "clamp(36px, 6vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "12px 0" }}>{v.title}</h2>
            <p style={{ color: "#ddd", fontSize: 18, lineHeight: 1.5, maxWidth: 640 }}>{v.desc}</p>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: 3 }}>VIDEO {i+1} / 5 — SIN CORTES</p>
          </div>
        </section>
      ))}

      {/* CONTACTO PRIVADO */}
      <section style={{ padding: "80px 6%", background: "#0a0a0a", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", textTransform: "uppercase" }}>Hablemos en <span style={{ color: GOLD }}>privado.</span></h2>
        <p style={{ color: "#aaa" }}>No pedimos tu nombre ni tu correo. Solo tu mensaje. Trusting People.</p>
        {enviado ? (
          <p style={{ background: "#12261a", border: "1px solid #2e7d32", padding: 20, maxWidth: 600, margin: "24px auto", color: "#a5d6a7" }}>Mensaje enviado. Gracias por confiar.</p>
        ) : (
          <form onSubmit={enviar} style={{ maxWidth: 600, margin: "24px auto", textAlign: "left" }}>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe tu mensaje aqui... Si quieres que te contacte, dejalo dentro del mensaje." rows={6} style={{ width: "100%", background: "#111", color: "white", border: `1px solid ${GOLD}`, padding: 16, fontSize: 16, borderRadius: 8, boxSizing: "border-box" }} />
            <button type="submit" disabled={enviando} style={{ width: "100%", marginTop: 14, background: GOLD, color: "black", border: "none", padding: "16px", borderRadius: 30, fontWeight: 900, fontSize: 16, cursor: "pointer" }}>{enviando ? "ENVIANDO..." : "ESCRIBEME EN PRIVADO →"}</button>
            <p style={{ fontSize: 12, color: "#777", textAlign: "center" }}>100% privado. Sin formularios. Sin seguimiento.</p>
          </form>
        )}
      </section>
      <footer style={{ padding: "24px 6%", display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#666" }}>
        <span>MICHEL GUERRERO — NEW YORK</span><span>HUDSON YARDS — TRUSTING PEOPLE</span>
      </footer>
    </main>
  )
}
