import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { CanvasTexture } from "three"

export default function SpaceStation(){
  const station = useRef()
  const solarLeft = useRef()
  const solarRight = useRef()
  const canadarm = useRef()
  const solarJoints = useRef([])

  // Create solar panel texture
  const solarTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    
    // Background - dark blue
    ctx.fillStyle = "#0a1a3a"
    ctx.fillRect(0, 0, 512, 512)
    
    // Draw solar cells (grid pattern)
    ctx.fillStyle = "#2a4a8a"
    const cellSize = 64
    
    // Draw cells with alternating pattern
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Create pattern like real solar cells
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * cellSize + 2, j * cellSize + 2, cellSize - 4, cellSize - 4)
        } else {
          ctx.fillStyle = "#1a3a6a"
          ctx.fillRect(i * cellSize + 2, j * cellSize + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = "#2a4a8a"
        }
      }
    }
    
    // Add grid lines (darker)
    ctx.strokeStyle = "#0a1a2a"
    ctx.lineWidth = 4
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, 512)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(512, i * cellSize)
      ctx.stroke()
    }
    
    // Add thin blue highlights on grid lines
    ctx.strokeStyle = "#3a6a9a"
    ctx.lineWidth = 1
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize + 1, 0)
      ctx.lineTo(i * cellSize + 1, 512)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize + 1)
      ctx.lineTo(512, i * cellSize + 1)
      ctx.stroke()
    }
    
    return new CanvasTexture(canvas)
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Solar wing rotation (existing)
    if(solarLeft.current) {
      solarLeft.current.rotation.y = Math.sin(t) * 0.2
    }
    if(solarRight.current) {
      solarRight.current.rotation.y = Math.sin(t) * 0.2
    }

    // NEW: Solar array joints rotation (more realistic - independent rotation)
    solarJoints.current.forEach((joint, index) => {
      if(joint) {
        // Rotate at slightly different speeds for realism
        joint.rotation.x = Math.sin(t * 0.5 + index) * 0.1
      }
    })

    // NEW: Canadarm animation (slow, graceful movement)
    if(canadarm.current) {
      canadarm.current.rotation.z = Math.sin(t * 0.3) * 0.2
      canadarm.current.rotation.y = Math.sin(t * 0.2) * 0.1
    }
  })

  return (
    <group ref={station} scale={2.5}>
      {/* MAIN MODULE */}
      <mesh>
        <cylinderGeometry args={[1.4, 1.4, 9, 64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.25} color="#d1d5d8"/>
      </mesh>

      {/* NODE MODULE */}
      <mesh position={[0, 0, 6]}>
        <sphereGeometry args={[1.6, 32, 32]}/>
        <meshStandardMaterial color="#d9d9d9"/>
      </mesh>

      {/* NEW: ZVEZDA SERVICE MODULE (Russian segment) */}
      <group position={[0, 0, -4]}>
        {/* Main body - conical shape */}
        <mesh>
          <cylinderGeometry args={[1.6, 1.2, 5, 16]}/>
          <meshStandardMaterial metalness={0.8} roughness={0.3} color="#c0c0c0"/>
        </mesh>
        
        {/* Docking sphere */}
        <mesh position={[0, 0, 2.8]}>
          <sphereGeometry args={[1.2, 24, 24]}/>
          <meshStandardMaterial color="#b0b0b0"/>
        </mesh>
        
        {/* Solar panels on Zvezda */}
        <group position={[1.8, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI/2]}>
            <boxGeometry args={[0.2, 3, 2]}/>
            <meshStandardMaterial map={solarTexture} metalness={0.4} roughness={0.6}/>
          </mesh>
        </group>
        
        <group position={[-1.8, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI/2]}>
            <boxGeometry args={[0.2, 3, 2]}/>
            <meshStandardMaterial map={solarTexture} metalness={0.4} roughness={0.6}/>
          </mesh>
        </group>
        
        {/* Kurs antenna */}
        <mesh position={[0, 0.8, -2]}>
          <sphereGeometry args={[0.4, 16, 16]}/>
          <meshStandardMaterial color="#dddddd"/>
        </mesh>
      </group>

      {/* SIDE MODULES */}
      <mesh position={[-6, 0, 0]}>
        <cylinderGeometry args={[1, 1, 6, 64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.3} color="#d9d9d9"/>
      </mesh>

      <mesh position={[6, 0, 0]}>
        <cylinderGeometry args={[1, 1, 6, 64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.3} color="#d9d9d9"/>
      </mesh>

      {/* ISS TRUSS LATTICE */}
      {[...Array(16)].map((_, i) => (
        <group key={`truss-${i}`} position={[-16 + i * 2, 0, 0]}>
          {/* top beam */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2, 0.1, 0.1]}/>
            <meshStandardMaterial color="#777"/>
          </mesh>
          {/* bottom beam */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[2, 0.1, 0.1]}/>
            <meshStandardMaterial color="#777"/>
          </mesh>
          {/* diagonal support */}
          <mesh rotation={[0, 0, Math.PI/4]}>
            <boxGeometry args={[0.1, 1.2, 0.1]}/>
            <meshStandardMaterial color="#777"/>
          </mesh>
          <mesh rotation={[0, 0, -Math.PI/4]}>
            <boxGeometry args={[0.1, 1.2, 0.1]}/>
            <meshStandardMaterial color="#777"/>
          </mesh>
        </group>
      ))}

      {/* TRUSS SUPPORTS */}
      {[...Array(14)].map((_, i) => (
        <mesh key={i} position={[-15 + i * 2.3, 0, 0]} rotation={[0, 0, Math.PI/4]}>
          <boxGeometry args={[0.15, 2.2, 0.15]}/>
          <meshStandardMaterial color="#777"/>
        </mesh>
      ))}

      {/* NEW: ROTATING SOLAR ARRAY JOINTS */}
      <group position={[-20, 0, 0]}>
        {[0, 1, 2].map((_, i) => (
          <group 
            key={`joint-left-${i}`} 
            ref={el => solarJoints.current[i] = el}
            position={[i * 3, 0, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]}/>
              <meshStandardMaterial color="#aaa" metalness={0.9}/>
            </mesh>
          </group>
        ))}
      </group>

      <group position={[20, 0, 0]}>
        {[3, 4, 5].map((_, i) => (
          <group 
            key={`joint-right-${i}`} 
            ref={el => solarJoints.current[i + 3] = el}
            position={[i * 3, 0, 0]}
          >
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]}/>
              <meshStandardMaterial color="#aaa" metalness={0.9}/>
            </mesh>
          </group>
        ))}
      </group>

      {/* RADIATOR PANELS */}
      {[...Array(3)].map((_, i) => (
        <group key={`rad-top-${i}`} position={[-6 + i * 6, 2.2, 0]}>
          {/* radiator mast */}
          <mesh>
            <boxGeometry args={[0.1, 1.8, 0.1]}/>
            <meshStandardMaterial color="#aaa"/>
          </mesh>
          {/* radiator panel */}
          <mesh position={[0, 1.4, 0]}>
            <boxGeometry args={[4, 0.05, 2]}/>
            <meshStandardMaterial color="#e6e6e6" metalness={0.2} roughness={0.8}/>
          </mesh>
        </group>
      ))}

      {[...Array(3)].map((_, i) => (
        <group key={`rad-bottom-${i}`} position={[-6 + i * 6, -2.2, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 1.8, 0.1]}/>
            <meshStandardMaterial color="#aaa"/>
          </mesh>
          <mesh position={[0, -1.4, 0]}>
            <boxGeometry args={[4, 0.05, 2]}/>
            <meshStandardMaterial color="#e6e6e6" metalness={0.2} roughness={0.8}/>
          </mesh>
        </group>
      ))}

      {/* NEW: CANADARM ROBOTIC ARM */}
      <group ref={canadarm} position={[4, 1, 2]}>
        {/* Base */}
        <mesh>
          <cylinderGeometry args={[0.5, 0.5, 0.3, 16]}/>
          <meshStandardMaterial color="#ddd" metalness={0.8}/>
        </mesh>
        
        {/* First segment */}
        <group position={[0, 0.5, 0]} rotation={[0, 0, 0.3]}>
          <mesh>
            <boxGeometry args={[0.4, 2, 0.4]}/>
            <meshStandardMaterial color="#ccc" metalness={0.7}/>
          </mesh>
          
          {/* Elbow joint */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.3, 12, 12]}/>
            <meshStandardMaterial color="#aaa" metalness={0.9}/>
          </mesh>
          
          {/* Second segment */}
          <group position={[0, 1.5, 0]} rotation={[0, 0, -0.5]}>
            <mesh>
              <boxGeometry args={[0.35, 1.8, 0.35]}/>
              <meshStandardMaterial color="#bbb" metalness={0.7}/>
            </mesh>
            
            {/* Wrist joint */}
            <mesh position={[0, 1.1, 0]}>
              <sphereGeometry args={[0.25, 10, 10]}/>
              <meshStandardMaterial color="#aaa" metalness={0.9}/>
            </mesh>
            
            {/* End effector */}
            <group position={[0, 1.4, 0]}>
              <mesh>
                <boxGeometry args={[0.3, 0.5, 0.3]}/>
                <meshStandardMaterial color="#ffaa00" metalness={0.6}/>
              </mesh>
              {/* Grappling hooks */}
              {[-1, 1].map((x) => (
                <mesh key={x} position={[x * 0.2, 0.3, 0]}>
                  <boxGeometry args={[0.1, 0.3, 0.1]}/>
                  <meshStandardMaterial color="#aaa"/>
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>

      {/* SOLAR WING LEFT */}
      <group ref={solarLeft} position={[-20, 0, 0]}>
        {/* Main support beam */}
        <mesh rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.15, 0.15, 10, 16]}/>
          <meshStandardMaterial color="#999"/>
        </mesh>
        
        {/* Solar panels with texture */}
        {[...Array(8)].map((_, row) => (
          [...Array(2)].map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[row * 3, col === 0 ? 1.8 : -1.8, 0]}
            >
              <boxGeometry args={[2.6, 0.03, 5]}/>
              <meshStandardMaterial
                map={solarTexture}
                metalness={0.4}
                roughness={0.6}
                emissive="#112244"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))
        ))}
        
        {/* Add panel frames */}
        {[...Array(8)].map((_, row) => (
          [...Array(2)].map((_, col) => (
            <mesh
              key={`frame-${row}-${col}`}
              position={[row * 3, col === 0 ? 1.8 : -1.8, 0.1]}
            >
              <boxGeometry args={[2.7, 0.1, 5.1]}/>
              <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} transparent opacity={0.3}/>
            </mesh>
          ))
        ))}
      </group>

      {/* SOLAR WING RIGHT */}
      <group ref={solarRight} position={[20, 0, 0]}>
        {/* Main support beam */}
        <mesh rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.15, 0.15, 10, 16]}/>
          <meshStandardMaterial color="#999"/>
        </mesh>
        
        {/* Solar panels with texture */}
        {[...Array(8)].map((_, row) => (
          [...Array(2)].map((_, col) => (
            <mesh
              key={`${row}-${col}`}
              position={[row * 3, col === 0 ? 1.8 : -1.8, 0]}
            >
              <boxGeometry args={[2.6, 0.03, 5]}/>
              <meshStandardMaterial
                map={solarTexture}
                metalness={0.4}
                roughness={0.6}
                emissive="#112244"
                emissiveIntensity={0.1}
              />
            </mesh>
          ))
        ))}
        
        {/* Add panel frames */}
        {[...Array(8)].map((_, row) => (
          [...Array(2)].map((_, col) => (
            <mesh
              key={`frame-${row}-${col}`}
              position={[row * 3, col === 0 ? 1.8 : -1.8, 0.1]}
            >
              <boxGeometry args={[2.7, 0.1, 5.1]}/>
              <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} transparent opacity={0.3}/>
            </mesh>
          ))
        ))}
      </group>

      {/* ANTENNA */}
      <mesh position={[0, 3, 2]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI]}/>
        <meshStandardMaterial color="#eeeeee"/>
      </mesh>

      {/* DOCKING PORT */}
      <mesh position={[0, 0, 8]}>
        <cylinderGeometry args={[0.6, 0.6, 1, 32]}/>
        <meshStandardMaterial color="#e0e0e0"/>
      </mesh>
    </group>
  )
}