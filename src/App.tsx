import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function Casa3D() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      // Cuando haces scroll, la caja sube y baja
      ref.current.position.y = Math.sin(window.scrollY * 0.002) * 0.5
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  )
}

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0 }}>
      
      {/* SECCION 1 - 3D FIJO ARRIBA */}
      <div style={{ height: '100vh', position: 'sticky', top: 0, background: '#f5f2ed' }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Casa3D />
        </Canvas>
        <div style={{ position: 'absolute', top: '40px', left: '0', right: '0', textAlign: 'center', pointerEvents: 'none' }}>
          <h1 style={{ fontSize: '42px', margin: 0 }}>MICHEL GUERRERO</h1>
          <p>ARCHITECT • NEW YORK</p>
          <p>Haz scroll para abajo 👇</p>
        </div>
      </div>

      {/* SECCION 2 - STORYTELLING */}
      <div style={{ background: 'white', padding: '100px 40px', position: 'relative', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px' }}>1. El Concepto</h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Todo empieza con una idea. Escuchamos lo que sueñas y lo convertimos en un espacio.
        </p>
      </div>

      <div style={{ background: '#1a1a1a', color: 'white', padding: '100px 40px', position: 'relative', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px' }}>2. El Diseño 3D</h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Modelamos tu casa en 3D para que la veas antes de construirla. Así como el cubo de arriba que gira.
        </p>
      </div>

      <div style={{ background: '#f5f2ed', padding: '100px 40px', position: 'relative', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px' }}>3. La Construcción</h2>
        <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Permisos, DOB, y manejo de obra hasta que te entregamos las llaves.
        </p>
        <br />
        <button style={{ background: '#1a1a1a', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '30px', fontSize: '16px' }}>
          Quiero mi proyecto
        </button>
      </div>

    </div>
  )
}

export default App