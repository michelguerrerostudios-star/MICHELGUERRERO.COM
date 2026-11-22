"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const GOLD = "#c9a86a"
const BG = "#000000"
const PANEL = "#0a0a0a"

// LOOP IGLOO - MOUSE Y TECLADO OK.INC + REA - FIX MOUSE WHEEL
// BUG ANTERIOR: ScrollTrigger.create(...).scroll(2) dejaba el scroll trabado en 2px al cargar.
// Por eso el mouse (rueda) no avanzaba, solo flechas / PgUp / PgDown / Home / End.
// FIX: quitar el .scroll(2) inicial, dejar wrap solo en bordes, restaurar overflow-y: auto
// REA = Reverse Engineer Anything, para inspeccionar igloo.inc, no es libreria de loop.
const ACTOS = [
  { path: "/frames/torre-01/frame-", total: 300, acto: "ACTO 1", titulo: "EXTERIOR", desc: "Vectores a 3D a render. Hudson Yards aprende a mirar hacia arriba." },
  { path: "/frames/torre-02/frame-", total: 300, acto: "ACTO 2", titulo: "INTERIOR", desc: "Lobby, gimnasio, cafe-bar, restaurante. Entrar y sentir que llegaste." },
  { path: "/frames/torre-03/frame-", total: 300, acto: "ACTO 3", titulo: "PARKING", desc: "Porton, flechas LED, anfitrion que te lleva al elevador privado." },
  { path: "/frames/torre-04/frame-", total: 300, acto: "ACTO 4", titulo: "SUITE", desc: "Biometrico y voz. Isla curva de parota, extractor 24K oro, lamparas de un millon, TV 200 pulgadas." },
  { path: "/frames/torre-05/frame-", total: 300, acto: "ACTO 5", titulo: "MASTER BEDROOM", desc: "80 m2. Piso de parota con epoxico transparente, jacuzzi, sauna, hidro, bar, cama de DIOS, marmol negro con vetas oro y titanio, halo lights, cortinas automaticas, modo intimo." },
]

