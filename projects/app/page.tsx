"use client"
import { useEffect, useRef, useState } from "react"

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
  const [isIOS, setIsIOS] = useState(false)
  const [needsTap, setNeedsTap] = useState<boolean[]>([false, false, false, false, false])
  const [hasError, setHasError] = useState<boolean[]>([false, false, false, false, false])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    setIsIOS(ios)
    // iOS: forzar muted por codigo, si no Safari bloquea autoplay
    videoRefs.current.forEach((v) => {
      if (!v) return
      v.muted = true
      // @ts-ignore
      v.playsInline = true
      v.setAttribute("playsinline", "")
      v.setAttribute("webkit-playsinline", "")
    })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          const idx = Number(video.dataset.idx)
          if (entry.isIntersecting) {
            const p = video.play()
            if (p !== undefined) {
              p.catch(() => {
                setNeedsTap((prev) => { const n = [...prev]; n[idx] = true; return n })
              })
            }
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.25, rootMargin: "0px 0px -5% 0px" }
    )
    videoRefs.current.forEach((v) => v && observer.observe(v))
    return () => observer.disconnect()
  }, [])

  const tapToPlay = (i: number) => {
    const v = videoRefs.current[i]
    if (!v) return
    v.muted = true
    v.play().then(() => {
      setNeedsTap((prev) => { const n = [...prev]; n[i] = false; return n })
    }).catch(() => {})
    // En iPhone, al primer tap, desbloquea los demas tambien
    videoRefs.current.forEach((vv) => { if (vv) { vv.muted = true; } })
  }

  const onError = (i: number) => {
    setHasError((prev) => { const n = [...prev]; n[i] = true; return n })
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!mensaje.trim()) return
    setEnviando(true)
    try {
      const res = await fetch("/api/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: mensaje.trim() }),
      })
      if (res.ok) { setEnviado(true); setMensaje("") }
    } catch {}
    setEnviando(false)
  }

  return (
    <main style={{ background: "#000", color: "white", fontFamily: "Arial, Helvetica, sans-serif", overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      {/* HERO BLOQUEADO - TORRE GUERRERO - RESPONSIVE */}
      <section style={{ minHeight: "100svh", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "calc(env(safe-area-inset-top) + 24px) 6% calc(env(safe-area-inset-bottom) + 32px)", boxSizing: "border-box" }}>
        <p style={{ fontSize: "clamp(9px, 2.5vw, 11px)", letterSpacing: "clamp(3px, 1.2vw, 6px)", color: "#999", margin: "0 0 18px", lineHeight: 1.6 }}>HUDSON YARDS - NUEVA YORK - LA GRAN MANZANA</p>
        <h1 style={{ margin: 0, lineHeight: 0.95, textAlign: "center" }}>
          <span style={{ display: "block", fontSize: "clamp(52px, 14vw, 120px)", fontWeight: 400, letterSpacing: 2, color: "white" }}>TORRE</span>
          <span style={{ display: "block", fontSize: "clamp(52px, 14vw, 120px)", fontWeight: 600, letterSpacing: 1, color: GOLD, fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>GUERRERO</span>
        </h1>
        <p style={{ fontSize: "clamp(14px, 4vw, 16px)", fontStyle: "italic", color: "#ddd", margin: "22px 0 8px", padding: "0 4%" }}>Donde la ciudad aprende a mirar hacia arriba.</p>
        <p style={{ fontSize: "clamp(11px, 3.2vw, 12px)", color: "#777", maxWidth: 520, lineHeight: 1.6, margin: "0 auto", padding: "0 4%" }}>Una torre pórtico sobre Hudson. Arquitectura de precisión, luz de atardecer y silencio de altura.</p>
        <p style={{ fontSize: "clamp(9px, 2.8vw, 10px)", letterSpacing: "clamp(2px, 0.8vw, 4px)", color: "#888", marginTop: 36, padding: "0 4%" }}>DESLIZA - LA TORRE NO SE PRESENTA, SE RECORRE</p>
        {isIOS && <p style={{ fontSize: 11, color: GOLD, marginTop: 14 }}>Toca el video para ver la película en iPhone ↓</p>}
      </section>

      {/* 5 VIDEOS - RESPONSIVE MULTIMODAL - iPHONE READY */}
      {videos.map((v, i) => (
        <section key={i} style={{ position: "relative", minHeight: "100svh", minHeight: "100dvh", display: "flex", alignItems: "end", overflow: "hidden", background: "#0a0a0a" }}>
          {/* Fallback multimodal: si el video falla en iPhone, no queda negro. Queda este fondo cinematico. */}
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #111 0%, #000 50%, #1a1408 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: GOLD, letterSpacing: 6, fontSize: 11, opacity: 0.6 }}>{v.kicker}</p>
          </div>
          {!hasError[i] && (
            <video
              ref={(el) => { videoRefs.current[i] = el }}
              data-idx={i}
              src={v.src}
              muted
              loop
              playsInline
              // @ts-ignore - iOS Safari
              webkit-playsinline=""
              preload={i === 0 ? "auto" : "metadata"}
              disablePictureInPicture
              onError={() => onError(i)}
              onClick={() => tapToPlay(i)}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "translateZ(0)", willChange: "transform", backfaceVisibility: "hidden", background: "#000" }}
            />
          )}
          {/* Boton TAP en iPhone cuando Safari bloquea autoplay */}
          {needsTap[i] && !hasError[i] && (
            <button onClick={() => tapToPlay(i)} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(0,0,0,0.65)", color: "white", border: `1px solid ${GOLD}`, padding: "14px 22px", borderRadius: 999, fontSize: 14, fontWeight: 700, letterSpacing: 1, cursor: "pointer", zIndex: 5, backdropFilter: "blur(6px)" }}>▶ TOCA PARA VER LA PELÍCULA</button>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.88) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: "calc(env(safe-area-inset-bottom) + 36px) 6% 48px", paddingLeft: "6%", paddingRight: "6%", maxWidth: 900, width: "100%", boxSizing: "border-box" }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: "clamp(10px, 3vw, 12px)", margin: 0 }}>{v.kicker}</p>
            <h2 style={{ fontSize: "clamp(30px, 9vw, 72px)", lineHeight: 0.95, textTransform: "uppercase", margin: "12px 0" }}>{v.title}</h2>
            <p style={{ color: "#ddd", fontSize: "clamp(14px, 4.2vw, 18px)", lineHeight: 1.5, maxWidth: 640 }}>{v.desc}</p>
            <p style={{ color: GOLD, fontSize: 11, letterSpacing: 3 }}>VIDEO {i+1} / 5 — COMPLETO — SIN CORTES</p>
          </div>
        </section>
      ))}

      {/* CONTACTO PRIVADO - RESPONSIVE */}
      <section style={{ padding: "64px 6% calc(env(safe-area-inset-bottom) + 64px)", background: "#0a0a0a", textAlign: "center", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: "clamp(30px, 8vw, 56px)", textTransform: "uppercase", lineHeight: 1.05 }}>Hablemos en <span style={{ color: GOLD }}>privado.</span></h2>
        <p style={{ color: "#aaa", fontSize: "clamp(13px, 4vw, 16px)", padding: "0 4%" }}>No pedimos tu nombre ni tu correo. Solo tu mensaje. Trusting People.</p>
        {enviado ? (
          <p style={{ background: "#12261a", border: "1px solid #2e7d32", padding: 20, maxWidth: 600, margin: "24px auto", color: "#a5d6a7" }}>Mensaje enviado. Gracias por confiar.</p>
        ) : (
          <form onSubmit={enviar} style={{ maxWidth: 600, margin: "24px auto", textAlign: "left", width: "100%", boxSizing: "border-box" }}>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe tu mensaje aqui... Si quieres que te contacte, dejalo dentro del mensaje." rows={6} style={{ width: "100%", background: "#111", color: "white", border: `1px solid ${GOLD}`, padding: 16, fontSize: 16, borderRadius: 8, boxSizing: "border-box", WebkitAppearance: "none" }} />
            <button type="submit" disabled={enviando} style={{ width: "100%", marginTop: 14, background: GOLD, color: "black", border: "none", padding: "16px", borderRadius: 30, fontWeight: 900, fontSize: 16, cursor: "pointer", WebkitAppearance: "none" }}>{enviando ? "ENVIANDO..." : "ESCRIBEME EN PRIVADO →"}</button>
            <p style={{ fontSize: 12, color: "#777", textAlign: "center" }}>100% privado. Sin formularios. Sin seguimiento.</p>
          </form>
        )}
      </section>
      <footer style={{ padding: "24px 6% calc(env(safe-area-inset-bottom) + 24px)", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#666", boxSizing: "border-box" }}>
        <span>MICHEL GUERRERO — NEW YORK</span><span>HUDSON YARDS — TRUSTING PEOPLE</span>
      </footer>
    </main>
  )
}
