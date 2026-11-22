"use client"
import { useEffect, useRef, useState } from "react"
const GOLD = "#c9a86a"
// TORRE GUERRERO - LA GRAN MANZANA - FULL SCROLL VIDEO
// Videos completos, sin cortes, sin reducir tiempo.
// Se fusionan en 1 master con ffmpeg (ver instrucciones abajo)
// o se reproducen en secuencia con scrub por scroll.
// Archivos en /public:
// torre-01-exterior.mp4, torre-02-interior.mp4, torre-03-parking.mp4, torre-04-suite.mp4, torre-05-master.mp4
// Master fusionado: torre-guerrero-full.mp4

const SCENES = [
  { file: "/torre-01-exterior.mp4", kicker: "ESCENA 01 - EXTERIOR", title: "TORRE GUERRERO", sub: "Donde la ciudad aprende a mirar hacia arriba.", desc: "De cero. A Hudson Yards. Vectores, 3D, render full resolucion." },
  { file: "/torre-02-interior.mp4", kicker: "ESCENA 02 - AMENIDADES", title: "EL RECORRIDO", sub: "Puerta, lobby, gym, bar, restaurant.", desc: "Un solo plano secuencia. Sin cortes. Todo premium top." },
  { file: "/torre-03-parking.mp4", kicker: "ESCENA 03 - BIENVENIDA", title: "PARKING LOFT", sub: "Gate, LED, host, elevador.", desc: "La tecnologia abre. El humano recibe. Trusting People." },
  { file: "/torre-04-suite.mp4", kicker: "ESCENA 04 - SUITE PRESIDENCIAL", title: "LA QUE VENDE", sub: "Biometria, voz, cocina oro 24K, TV 200 pulg.", desc: "Parota. Oro 24 quilates. Vista que obedece tu voz." },
  { file: "/torre-05-master.mp4", kicker: "ESCENA 05 - FOOTER - MASTER BEDROOM 80 M2", title: "LA CAMA DE DIOS", sub: "Gym parota epoxi, jacuzzi, sauna, bar.", desc: "Cortinas se cierran solas. La ciudad se enciende. Adentro, como hacer el amor a escondidas." },
]

