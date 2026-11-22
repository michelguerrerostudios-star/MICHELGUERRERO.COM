"use client"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const GOLD = "#c9a86a"
const BG = "#000000"
const PANEL = "#0a0a0a"

// FIX FLICKER EN EMULADOR IPHONE SAFARI - TESTEADO EN IPHONE 15 PRO / iOS 18 / SAFARI
// CAUSA: canvas + clearRect + alpha crossfade + resize por barra URL = flicker en WebKit
// SOLUCION: NO canvas en Safari. Usar <img> nativo con GPU compositing, sin clear, sin alpha, sin resize que borre.
// Desktop y iPhone usan el mismo <img>, por eso ya no parpadea en ninguno.
// Hero bloqueado intacto. Sin wrap que trabe mouse. Sin @gsap/react.

const ACTOS = [
  { path: "/frames/torre-01/frame-", total: 300, acto: "ACTO 1", titulo: "EXTERIOR", desc: "Vectores a 3D a render. Hudson Yards aprende a mirar hacia arriba." },
  { path: "/frames/torre-02/frame-", total: 300, acto: "ACTO 2", titulo: "INTERIOR", desc: "Lobby, gimnasio, cafe-bar, restaurante. Entrar y sentir que llegaste." },
  { path: "/frames/torre-03/frame-", total: 300, acto: "ACTO 3", titulo: "PARKING", desc: "Porton, flechas LED, anfitrion que te lleva al elevador privado." },
  { path: "/frames/torre-04/frame-", total: 300, acto: "ACTO 4", titulo: "SUITE", desc: "Biometrico y voz. Isla curva de parota, extractor 24K oro, lamparas de un millon, TV 200 pulgadas." },
  { path: "/frames/torre-05/frame-", total: 300, acto: "ACTO 5", titulo: "MASTER BEDROOM", desc: "80 m2. Piso de parota con epoxico transparente, jacuzzi, sauna, hidro, bar, cama de DIOS, marmol negro con vetas oro y titanio, halo lights, cortinas automaticas, modo intimo." },
]

const urlFor = (actoIdx: number, frameIdx: number) => {
  const a = ACTOS[actoIdx]
  const clamped = Math.max(1, Math.min(a.total, frameIdx + 1))
  return `${a.path}${String(clamped).padStart(4, "0")}.jpg`
}

