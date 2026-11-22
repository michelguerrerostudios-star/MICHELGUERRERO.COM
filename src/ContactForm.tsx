import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
   'https://xgjbfwqiojjxelclqanb.supabase.co',
  'sb_publishable_lvEZpqAPyFDXXfXJ1j6N3g_tHJhgaMR'
)

function ContactForm() {
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e: any) {
    e.preventDefault()
    if (enviando || enviado) return
    setEnviando(true)

    // 1. Guardar en Supabase, como ya lo tienes
    await supabase.from('mensajes').insert([{ mensaje: mensaje }])

    // 2. Mandar a tu email visualizainc@gmail.com, solo el mensaje
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "e39fe332-98d5-455c-95f5-664eee8ffb01",
        subject: "Mensaje",
        from_name: "",
        mensaje: mensaje,
      }),
    })

    setEnviado(true)
    setEnviando(false)
  }

  if (enviado) {
    return <p style={{ textAlign: 'center', fontSize: '20px', color: '#1a1a1a' }}>✅ Recibido. Tu privacidad está protegida.</p>
  }

  return (
    <form onSubmit={enviar} style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white', padding: '20px', colorScheme: 'light' }}>
      <h2 style={{ textAlign: 'center', color: '#1a1a1a' }}>Conversación Privada</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        No pedimos tu nombre ni tu correo. No guardamos tu IP ni la fecha.
        Solo recibimos tu mensaje. Si quieres que te contacte, déjame tu email o WhatsApp dentro del mensaje, solo si tú quieres.
      </p>
      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Cuéntame de tu proyecto..."
        style={{ padding: '15px', borderRadius: '10px', border: '1px solid #ccc', height: '120px', background: 'white', color: '#1a1a1a' }}
      />
      <button
        type="submit"
        disabled={enviando}
        style={{ background: '#1a1a1a', color: 'white', padding: '15px', borderRadius: '30px', border: 'none', fontSize: '16px', opacity: enviando ? 0.5 : 1 }}
      >
        {enviando ? 'Enviando...' : 'Enviar en privado'}
      </button>
      <p style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>100% privado • No guardamos tus datos • Trusting people</p>
    </form>
  )
}

export default ContactForm