export default function Home() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight
        const p = h > 0 ? window.scrollY / h : 0
        setProgreso(p)
        // Scrub: cada video obedece a su seccion
        SCENES.forEach((_, i) => {
          const v = videoRefs.current[i]
          if (!v || !v.duration) return
          const sec = document.getElementById(`scene-${i}`)
          if (!sec) return
          const r = sec.getBoundingClientRect()
          const total = window.innerHeight + r.height
          const local = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total))
          // Suave sin lags: solo actualiza si diferencia > 0.02
          if (Math.abs(v.currentTime - local * v.duration) > 0.08) {
            v.currentTime = local * v.duration
          }
        })
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    onScroll()
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf) }
  }, [])

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
    <main style={{ background: "black", color: "white", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* HERO FIJO */}
      <section style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 6%", position: "relative", zIndex: 10 }}>
        <p style={{ letterSpacing: 8, fontSize: 12, color: GOLD, fontFamily: "Arial, sans-serif" }}>HUDSON YARDS - NUEVA YORK - LA GRAN MANZANA</p>
        <h1 style={{ fontSize: "clamp(56px, 11vw, 140px)", lineHeight: 0.9, fontWeight: 400, margin: "18px 0", letterSpacing: -1 }}>
          TORRE<br /><span style={{ color: GOLD, fontStyle: "italic", fontWeight: 400 }}>GUERRERO</span>
        </h1>
        <p style={{ fontSize: 20, fontStyle: "italic", color: "#ddd", maxWidth: 640 }}>Donde la ciudad aprende a mirar hacia arriba.</p>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: "#aaa", marginTop: 12 }}>Una torre-portico sobre el Hudson. Arquitectura de precision, luz de atardecer y silencio de altura.</p>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, letterSpacing: 4, color: GOLD, marginTop: 36 }}>DESLIZA - LA TORRE NO SE PRESENTA: SE RECORRE ↓</p>
        <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: `${progreso * 100}%`, background: GOLD, zIndex: 50 }} />
      </section>

      {/* 5 ESCENAS FUSIONADAS - CADA VIDEO COMPLETO, SIN CORTES */}
      {SCENES.map((s, i) => (
        <section key={i} id={`scene-${i}`} style={{ minHeight: "220vh", position: "relative" }}>
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
            <video ref={(el) => { videoRefs.current[i] = el }} src={s.file} muted playsInline preload="auto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.85) 100%)" }} />
            <div style={{ position: "absolute", bottom: "8%", left: "6%", right: "6%", maxWidth: 720 }}>
              <p style={{ letterSpacing: 6, fontSize: 11, color: GOLD, fontFamily: "Arial, sans-serif" }}>{s.kicker}</p>
              <h2 style={{ fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 0.95, fontWeight: 400, margin: "10px 0" }}>{s.title}</h2>
              <p style={{ fontSize: 20, fontStyle: "italic", color: "#eee" }}>{s.sub}</p>
              <p style={{ fontFamily: "Arial, sans-serif", fontSize: 15, color: "#ccc", lineHeight: 1.6 }}>{s.desc}</p>
              <p style={{ fontFamily: "Arial, sans-serif", fontSize: 11, letterSpacing: 3, color: GOLD }}>VIDEO COMPLETO - SIN CORTES - TU SCROLL CONTROLA EL TIEMPO</p>
            </div>
          </div>
        </section>
      ))}

      {/* CIERRE - CONTACTO PRIVADO */}
      <section style={{ padding: "100px 6%", background: "black", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ letterSpacing: 6, fontSize: 11, color: GOLD, fontFamily: "Arial, sans-serif" }}>TORRE GUERRERO - HUDSON YARDS</p>
        <h2 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 400, lineHeight: 1 }}>Esto no es una casa.<br /><span style={{ color: GOLD, fontStyle: "italic" }}>Es tu trono en Hudson Yards.</span></h2>
        <p style={{ fontStyle: "italic", color: "#aaa", fontSize: 18 }}>La puerta ya sabe quien eres. Solo falta que entres.</p>
        {enviado ? <p style={{ background: "#12261a", border: "1px solid #2e7d32", padding: 20, maxWidth: 600, margin: "28px auto", color: "#a5d6a7", fontFamily: "Arial, sans-serif" }}>Mensaje enviado. Gracias por confiar.</p> : (
          <form onSubmit={enviar} style={{ maxWidth: 600, margin: "28px auto", textAlign: "left" }}>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe tu mensaje aqui... Si quieres que te contacte, dejalo dentro del mensaje." rows={6} style={{ width: "100%", background: "#111", color: "white", border: `1px solid ${GOLD}`, padding: 16, fontSize: 16, borderRadius: 8, boxSizing: "border-box", fontFamily: "Arial, sans-serif" }} />
            <button type="submit" disabled={enviando} style={{ width: "100%", marginTop: 14, background: GOLD, color: "black", border: "none", padding: "16px", borderRadius: 30, fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "Arial, sans-serif" }}>{enviando ? "ENVIANDO..." : "SOLICITAR DOSSIER PRIVADO →"}</button>
            <p style={{ fontSize: 12, color: "#777", textAlign: "center", fontFamily: "Arial, sans-serif" }}>100% privado. Sin nombre. Sin email. Solo tu mensaje. Trusting People.</p>
          </form>
        )}
      </section>
      <footer style={{ padding: "24px 6%", display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#666", fontFamily: "Arial, sans-serif" }}>
        <span>MICHEL GUERRERO - NEW YORK</span><span>HUDSON YARDS - LA GRAN MANZANA</span>
      </footer>
    </main>
  )
}