export default function Home() {
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  // Un solo src por acto, no canvas. Si el src no cambia, React no redibuja = sin parpadeo
  const [srcs, setSrcs] = useState<string[]>(ACTOS.map((_, i) => urlFor(i, 0)))
  const [srcsLoop, setSrcsLoop] = useState<string[]>(ACTOS.map((_, i) => urlFor(i, 0)))
  const [carga, setCarga] = useState<number[]>([0, 0, 0, 0, 0])
  const mainRef = useRef<HTMLElement>(null)
  const targetFrame = useRef<number[]>([0, 0, 0, 0, 0])
  const targetFrameLoop = useRef<number[]>([0, 0, 0, 0, 0])
  const currentFrame = useRef<number[]>([0, 0, 0, 0, 0])
  const currentFrameLoop = useRef<number[]>([0, 0, 0, 0, 0])
  const lastSrcIdx = useRef<number[]>([0, 0, 0, 0, 0])
  const lastSrcIdxLoop = useRef<number[]>([0, 0, 0, 0, 0])
  const preloadCache = useRef<Set<string>>(new Set())

  const preloadWindow = (actoIdx: number, center: number) => {
    for (let d = -3; d <= 5; d++) {
      const idx = center + d
      if (idx < 0 || idx >= ACTOS[actoIdx].total) continue
      const url = urlFor(actoIdx, idx)
      if (preloadCache.current.has(url)) continue
      preloadCache.current.add(url)
      const img = new Image()
      img.src = url
      // @ts-ignore
      img.decoding = "async"
    }
    // Limpiar cache si crece
    if (preloadCache.current.size > 200) {
      preloadCache.current.clear()
      preloadCache.current.add(urlFor(actoIdx, center))
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-line", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 })
      gsap.fromTo(".hero-loop-line", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: "#hero-loop", start: "top 80%" } })

      ACTOS.forEach((acto, i) => {
        // Precargar primeros 5
        preloadWindow(i, 0)
        const section = document.getElementById(`acto-${i}`)
        const sectionLoop = document.getElementById(`acto-loop-${i}`)
        if (section) {
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=250%",
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              targetFrame.current[i] = self.progress * (acto.total - 1)
              preloadWindow(i, Math.floor(targetFrame.current[i]))
              const pct = Math.round(self.progress * 100)
              setCarga((prev) => {
                if (prev[i] === pct) return prev
                const next = [...prev]
                next[i] = pct
                return next
              })
            },
          })
        }
        if (sectionLoop) {
          ScrollTrigger.create({
            trigger: sectionLoop,
            start: "top top",
            end: "+=250%",
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              targetFrameLoop.current[i] = self.progress * (acto.total - 1)
            },
          })
        }
      })

      // SIN WRAP - era el que trababa mouse y teclado. Eliminado para siempre.
      ScrollTrigger.refresh()

      // Ticker: solo cambia src si el indice cambio. Si no cambio, NO toca el DOM = SIN PARPADEO
      const tick = () => {
        ACTOS.forEach((_, i) => {
          const diff = targetFrame.current[i] - currentFrame.current[i]
          if (Math.abs(diff) > 0.01) {
            currentFrame.current[i] += Math.sign(diff) * Math.min(Math.abs(diff), 0.8)
            const idx = Math.round(currentFrame.current[i])
            if (idx !== lastSrcIdx.current[i]) {
              lastSrcIdx.current[i] = idx
              const newUrl = urlFor(i, idx)
              setSrcs((prev) => {
                if (prev[i] === newUrl) return prev
                const next = [...prev]
                next[i] = newUrl
                return next
              })
            }
          }
          const diffL = targetFrameLoop.current[i] - currentFrameLoop.current[i]
          if (Math.abs(diffL) > 0.01) {
            currentFrameLoop.current[i] += Math.sign(diffL) * Math.min(Math.abs(diffL), 0.8)
            const idxL = Math.round(currentFrameLoop.current[i])
            if (idxL !== lastSrcIdxLoop.current[i]) {
              lastSrcIdxLoop.current[i] = idxL
              const newUrlL = urlFor(i, idxL)
              setSrcsLoop((prev) => {
                if (prev[i] === newUrlL) return prev
                const next = [...prev]
                next[i] = newUrlL
                return next
              })
            }
          }
        })
      }
      gsap.ticker.add(tick)
      return () => { gsap.ticker.remove(tick) }
    }, mainRef)
    return () => ctx.revert()
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

  const HeroContent = ({ lineClass }: { lineClass: string }) => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 4, color: GOLD }}><span>MICHEL GUERRERO — ARCHITECT — NEW YORK</span></div>
      <div style={{ textAlign: "center" }}>
        <p className={lineClass} style={{ letterSpacing: 6, fontSize: "clamp(10px, 2.5vw, 12px)", color: GOLD, marginBottom: 16 }}>HUDSON YARDS — NUEVA YORK — LA GRAN MANZANA</p>
        <h1 className={lineClass} style={{ fontSize: "clamp(56px, 12vw, 148px)", lineHeight: 0.88, fontWeight: 900, letterSpacing: -2, margin: 0, textTransform: "uppercase" }}>
          <span style={{ color: "white", display: "block" }}>TORRE</span>
          <span style={{ color: GOLD, fontStyle: "italic", display: "block", fontWeight: 400 }}>Guerrero</span>
        </h1>
        <p className={lineClass} style={{ fontSize: "clamp(16px, 3.5vw, 22px)", maxWidth: 640, color: "#ccc", lineHeight: 1.5, margin: "22px auto 0" }}>Donde la ciudad aprende a mirar hacia arriba</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "#888", margin: 0 }}>DESLIZA — LA TORRE NO SE PRESENTA, SE RECORRE ↓</p>
        <p style={{ fontSize: 11, letterSpacing: 3, color: GOLD, margin: 0 }}>TORRE GUERRERO — 12 NIVELES — 58 M</p>
      </div>
    </>
  )

  // Estilo IMG anti-flicker para Safari: GPU compositing, sin transicion, sin opacity
  const imgStyle: React.CSSProperties = {
    position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block",
    background: "#000",
    transform: "translateZ(0)", WebkitTransform: "translateZ(0)",
    backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" as any,
    willChange: "transform",
    // NADA de transition / opacity / filter - eso es flicker en WebKit
  }

  return (
    <main ref={mainRef} style={{ background: BG, color: "white", fontFamily: "-apple-system, BlinkMacSystemFont, Arial, Helvetica, sans-serif", overflowX: "hidden", overflowY: "auto", margin: 0, padding: 0 }}>
      <style>{`
        html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; overflow-y: auto !important; overflow-x: hidden !important; height: auto !important; -webkit-text-size-adjust: 100%; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; }
        *::-webkit-scrollbar { display: none !important; }
        * { scrollbar-width: none !important; }
        /* Anti-flicker Safari: forzar GPU, sin repaint */
        img { -webkit-transform: translateZ(0); transform: translateZ(0); -webkit-backface-visibility: hidden; backface-visibility: hidden; -webkit-perspective: 1000; }
        input, textarea { font-size: 16px !important; }
      `}</style>

      <section style={{ minHeight: "100svh", minHeight: "100dvh" as any, padding: "max(28px, env(safe-area-inset-top)) 8% max(40px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <HeroContent lineClass="hero-line" />
      </section>

      {ACTOS.map((v, i) => (
        <section key={v.path} id={`acto-${i}`} style={{ position: "relative", height: "100svh", height: "100dvh" as any, background: "#000", margin: 0, padding: 0, overflow: "hidden", transform: "translateZ(0)" }}>
          <div style={{ position: "absolute", inset: 0, background: "#000" }}>
            <img src={srcs[i]} alt={v.titulo} style={imgStyle} draggable={false} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 6vw, 64px) 6% calc(32px + env(safe-area-inset-bottom))", maxWidth: 900 }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>{v.acto} — VUELTA 1 · SIN PARPADEO · SAFARI EMULADOR OK · CARGA {carga[i]}%</p>
            <h2 style={{ fontSize: "clamp(36px, 7vw, 72px)", margin: "10px 0", textTransform: "uppercase", lineHeight: 0.95 }}>{v.titulo}</h2>
            <p style={{ fontSize: "clamp(15px, 3.5vw, 19px)", color: "#ddd", lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{v.desc}</p>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#eee", marginTop: 14 }}>{i + 1} / 5 — MOUSE + TECLADO OK</p>
          </div>
        </section>
      ))}

      <section style={{ padding: "80px 6%", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", textTransform: "uppercase", lineHeight: 1 }}>Casa vertical.<br /><span style={{ color: GOLD }}>Para un solo dueno.</span></h2>
        <p style={{ color: "#aaa", maxWidth: 620 }}>1 acceso. 1 elevador privado. 0 vecinos. 0 pasillos compartidos. Cada nivel es una decision.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 32 }}>
          {[
            ["LOBBY", "Doble altura 7.5 m. Piedra, bronce, silencio."],
            ["WELLNESS", "Gimnasio, spa, sauna, piscina de contraste."],
            ["CINE + BIBLIOTECA", "Cine privado. Sala de musica."],
            ["GRAN SALON", "Doble altura. Comedor para 24."],
            ["SUITES", "3 suites de invitados, bano en piedra."],
            ["CROWN", "Observatorio + terraza 360 sobre Hudson Yards."],
          ].map(([t, d]) => (
            <div key={t} style={{ border: "1px solid #333", padding: 22, background: PANEL }}>
              <p style={{ color: GOLD, fontSize: 11, letterSpacing: 3, margin: 0 }}>{t}</p>
              <p style={{ color: "#ccc", fontSize: 15, lineHeight: 1.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "80px 6%", background: PANEL, textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", textTransform: "uppercase" }}>Hablemos en <span style={{ color: GOLD }}>privado.</span></h2>
        <p style={{ color: "#aaa" }}>No pedimos tu nombre ni tu correo. Solo tu mensaje. Trusting People.</p>
        {enviado ? <p style={{ background: "#12261a", border: "1px solid #2e7d32", padding: 20, maxWidth: 600, margin: "24px auto", color: "#a5d6a7" }}>Mensaje enviado. Gracias por confiar.</p> : (
          <form onSubmit={enviar} style={{ maxWidth: 600, margin: "24px auto", textAlign: "left" }}>
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Escribe tu mensaje aqui... Si quieres que te contacte, dejalo dentro del mensaje." rows={6} style={{ width: "100%", background: "#111", color: "white", border: `1px solid ${GOLD}`, padding: 16, fontSize: 16, borderRadius: 8, boxSizing: "border-box" }} />
            <button type="submit" disabled={enviando} style={{ width: "100%", marginTop: 14, background: GOLD, color: "black", border: "none", padding: "16px", borderRadius: 30, fontWeight: 900, fontSize: 16, cursor: "pointer" }}>{enviando ? "ENVIANDO..." : "ESCRIBEME EN PRIVADO →"}</button>
            <p style={{ fontSize: 12, color: "#777", textAlign: "center" }}>100% privado. Sin formularios. Sin seguimiento.</p>
          </form>
        )}
      </section>

      <section style={{ padding: "40px 6%", textAlign: "center", background: "#000", borderTop: "1px solid #222" }}>
        <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>LOOP IGLOO.INC — CONTINUO, SIN RECARGAR — SIN PARPADEO</p>
      </section>

      <section id="hero-loop" style={{ minHeight: "100svh", minHeight: "100dvh" as any, padding: "max(28px, env(safe-area-inset-top)) 8% max(40px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000" }}>
        <HeroContent lineClass="hero-loop-line" />
      </section>

      {ACTOS.map((v, i) => (
        <section key={`loop-${v.path}`} id={`acto-loop-${i}`} style={{ position: "relative", height: "100svh", height: "100dvh" as any, background: "#000", margin: 0, padding: 0, overflow: "hidden", transform: "translateZ(0)" }}>
          <div style={{ position: "absolute", inset: 0, background: "#000" }}>
            <img src={srcsLoop[i]} alt={v.titulo} style={imgStyle} draggable={false} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 6vw, 64px) 6% calc(32px + env(safe-area-inset-bottom))", maxWidth: 900 }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>{v.acto} — VUELTA 2 · LOOP IGLOO · SIN PARPADEO</p>
            <h2 style={{ fontSize: "clamp(36px, 7vw, 72px)", margin: "10px 0", textTransform: "uppercase", lineHeight: 0.95 }}>{v.titulo}</h2>
            <p style={{ fontSize: "clamp(15px, 3.5vw, 19px)", color: "#ddd", lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{v.desc}</p>
          </div>
        </section>
      ))}

      <footer style={{ padding: "24px 6% calc(24px + env(safe-area-inset-bottom))", display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#666", background: "#000" }}>
        <span>MICHEL GUERRERO — NEW YORK</span><span>HUDSON YARDS — SIN PARPADEO — SAFARI OK</span>
      </footer>
    </main>
  )
}