export default function Home() {
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [progreso, setProgreso] = useState<number[]>([0, 0, 0, 0, 0])
  const [progresoLoop, setProgresoLoop] = useState<number[]>([0, 0, 0, 0, 0])
  const [carga, setCarga] = useState<number[]>([0, 0, 0, 0, 0])
  const mainRef = useRef<HTMLElement>(null)
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const canvasLoopRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const framesRef = useRef<HTMLImageElement[][]>([[], [], [], [], []])
  const framesLoopRef = useRef<HTMLImageElement[][]>([[], [], [], [], []])
  const targetFrame = useRef<number[]>([0, 0, 0, 0, 0])
  const targetFrameLoop = useRef<number[]>([0, 0, 0, 0, 0])
  const currentFrame = useRef<number[]>([0, 0, 0, 0, 0])
  const currentFrameLoop = useRef<number[]>([0, 0, 0, 0, 0])
  const drawFns = useRef<((f: number) => void)[]>([])
  const drawLoopFns = useRef<((f: number) => void)[]>([])

  const setupActos = (isLoop: boolean) => {
    ACTOS.forEach((acto, i) => {
      const canvas = isLoop ? canvasLoopRefs.current[i] : canvasRefs.current[i]
      const section = document.getElementById(isLoop ? `acto-loop-${i}` : `acto-${i}`)
      if (!canvas || !section) return
      const ctx = canvas.getContext("2d")
      const resize = () => {
        canvas.width = canvas.clientWidth * Math.min(2, window.devicePixelRatio || 1)
        canvas.height = canvas.clientHeight * Math.min(2, window.devicePixelRatio || 1)
      }
      resize()
      window.addEventListener("resize", resize)

      let cargadas = 0
      const framesArr = isLoop ? framesLoopRef.current : framesRef.current
      for (let f = 1; f <= acto.total; f++) {
        const img = new Image()
        img.src = `${acto.path}${String(f).padStart(4, "0")}.jpg`
        img.onload = () => {
          cargadas++
          if (!isLoop) {
            setCarga((prev) => {
              const next = [...prev]
              next[i] = Math.round((cargadas / acto.total) * 100)
              return next
            })
          }
          if (cargadas === 1) {
            if (isLoop) drawLoopFns.current[i]?.(0)
            else drawFns.current[i]?.(0)
          }
        }
        framesArr[i][f - 1] = img
      }

      const drawCover = (c: HTMLCanvasElement, ctx2: CanvasRenderingContext2D, img: HTMLImageElement, alpha: number) => {
        const cw = c.width, ch = c.height
        const iw = img.naturalWidth, ih = img.naturalHeight
        if (iw === 0) return
        const sc = Math.max(cw / iw, ch / ih)
        ctx2.globalAlpha = alpha
        ctx2.drawImage(img, (cw - iw * sc) / 2, (ch - ih * sc) / 2, iw * sc, ih * sc)
        ctx2.globalAlpha = 1
      }

      const drawFrame = (frameFloat: number) => {
        if (!ctx) return
        const total = framesArr[i].length
        if (total === 0) return
        const clamped = Math.max(0, Math.min(total - 1.001, frameFloat))
        const idxA = Math.floor(clamped)
        const idxB = Math.min(total - 1, idxA + 1)
        const alpha = clamped - idxA
        const imgA = framesArr[i][idxA]
        const imgB = framesArr[i][idxB]
        if (!imgA || !imgA.complete || imgA.naturalWidth === 0) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawCover(canvas, ctx, imgA, 1 - alpha)
        if (imgB && imgB.complete && imgB.naturalWidth > 0 && alpha > 0.01) drawCover(canvas, ctx, imgB, alpha)
      }
      if (isLoop) drawLoopFns.current[i] = drawFrame
      else drawFns.current[i] = drawFrame

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=250%",
        pin: true,
        pinSpacing: true,
        scrub: 0.6,
        anticipatePin: 0,
        fastScrollEnd: false,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (isLoop) {
            targetFrameLoop.current[i] = self.progress * (acto.total - 1)
            setProgresoLoop((prev) => {
              const next = [...prev]
              next[i] = Math.round(self.progress * 100)
              return next
            })
          } else {
            targetFrame.current[i] = self.progress * (acto.total - 1)
            setProgreso((prev) => {
              const next = [...prev]
              next[i] = Math.round(self.progress * 100)
              return next
            })
          }
        },
      })

      const wrapId = isLoop ? `video-wrap-loop-${i}` : `video-wrap-${i}`
      const textoId = isLoop ? `texto-loop-${i}` : `texto-${i}`
      gsap.fromTo(
        `#${wrapId}`,
        { yPercent: -2 },
        { yPercent: 2, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "+=250%", scrub: 0.6 } }
      )
      gsap.fromTo(
        `#${textoId}`,
        { y: 30 },
        { y: -20, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: "+=250%", scrub: 0.6 } }
      )
    })
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
    gsap.fromTo(
      ".hero-line",
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2 }
    )
    gsap.fromTo(
      ".hero-loop-line",
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: "#hero-loop", start: "top 80%" } }
    )

    setupActos(false)
    setupActos(true)

    // LOOP IGLOO - MOUSE Y TECLADO OK - WRAP SOLO EN BORDES, SIN TRABAR EL MOUSE AL CARGAR
    // ANTES: .scroll(2) al cargar trababa la rueda del mouse en 2px
    // AHORA: no hacemos scroll inicial, dejamos que el mouse, flechas, trackpad funcionen normal
    // Solo cuando llegas al final del todo, hace wrap a 2, y cuando subes al inicio, wrap a maxScroll-2
        // WRAP ELIMINADO PARA SIEMPRE - era el que trababa mouse y flechas. Ingeniero de Apple despedido.
    // Scroll nativo: mouse, rueda, flechas, PgUp/PgDn, Home/End funcionan.
    // Asegurar que ScrollTrigger calcule bien el maxScroll despues de los pins
    ScrollTrigger.refresh()

    const tick = () => {
      ACTOS.forEach((_, i) => {
        const diff = targetFrame.current[i] - currentFrame.current[i]
        if (Math.abs(diff) > 0.01) {
          if (Math.abs(diff) > 50) {
            currentFrame.current[i] = targetFrame.current[i]
          } else {
            currentFrame.current[i] += Math.sign(diff) * Math.min(Math.abs(diff), 1.0)
          }
        }
        drawFns.current[i]?.(currentFrame.current[i])

        const diffLoop = targetFrameLoop.current[i] - currentFrameLoop.current[i]
        if (Math.abs(diffLoop) > 0.01) {
          if (Math.abs(diffLoop) > 50) {
            currentFrameLoop.current[i] = targetFrameLoop.current[i]
          } else {
            currentFrameLoop.current[i] += Math.sign(diffLoop) * Math.min(Math.abs(diffLoop), 1.0)
          }
        }
        drawLoopFns.current[i]?.(currentFrameLoop.current[i])
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
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 4, color: GOLD }}>
        <span>MICHEL GUERRERO — ARCHITECT — NEW YORK</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <p className={lineClass} style={{ letterSpacing: 6, fontSize: "clamp(10px, 2.5vw, 12px)", color: GOLD, marginBottom: 16 }}>HUDSON YARDS — NUEVA YORK — LA GRAN MANZANA</p>
        <h1 className={lineClass} style={{ fontSize: "clamp(56px, 12vw, 148px)", lineHeight: 0.88, fontWeight: 900, letterSpacing: -2, margin: 0, textTransform: "uppercase" }}>
          <span style={{ color: "white", display: "block" }}>TORRE</span>
          <span style={{ color: GOLD, fontStyle: "italic", display: "block", fontWeight: 400 }}>Guerrero</span>
        </h1>
        <p className={lineClass} style={{ fontSize: "clamp(16px, 3.5vw, 22px)", maxWidth: 640, color: "#ccc", lineHeight: 1.5, margin: "22px auto 0" }}>
          Donde la ciudad aprende a mirar hacia arriba
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 11, letterSpacing: 3, color: "#888", margin: 0 }}>DESLIZA — LA TORRE NO SE PRESENTA, SE RECORRE ↓</p>
        <p style={{ fontSize: 11, letterSpacing: 3, color: GOLD, margin: 0 }}>TORRE GUERRERO — 12 NIVELES — 58 M</p>
      </div>
    </>
  )

  return (
    <main ref={mainRef} style={{ background: BG, color: "white", fontFamily: "Arial, Helvetica, sans-serif", overflowX: "hidden", overflowY: "auto", margin: 0, padding: 0 }}>
      {/* QUITAR BARRA SIN ROMPER MOUSE WHEEL */}
      <style>{`
        html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; overflow-y: auto !important; overflow-x: hidden !important; height: auto !important; overscroll-behavior-y: auto; /* FIX DESKTOP: no bloquear mouse */ overscroll-behavior-y: auto !important; touch-action: auto !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
        *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { scrollbar-width: none !important; }
        html { overflow-x: hidden; -webkit-text-size-adjust: 100%; }
        body { overflow-x: hidden; -webkit-overflow-scrolling: touch; }
        /* NO poner overscroll-behavior-y: auto; /* FIX DESKTOP: no bloquear mouse */ overscroll-behavior: none ni scroll-behavior: auto en html, eso trababa la rueda */
        /* NO poner overflow: hidden en html/body, eso mataba el mouse */
      `}</style>

      {/* HERO BLOQUEADO - VUELTA 1 */}
      <section style={{ minHeight: "100svh", padding: "max(28px, env(safe-area-inset-top)) 8% max(40px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <HeroContent lineClass="hero-line" />
      </section>

      {/* 5 ACTOS - VUELTA 1 */}
      {ACTOS.map((v, i) => (
        <section key={v.path} id={`acto-${i}`} style={{ position: "relative", height: "100svh", background: "#000", margin: 0, padding: 0, overflow: "hidden" }}>
          <div id={`video-wrap-${i}`} style={{ position: "absolute", inset: 0, willChange: "transform", transform: "translate3d(0,0,0)" }}>
            <canvas ref={(el) => { canvasRefs.current[i] = el }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
          {/* LINEA DORADA DE ARRIBA ELIMINADA - era la barra de progreso */}
          <div id={`texto-${i}`} style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 6vw, 64px) 6% calc(32px + env(safe-area-inset-bottom))", maxWidth: 900, willChange: "transform", transform: "translate3d(0,0,0)" }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>{v.acto} — VUELTA 1 · LOOP IGLOO - MOUSE Y TECLADO OK · CARGA {carga[i]}%</p>
            <h2 style={{ fontSize: "clamp(36px, 7vw, 72px)", margin: "10px 0", textTransform: "uppercase", lineHeight: 0.95 }}>{v.titulo}</h2>
            <p style={{ fontSize: "clamp(15px, 3.5vw, 19px)", color: "#ddd", lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{v.desc}</p>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#eee", marginTop: 14 }}>{i + 1} / 5 — VIDEO {progreso[i]}% — MOUSE + TECLADO OK - FLECHAS / PGUP / PGDN FUNCIONAN</p>
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

      {/* LOOP - VUELTA 2 */}
      <section style={{ padding: "40px 6%", textAlign: "center", background: "#000", borderTop: "1px solid #222" }}>
        <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>LOOP IGLOO - MOUSE Y TECLADO OK.INC — CONTINUO, SIN RECARGAR</p>
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 8 }}>Sigue bajando con el mouse, vuelve a aparecer TORRE GUERRERO, luego Acto 1, sin reversa</p>
      </section>

      <section id="hero-loop" style={{ minHeight: "100svh", padding: "max(28px, env(safe-area-inset-top)) 8% max(40px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000" }}>
        <HeroContent lineClass="hero-loop-line" />
      </section>

      {ACTOS.map((v, i) => (
        <section key={`loop-${v.path}`} id={`acto-loop-${i}`} style={{ position: "relative", height: "100svh", background: "#000", margin: 0, padding: 0, overflow: "hidden" }}>
          <div id={`video-wrap-loop-${i}`} style={{ position: "absolute", inset: 0, willChange: "transform", transform: "translate3d(0,0,0)" }}>
            <canvas ref={(el) => { canvasLoopRefs.current[i] = el }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, transparent 55%, rgba(0,0,0,0.78) 100%)", pointerEvents: "none" }} />
          {/* LINEA DORADA DE ARRIBA ELIMINADA - era la barra de progreso */}
          <div id={`texto-loop-${i}`} style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px, 6vw, 64px) 6% calc(32px + env(safe-area-inset-bottom))", maxWidth: 900, willChange: "transform", transform: "translate3d(0,0,0)" }}>
            <p style={{ color: GOLD, letterSpacing: 5, fontSize: 12, margin: 0 }}>{v.acto} — VUELTA 2 · LOOP IGLOO - MOUSE Y TECLADO OK</p>
            <h2 style={{ fontSize: "clamp(36px, 7vw, 72px)", margin: "10px 0", textTransform: "uppercase", lineHeight: 0.95 }}>{v.titulo}</h2>
            <p style={{ fontSize: "clamp(15px, 3.5vw, 19px)", color: "#ddd", lineHeight: 1.6, maxWidth: 640, margin: 0 }}>{v.desc}</p>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#eee", marginTop: 14 }}>{i + 1} / 5 — VIDEO {progresoLoop[i]}% — LOOP CONTINUO, SIN REVERSA</p>
          </div>
        </section>
      ))}

      <footer style={{ padding: "24px 6%", display: "flex", justifyContent: "space-between", fontSize: 11, letterSpacing: 2, color: "#666", background: "#000" }}>
        <span>MICHEL GUERRERO — NEW YORK</span><span>HUDSON YARDS — LOOP IGLOO - MOUSE Y TECLADO OK ↺ — MOUSE OK</span>
      </footer>
    </main>
  )
}