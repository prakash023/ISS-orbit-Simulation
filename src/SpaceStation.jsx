import React, { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { CanvasTexture } from "three"

export default function SpaceStation(){
  const station = useRef()
  const solarLeft = useRef()
  const solarRight = useRef()
  
  // Refs for animated parts
  const canadarm = useRef()
  const canadarmBase = useRef()
  const canadarmUpper = useRef()
  const canadarmLower = useRef()
  const solarJoints = useRef([])
  const zvezdaAntenna = useRef()

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
        if ((i + j) % 2 === 0) {
          ctx.fillRect(i * cellSize + 2, j * cellSize + 2, cellSize - 4, cellSize - 4)
        } else {
          ctx.fillStyle = "#1a3a6a"
          ctx.fillRect(i * cellSize + 2, j * cellSize + 2, cellSize - 4, cellSize - 4)
          ctx.fillStyle = "#2a4a8a"
        }
      }
    }
    
    // Add grid lines
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
    
    // Add thin blue highlights
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

    // Solar wing rotation
    if(solarLeft.current) {
      solarLeft.current.rotation.y = Math.sin(t) * 0.2
    }
    if(solarRight.current) {
      solarRight.current.rotation.y = Math.sin(t) * 0.2
    }

    // Solar array joints
    solarJoints.current.forEach((joint, index) => {
      if(joint) {
        joint.rotation.x = Math.sin(t * 0.5 + index) * 0.15
        joint.rotation.z = Math.cos(t * 0.3 + index) * 0.1
      }
    })

    // Canadarm animation
    if(canadarmBase.current && canadarmUpper.current && canadarmLower.current) {
      // Base rotates slowly
      canadarmBase.current.rotation.y = Math.sin(t * 0.1) * 0.5
      
      // Upper arm
      canadarmUpper.current.rotation.x = Math.sin(t * 0.3) * 0.4 + 0.2
      canadarmUpper.current.rotation.z = Math.cos(t * 0.2) * 0.3
      
      // Lower arm
      canadarmLower.current.rotation.x = Math.sin(t * 0.4 + 1) * 0.5 - 0.3
      canadarmLower.current.rotation.z = Math.cos(t * 0.3 + 2) * 0.2
    }

    // Zvezda antenna
    if(zvezdaAntenna.current) {
      zvezdaAntenna.current.rotation.y = Math.sin(t * 0.8) * 0.3
    }
  })

  return(
    <group ref={station} scale={2.5}>
      {/* MAIN MODULE (Unity Module) */}
      <mesh>
        <cylinderGeometry args={[1.4,1.4,9,64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.25} color="#d1d5d8"/>
      </mesh>

      {/* NODE MODULE (Forward) */}
      <mesh position={[0,0,6]}>
        <sphereGeometry args={[1.6,32,32]}/>
        <meshStandardMaterial color="#d9d9d9"/>
      </mesh>

      {/* ZVEZDA SERVICE MODULE (Aft) */}
      <group position={[0,0,-5]}>
        {/* Main body */}
        <mesh>
          <cylinderGeometry args={[1.4, 1.0, 4, 16]}/>
          <meshStandardMaterial metalness={0.8} roughness={0.3} color="#c0c0c0"/>
        </mesh>
        
        {/* Docking sphere */}
        <mesh position={[0,0,2.2]}>
          <sphereGeometry args={[1.1, 24, 24]}/>
          <meshStandardMaterial color="#b0b0b0"/>
        </mesh>
        
        {/* Transfer compartment */}
        <mesh position={[0,0,-1.5]}>
          <cylinderGeometry args={[1.2, 1.2, 1, 16]}/>
          <meshStandardMaterial color="#a0a0a0"/>
        </mesh>
        
        {/* Solar panels */}
        <group position={[1.6,0,0]}>
          <mesh rotation={[0,0,Math.PI/2]}>
            <boxGeometry args={[0.2, 2.8, 1.8]}/>
            <meshStandardMaterial map={solarTexture} metalness={0.4} roughness={0.6}/>
          </mesh>
        </group>
        
        <group position={[-1.6,0,0]}>
          <mesh rotation={[0,0,Math.PI/2]}>
            <boxGeometry args={[0.2, 2.8, 1.8]}/>
            <meshStandardMaterial map={solarTexture} metalness={0.4} roughness={0.6}/>
          </mesh>
        </group>
        
        {/* Kurs antenna */}
        <mesh ref={zvezdaAntenna} position={[0, 0.8, -2.2]}>
          <sphereGeometry args={[0.4, 16, 16]}/>
          <meshStandardMaterial color="#dddddd"/>
        </mesh>
        
        {/* Thrusters */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180
          return (
            <mesh key={i} position={[Math.cos(rad) * 1.3, Math.sin(rad) * 1.3, -1.8]}>
              <cylinderGeometry args={[0.15, 0.15, 0.3, 8]}/>
              <meshStandardMaterial color="#888"/>
            </mesh>
          )
        })}
      </group>

      {/* SIDE MODULES */}
      <mesh position={[-6,0,0]}>
        <cylinderGeometry args={[1,1,6,64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.3} color="#d9d9d9"/>
      </mesh>

      <mesh position={[6,0,0]}>
        <cylinderGeometry args={[1,1,6,64]}/>
        <meshStandardMaterial metalness={0.9} roughness={0.3} color="#d9d9d9"/>
      </mesh>

      {/* CONNECTING TRUSSES BETWEEN MODULES */}
      {/* Forward connecting truss */}
      <mesh position={[0,0,3]}>
        <boxGeometry args={[2, 0.3, 2]}/>
        <meshStandardMaterial color="#888"/>
      </mesh>
      
      {/* Aft connecting truss */}
      <mesh position={[0,0,-2]}>
        <boxGeometry args={[2, 0.3, 2]}/>
        <meshStandardMaterial color="#888"/>
      </mesh>

      {/* MAIN TRUSS STRUCTURE */}
      <group position={[0,0,0]}>
        {/* Horizontal truss beams */}
        {[...Array(16)].map((_,i)=>(
          <group key={`truss-${i}`} position={[-16 + i*2,0,0]}>
            <mesh position={[0,0.4,0]}>
              <boxGeometry args={[2,0.1,0.1]}/>
              <meshStandardMaterial color="#777"/>
            </mesh>
            <mesh position={[0,-0.4,0]}>
              <boxGeometry args={[2,0.1,0.1]}/>
              <meshStandardMaterial color="#777"/>
            </mesh>
            <mesh rotation={[0,0,Math.PI/4]}>
              <boxGeometry args={[0.1,1.2,0.1]}/>
              <meshStandardMaterial color="#777"/>
            </mesh>
            <mesh rotation={[0,0,-Math.PI/4]}>
              <boxGeometry args={[0.1,1.2,0.1]}/>
              <meshStandardMaterial color="#777"/>
            </mesh>
          </group>
        ))}

        {/* Vertical truss supports */}
        {[...Array(14)].map((_,i)=>(
          <mesh key={i} position={[-15 + i*2.3,0,0]} rotation={[0,0,Math.PI/4]}>
            <boxGeometry args={[0.15,2.2,0.15]}/>
            <meshStandardMaterial color="#777"/>
          </mesh>
        ))}
      </group>

      {/* CANADARM - Properly attached and scaled */}
      <group position={[6, 0.8, 1.5]}>
        {/* Mounting structure connected to side module */}
        <group>
          {/* Base plate attached to module */}
          <mesh position={[0, -0.5, 0]}>
            <boxGeometry args={[1.5, 0.3, 1.5]}/>
            <meshStandardMaterial color="#777" metalness={0.8}/>
          </mesh>
          
          {/* Support arms connecting to module */}
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={`support-${i}`} position={[x, -0.8, 0.4]} rotation={[0.3, 0, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 1.2, 6]}/>
              <meshStandardMaterial color="#888"/>
            </mesh>
          ))}
          
          {/* Vertical mast */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.2, 8]}/>
            <meshStandardMaterial color="#999"/>
          </mesh>
          
          {/* Arm base platform */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.2, 8]}/>
            <meshStandardMaterial color="#aaa" metalness={0.7}/>
          </mesh>
        </group>

        {/* CANADARM ARM ASSEMBLY - SCALED TO REALISTIC LENGTH */}
        <group ref={canadarm} position={[0, 1.0, 0]}>
          {/* Base / Shoulder */}
          <group ref={canadarmBase}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.6, 8]}/>
              <meshStandardMaterial color="#ddd" metalness={0.8}/>
            </mesh>
            
            {/* Upper arm - 6 units long */}
            <group ref={canadarmUpper} position={[0, 0.8, 0]}>
              <mesh>
                <boxGeometry args={[0.6, 6.0, 0.6]}/>
                <meshStandardMaterial color="#ccc" metalness={0.7}/>
              </mesh>
              
              {/* Elbow joint */}
              <mesh position={[0, 3.2, 0]}>
                <sphereGeometry args={[0.6, 12, 12]}/>
                <meshStandardMaterial color="#aaa" metalness={0.9}/>
              </mesh>
              
              {/* Lower arm - 6 units long */}
              <group ref={canadarmLower} position={[0, 3.8, 0]}>
                <mesh>
                  <boxGeometry args={[0.55, 6.0, 0.55]}/>
                  <meshStandardMaterial color="#bbb" metalness={0.7}/>
                </mesh>
                
                {/* Wrist joint */}
                <mesh position={[0, 3.2, 0]}>
                  <sphereGeometry args={[0.5, 10, 10]}/>
                  <meshStandardMaterial color="#aaa" metalness={0.9}/>
                </mesh>
                
                {/* End effector */}
                <group position={[0, 3.8, 0]}>
                  <mesh>
                    <boxGeometry args={[0.5, 0.8, 0.5]}/>
                    <meshStandardMaterial color="#ffaa00" metalness={0.6}/>
                  </mesh>
                  {/* Grappling hooks */}
                  {[-1, 1].map((x) => (
                    <mesh key={x} position={[x * 0.3, 0.5, 0]}>
                      <boxGeometry args={[0.15, 0.6, 0.15]}/>
                      <meshStandardMaterial color="#aaa"/>
                    </mesh>
                  ))}
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ROTATING SOLAR ARRAY JOINTS - Integrated into wings */}
      {/* Left wing with integrated joints */}
      <group ref={solarLeft} position={[-20,0,0]}>
        {/* Main truss with joints */}
        {[-3, 0, 3, 6, 9, 12, 15, 18].map((pos, index) => (
          <group key={`left-joint-${index}`} position={[pos, 0, 0]}>
            {/* Joint sphere */}
            <mesh ref={el => solarJoints.current[index] = el}>
              <sphereGeometry args={[0.35, 16, 16]}/>
              <meshStandardMaterial color="#aaa" metalness={0.9} emissive="#333" emissiveIntensity={0.2}/>
            </mesh>
            {/* Connecting rods */}
            <mesh rotation={[0,0,Math.PI/2]}>
              <cylinderGeometry args={[0.1, 0.1, 1.2, 8]}/>
              <meshStandardMaterial color="#999"/>
            </mesh>
          </group>
        ))}
        
        {/* Main support beam */}
        <mesh rotation={[0,0,Math.PI/2]}>
          <cylinderGeometry args={[0.15,0.15,24,16]}/>
          <meshStandardMaterial color="#999"/>
        </mesh>
        
        {/* Solar panels */}
        {[...Array(8)].map((_,row)=>(
          [...Array(2)].map((_,col)=>(
            <mesh
              key={`${row}-${col}`}
              position={[row*3, col===0?1.8:-1.8, 0]}
            >
              <boxGeometry args={[2.6,0.03,5]}/>
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
      </group>

      {/* Right wing with integrated joints */}
      <group ref={solarRight} position={[20,0,0]}>
        {/* Main truss with joints */}
        {[-3, 0, 3, 6, 9, 12, 15, 18].map((pos, index) => (
          <group key={`right-joint-${index}`} position={[pos, 0, 0]}>
            <mesh ref={el => solarJoints.current[index + 8] = el}>
              <sphereGeometry args={[0.35, 16, 16]}/>
              <meshStandardMaterial color="#aaa" metalness={0.9} emissive="#333" emissiveIntensity={0.2}/>
            </mesh>
            <mesh rotation={[0,0,Math.PI/2]}>
              <cylinderGeometry args={[0.1, 0.1, 1.2, 8]}/>
              <meshStandardMaterial color="#999"/>
            </mesh>
          </group>
        ))}
        
        <mesh rotation={[0,0,Math.PI/2]}>
          <cylinderGeometry args={[0.15,0.15,24,16]}/>
          <meshStandardMaterial color="#999"/>
        </mesh>
        
        {[...Array(8)].map((_,row)=>(
          [...Array(2)].map((_,col)=>(
            <mesh
              key={`${row}-${col}`}
              position={[row*3, col===0?1.8:-1.8, 0]}
            >
              <boxGeometry args={[2.6,0.03,5]}/>
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
      </group>

      {/* RADIATOR PANELS */}
      {[...Array(3)].map((_,i)=>(
        <group key={`rad-top-${i}`} position={[-6 + i*6,2.2,0]}>
          <mesh>
            <boxGeometry args={[0.1,1.8,0.1]}/>
            <meshStandardMaterial color="#aaa"/>
          </mesh>
          <mesh position={[0,1.4,0]}>
            <boxGeometry args={[4,0.05,2]}/>
            <meshStandardMaterial color="#e6e6e6" metalness={0.2} roughness={0.8}/>
          </mesh>
        </group>
      ))}

      {[...Array(3)].map((_,i)=>(
        <group key={`rad-bottom-${i}`} position={[-6 + i*6,-2.2,0]}>
          <mesh>
            <boxGeometry args={[0.1,1.8,0.1]}/>
            <meshStandardMaterial color="#aaa"/>
          </mesh>
          <mesh position={[0,-1.4,0]}>
            <boxGeometry args={[4,0.05,2]}/>
            <meshStandardMaterial color="#e6e6e6" metalness={0.2} roughness={0.8}/>
          </mesh>
        </group>
      ))}

      {/* ANTENNA */}
      <mesh position={[0,3,2]}>
        <sphereGeometry args={[1,32,32,0,Math.PI]}/>
        <meshStandardMaterial color="#eeeeee"/>
      </mesh>

      {/* DOCKING PORT */}
      <mesh position={[0,0,8]}>
        <cylinderGeometry args={[0.6,0.6,1,32]}/>
        <meshStandardMaterial color="#e0e0e0"/>
      </mesh>
    </group>
  )
}