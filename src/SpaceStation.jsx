import React, { useRef, useMemo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { CanvasTexture, Vector3, AdditiveBlending } from "three"

export default function SpaceStation({ setTelemetry }){  // Added prop here
  const station = useRef()
  const solarLeft = useRef()
  const solarRight = useRef()

  const orbitGroup = useRef()
  
  // Refs for animated parts
  const canadarm = useRef()
  const canadarmBase = useRef()
  const canadarmUpper = useRef()
  const canadarmLower = useRef()
  const solarJoints = useRef([])
  const zvezdaAntenna = useRef()
  
  // Refs for new animated elements
  const astronaut1 = useRef()
  const astronaut2 = useRef()
  const droneRef = useRef()
  const cargoVehicle = useRef()
  const antennaRef = useRef()
  const sunRef = useRef()
  const thrusterParticles = useRef([])
  const thrusterGlows = useRef([])
  const miniArm = useRef()
  const telescopeRef = useRef()
  const cupolaRef = useRef()
  const earthLightRef = useRef()
  
  // Particle systems
  const shootingStars = useRef([])
  const debrisField = useRef([])
  
  // Orbit constants - for inclined orbit like ISS (51.6°)
  const orbitRadius = 150
  const inclination = 51.6 * (Math.PI / 180)

  // Create solar panel texture
  const solarTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    
    ctx.fillStyle = "#0a1a3a"
    ctx.fillRect(0, 0, 512, 512)
    
    ctx.fillStyle = "#2a4a8a"
    const cellSize = 64
    
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
    
    return new CanvasTexture(canvas)
  }, [])

  // Create gold thermal blanket texture
  const thermalTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#b8860b"
    ctx.fillRect(0, 0, 256, 256)
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.3})`
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 5, 5)
    }
    return new CanvasTexture(canvas)
  }, [])

  // Create brushed metal texture
  const metalTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    
    ctx.fillStyle = "#aaa"
    ctx.fillRect(0, 0, 512, 512)
    
    for (let i = 0; i < 512; i+=4) {
      ctx.strokeStyle = `rgba(255,255,255,${Math.random()*0.2})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + Math.random()*20, 512)
      ctx.stroke()
    }
    
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        ctx.fillStyle = "#666"
        ctx.beginPath()
        ctx.arc(i * 25 + 10, j * 25 + 10, 3, 0, Math.PI*2)
        ctx.fill()
      }
    }
    
    return new CanvasTexture(canvas)
  }, [])

  // Initialize shooting stars
  useEffect(() => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push({
        position: new Vector3(
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000,
          (Math.random() - 0.5) * 1000
        ),
        direction: new Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
        speed: Math.random() * 2 + 1,
        active: Math.random() > 0.7
      })
    }
    shootingStars.current = stars
  }, [])

  // Initialize debris field
  useEffect(() => {
    const debris = []
    for (let i = 0; i < 200; i++) {
      debris.push({
        position: new Vector3(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400
        ),
        rotation: new Vector3(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.1 + Math.random() * 0.3
      })
    }
    debrisField.current = debris
  }, [])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // SAFE CHECKS - Ensure all refs exist before manipulating
    try {
      // Solar wing rotation with sun tracking
      if(solarLeft.current && solarRight.current && sunRef.current && orbitGroup.current) {
        const sunDir = new Vector3()
          .subVectors(sunRef.current.position, orbitGroup.current.position)
          .normalize()
        
        const targetRotY = Math.atan2(sunDir.x, sunDir.z)
        
        // Use incremental rotation which is safe
        solarLeft.current.rotation.y += (targetRotY - solarLeft.current.rotation.y) * 0.01
        solarRight.current.rotation.y += (targetRotY - solarRight.current.rotation.y) * 0.01
      }

      // Solar array joints animation - with array existence check
      if (solarJoints.current && solarJoints.current.length > 0) {
        solarJoints.current.forEach((joint, index) => {
          if(joint && joint.rotation) {
            joint.rotation.x = Math.sin(t * 0.5 + index) * 0.15
            joint.rotation.z = Math.cos(t * 0.3 + index) * 0.1
          }
        })
      }

      // Canadarm animation with more realistic movement
      if(canadarmBase.current && canadarmUpper.current && canadarmLower.current) {
        canadarmBase.current.rotation.y = Math.sin(t * 0.1) * 0.5
        canadarmUpper.current.rotation.x = Math.sin(t * 0.3) * 0.4 + 0.2
        canadarmUpper.current.rotation.z = Math.cos(t * 0.2) * 0.3
        canadarmLower.current.rotation.x = Math.sin(t * 0.4 + 1) * 0.5 - 0.3
        canadarmLower.current.rotation.z = Math.cos(t * 0.3 + 2) * 0.2
      }

      // Zvezda antenna
      if(zvezdaAntenna.current) {
        zvezdaAntenna.current.rotation.y = Math.sin(t * 0.8) * 0.3
      }

      // Communication antenna tracking
      if(antennaRef.current) {
        antennaRef.current.rotation.y = Math.sin(t * 0.2) * 0.5
        antennaRef.current.rotation.x = Math.sin(t * 0.3) * 0.2
      }

      // Mini robotic arm animation
      if(miniArm.current) {
        miniArm.current.rotation.x = Math.sin(t * 0.6) * 0.3
      }

      // Telescope tracking
      if(telescopeRef.current) {
        telescopeRef.current.rotation.y = Math.sin(t * 0.1) * 0.2
      }

      // Cupola rotation
      if(cupolaRef.current) {
        cupolaRef.current.rotation.y += 0.005
      }

      // Animate astronauts with tasks
      if(astronaut1.current) {
        astronaut1.current.position.y = 1.5 + Math.sin(t * 0.5) * 0.2
        astronaut1.current.rotation.y = Math.sin(t * 0.3) * 0.2
        
        // Animate tool - with safe check
        if(astronaut1.current.children && astronaut1.current.children[6]) {
          astronaut1.current.children[6].rotation.x = Math.sin(t * 5) * 0.2
        }
      }
      
      if(astronaut2.current) {
        astronaut2.current.position.y = 1.5 + Math.cos(t * 0.6) * 0.2
        astronaut2.current.rotation.x = Math.sin(t * 0.4) * 0.2
      }

      // Animate drone
      if(droneRef.current) {
        droneRef.current.position.x = 8 + Math.sin(t * 0.8) * 5
        droneRef.current.position.y = 3 + Math.cos(t * 0.6) * 3
        droneRef.current.position.z = 2 + Math.cos(t * 0.5) * 4
        droneRef.current.rotation.y = t * 0.5
      }

      // Animate cargo vehicle
      if(cargoVehicle.current) {
        const approachPath = Math.sin(t * 0.3) * 3
        cargoVehicle.current.position.x = 12 + approachPath
        cargoVehicle.current.position.y = 3 + Math.sin(t * 0.5) * 1
        cargoVehicle.current.position.z = 8 + Math.cos(t * 0.4) * 2
        cargoVehicle.current.rotation.y = Math.sin(t * 0.2) * 0.3
      }

      // Sun movement
      if(sunRef.current) {
        const sunAngle = t * 0.05
        sunRef.current.position.x = Math.cos(sunAngle) * 1000
        sunRef.current.position.y = Math.sin(sunAngle) * 500
        sunRef.current.position.z = Math.sin(sunAngle) * 1000
      }

      // Earthshine effect
      if(earthLightRef.current && orbitGroup.current) {
        const earthDirection = new Vector3(0, 0, 0)
          .sub(orbitGroup.current.position)
          .normalize()
        
        earthLightRef.current.position.copy(earthDirection.multiplyScalar(-15))
        earthLightRef.current.intensity = 0.3 + Math.sin(t * 0.1) * 0.1
      }

      // Thruster effects - random firing
      if(Math.random() > 0.98 && thrusterGlows.current) {
        thrusterGlows.current.forEach((glow) => {
          if(glow) {
            glow.scale.setScalar(1 + Math.random() * 2)
            if(glow.material) {
              glow.material.opacity = 0.3 + Math.random() * 0.4
            }
          }
        })
      }

      // Thruster particle effects
      if (thrusterParticles.current) {
        thrusterParticles.current.forEach((particle) => {
          if(particle) {
            particle.position.y += 0.05
            if(particle.position.y > 2) {
              particle.position.y = -2
            }
          }
        })
      }

      // Shooting stars animation
      if (shootingStars.current) {
        shootingStars.current.forEach((star) => {
          if(star.active) {
            star.position.add(star.direction.clone().multiplyScalar(star.speed))
            if(Math.abs(star.position.x) > 1000) {
              star.active = false
            }
          }
        })
      }

      // FIXED ORBIT MOTION - Space station properly orbits around Earth at (0,0,0)
      const orbitSpeed = 0.1

      if(orbitGroup.current){
        // Calculate angle based on time
        const angle = t * orbitSpeed
        
        // Base circular orbit in XZ plane
        const x = Math.cos(angle) * orbitRadius
        const z = Math.sin(angle) * orbitRadius
        
        // Apply 51.6° inclination - this rotates the orbit around the X axis
        // This creates a proper inclined orbit that goes above and below the equator
        const inclinedY = Math.sin(angle) * orbitRadius * Math.sin(inclination)
        const inclinedZ = z * Math.cos(inclination)
        
        // Set the position
        orbitGroup.current.position.set(x, inclinedY, inclinedZ)
        
        // Rotate the station to always face Earth (center at 0,0,0)
        orbitGroup.current.lookAt(0, 0, 0)
      }

      // TELEMETRY DATA - Send to parent component
      const altitude = Math.round((orbitRadius / 150) * 408)
      const speed = 7.66 + Math.sin(t * 0.2) * 0.05

      // Update only occasionally (performance safe)
      if (setTelemetry && Math.floor(t * 2) % 2 === 0) {
        setTelemetry({
          altitude,
          speed: speed.toFixed(2)
        })
      }
    } catch (error) {
      // Silently catch errors to prevent crashes
      console.warn('Animation error:', error.message)
    }
  })

  return(
    <group>
      {/* Star field background - static stars */}
      <group>
        {Array.from({ length: 800 }, (_, i) => (
          <mesh key={i} position={[
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
          ]}>
            <sphereGeometry args={[Math.random() * 0.2 + 0.05, 4, 4]}/>
            <meshBasicMaterial color={Math.random() > 0.9 ? "#aaaaff" : "#ffffff"} />
          </mesh>
        ))}
      </group>

      {/* Shooting stars - animated */}
      {shootingStars.current && shootingStars.current.map((star, i) => star.active && (
        <mesh 
          key={`shooting-${i}`} 
          position={[
            star.position.x,
            star.position.y,
            star.position.z
          ]}
        >
          <coneGeometry args={[0.3, 3, 6]}/>
          <meshBasicMaterial color="#ffffaa" emissive="#ffaa00" transparent opacity={0.7}/>
        </mesh>
      ))}

      {/* Sun */}
      <group ref={sunRef} position={[1000, 500, 1000]}>
        <mesh>
          <sphereGeometry args={[20, 16, 16]}/>
          <meshBasicMaterial color="#ffffaa" emissive="#ffaa00" emissiveIntensity={2}/>
        </mesh>
        <pointLight intensity={2} distance={2000} decay={2} color="#ffaa88"/>
        <mesh>
          <sphereGeometry args={[25, 16, 16]}/>
          <meshBasicMaterial color="#ffaa44" transparent opacity={0.2} side={2}/>
        </mesh>
      </group>

      {/* Earthshine light */}
      <pointLight 
        ref={earthLightRef}
        color="#4466aa" 
        intensity={0.3} 
        distance={50}
      />

      {/* Space debris field */}
      <group>
        {debrisField.current && debrisField.current.map((debris, i) => (
          <mesh 
            key={`debris-${i}`} 
            position={[
              debris.position.x,
              debris.position.y,
              debris.position.z
            ]}
            rotation={[
              debris.rotation.x,
              debris.rotation.y,
              debris.rotation.z
            ]}
          >
            <dodecahedronGeometry args={[debris.scale, 0]}/>
            <meshStandardMaterial color="#886644" roughness={0.8}/>
          </mesh>
        ))}
      </group>

      <group ref={orbitGroup}>
        <group ref={station} scale={2.5}>
          {/* MAIN MODULE with NASA markings */}
          <mesh>
            <cylinderGeometry args={[1.4,1.4,9,64]}/>
            <meshStandardMaterial 
              map={metalTexture}
              metalness={0.9} 
              roughness={0.25} 
              color="#d1d5d8"
              emissiveMap={thermalTexture}
              emissive="#442200"
              emissiveIntensity={0.1}
            />
          </mesh>

          {/* NASA logo */}
          <mesh position={[0, 0.5, 4]}>
            <boxGeometry args={[1.2, 0.4, 0.1]}/>
            <meshStandardMaterial color="#0033a0"/>
          </mesh>
          <mesh position={[0.4, 0.5, 4.1]}>
            <boxGeometry args={[0.2, 0.2, 0.1]}/>
            <meshStandardMaterial color="#ffffff"/>
          </mesh>

          {/* Window lights */}
          {Array.from({ length: 8 }, (_, i) => (
            <pointLight 
              key={`window-${i}`}
              position={[
                Math.sin(i * 0.8) * 1.2,
                Math.cos(i * 0.5) * 0.8,
                i * 1.2 - 4
              ]}
              color="#ffffaa"
              intensity={0.3}
              distance={5}
            />
          ))}

          {/* NODE MODULE */}
          <mesh position={[0,0,6]}>
            <sphereGeometry args={[1.6,32,32]}/>
            <meshStandardMaterial 
              map={metalTexture}
              color="#d9d9d9" 
              metalness={0.8} 
              roughness={0.3}
            />
          </mesh>

          {/* CUPOLA - Observation module */}
          <group ref={cupolaRef} position={[0, 1.5, 4]}>
            <mesh>
              <cylinderGeometry args={[1, 1, 1, 8]}/>
              <meshStandardMaterial color="#aaa" metalness={0.8}/>
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * 60) * Math.PI / 180
              return (
                <mesh key={i} position={[Math.cos(angle)*0.8, 0, Math.sin(angle)*0.8]}>
                  <boxGeometry args={[0.4, 0.6, 0.1]}/>
                  <meshStandardMaterial color="#88aaff" emissive="#224466" transparent opacity={0.7}/>
                </mesh>
              )
            })}
          </group>

          {/* ZVEZDA SERVICE MODULE */}
          <group position={[0,0,-5]}>
            <mesh>
              <cylinderGeometry args={[1.4, 1.0, 4, 16]}/>
              <meshStandardMaterial 
                map={metalTexture}
                metalness={0.8} 
                roughness={0.3} 
                color="#c0c0c0"
              />
            </mesh>
            
            <mesh position={[0,0,2.2]}>
              <sphereGeometry args={[1.1, 24, 24]}/>
              <meshStandardMaterial 
                map={metalTexture}
                color="#a0a0a0" 
                metalness={0.9} 
                roughness={0.2}
              />
            </mesh>
            
            <mesh position={[0,0,-1.5]}>
              <cylinderGeometry args={[1.2, 1.2, 1, 16]}/>
              <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.4}/>
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
            <group ref={zvezdaAntenna} position={[0, 0.8, -2.2]}>
              <mesh>
                <cylinderGeometry args={[0.2, 0.2, 0.3, 8]}/>
                <meshStandardMaterial color="#cccccc" metalness={0.8}/>
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.3, 12, 12]}/>
                <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.3}/>
              </mesh>
            </group>
            
            {/* Thrusters with glows */}
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              return (
                <group key={i}>
                  <mesh position={[Math.cos(rad) * 1.3, Math.sin(rad) * 1.3, -1.8]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.3, 8]}/>
                    <meshStandardMaterial color="#888"/>
                  </mesh>
                  <mesh 
                    ref={el => {
                      if (el) {
                        thrusterParticles.current[i] = el
                        thrusterGlows.current[i] = el
                      }
                    }}
                    position={[Math.cos(rad) * 1.3, Math.sin(rad) * 1.3, -2.0]}
                  >
                    <sphereGeometry args={[0.2, 6, 6]}/>
                    <meshBasicMaterial 
                      color="#ff6600" 
                      transparent 
                      opacity={0.2}
                      blending={AdditiveBlending}
                    />
                  </mesh>
                </group>
              )
            })}
          </group>

          {/* SIDE MODULES */}
          <mesh position={[-6,0,0]}>
            <cylinderGeometry args={[1,1,6,64]}/>
            <meshStandardMaterial map={metalTexture} metalness={0.9} roughness={0.3} color="#d9d9d9"/>
          </mesh>

          <mesh position={[6,0,0]}>
            <cylinderGeometry args={[1,1,6,64]}/>
            <meshStandardMaterial map={metalTexture} metalness={0.9} roughness={0.3} color="#d9d9d9"/>
          </mesh>

          {/* JEM Module */}
          <group position={[8, 1, 0]}>
            <mesh>
              <cylinderGeometry args={[1.2, 1.2, 4, 16]}/>
              <meshStandardMaterial color="#aaddff" metalness={0.6}/>
            </mesh>
            <mesh position={[2, 0, 0]}>
              <boxGeometry args={[3, 0.2, 2]}/>
              <meshStandardMaterial color="#cccccc"/>
            </mesh>
            {/* Experiment packages */}
            <mesh position={[2.5, 0.5, 0.5]}>
              <boxGeometry args={[0.4, 0.4, 0.4]}/>
              <meshStandardMaterial color="#ffaa00"/>
            </mesh>
            <mesh position={[1.5, -0.3, -0.5]}>
              <sphereGeometry args={[0.3, 8, 8]}/>
              <meshStandardMaterial color="#ff5555"/>
            </mesh>
          </group>

          {/* MAIN TRUSS */}
          <group position={[0,0,0]}>
            <mesh rotation={[0,0,Math.PI/2]}>
              <cylinderGeometry args={[0.2, 0.2, 40, 8]}/>
              <meshStandardMaterial color="#888"/>
            </mesh>
            {[-15, -10, -5, 0, 5, 10, 15].map((pos, i) => (
              <mesh key={i} position={[pos, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 2.5, 6]}/>
                <meshStandardMaterial color="#888"/>
              </mesh>
            ))}
          </group>

          {/* CANADARM */}
          <group position={[6, 0.8, 1.5]}>
            <group ref={canadarm} position={[0, 1.0, 0]}>
              <group ref={canadarmBase}>
                <mesh>
                  <cylinderGeometry args={[0.8, 0.8, 0.6, 8]}/>
                  <meshStandardMaterial color="#ddd" metalness={0.8}/>
                </mesh>
                
                <group ref={canadarmUpper} position={[0, 0.8, 0]}>
                  <mesh>
                    <boxGeometry args={[0.6, 6.0, 0.6]}/>
                    <meshStandardMaterial color="#ccc" metalness={0.7}/>
                  </mesh>
                  
                  <mesh position={[0, 3.2, 0]}>
                    <sphereGeometry args={[0.6, 12, 12]}/>
                    <meshStandardMaterial color="#aaa" metalness={0.9}/>
                  </mesh>
                  
                  <group ref={canadarmLower} position={[0, 3.8, 0]}>
                    <mesh>
                      <boxGeometry args={[0.55, 6.0, 0.55]}/>
                      <meshStandardMaterial color="#bbb" metalness={0.7}/>
                    </mesh>
                    
                    <mesh position={[0, 3.2, 0]}>
                      <sphereGeometry args={[0.5, 10, 10]}/>
                      <meshStandardMaterial color="#aaa" metalness={0.9}/>
                    </mesh>
                    
                    <group position={[0, 3.8, 0]}>
                      <mesh>
                        <boxGeometry args={[0.5, 0.8, 0.5]}/>
                        <meshStandardMaterial color="#ffaa00" metalness={0.6}/>
                      </mesh>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>

          {/* Mini robotic arm */}
          <group ref={miniArm} position={[-10, 1.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 2, 6]}/>
              <meshStandardMaterial color="#aaa"/>
            </mesh>
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.2, 6, 6]}/>
              <meshStandardMaterial color="#888"/>
            </mesh>
          </group>

          {/* Telescope */}
          <group ref={telescopeRef} position={[0, 2, -8]}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 2.5, 16]}/>
              <meshStandardMaterial color="#dddddd" metalness={0.8}/>
            </mesh>
            <mesh position={[0, 0, 1.2]}>
              <torusGeometry args={[0.6, 0.1, 16, 32]}/>
              <meshStandardMaterial color="#888888"/>
            </mesh>
          </group>

          {/* DOCKING TARGET */}
          <group position={[0, 0, 8.2]}>
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.4, 0.05, 16, 32]}/>
              <meshStandardMaterial color="#ffaa00" emissive="#442200"/>
            </mesh>
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.6, 0.05, 16, 32]}/>
              <meshStandardMaterial color="#ffaa00" emissive="#442200"/>
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 6]}/>
              <meshStandardMaterial color="#ff0000"/>
            </mesh>
          </group>

          {/* CARGO VEHICLE */}
          <group ref={cargoVehicle} position={[12, 3, 8]}>
            <mesh>
              <coneGeometry args={[0.8, 2, 16]}/>
              <meshStandardMaterial color="#ff9933"/>
            </mesh>
            <mesh position={[0, -1, 0]}>
              <cylinderGeometry args={[0.8, 0.8, 1, 16]}/>
              <meshStandardMaterial color="#cccccc" metalness={0.7}/>
            </mesh>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 8]}/>
              <meshStandardMaterial color="#888888"/>
            </mesh>
            {/* Docking light */}
            <pointLight position={[0, 1.2, 0]} color="#ffff00" intensity={1} distance={10}/>
          </group>

          {/* Communication antenna */}
          <group ref={antennaRef} position={[-4, 2.5, 4]}>
            <mesh>
              <cylinderGeometry args={[0.2, 0.2, 2, 8]}/>
              <meshStandardMaterial color="#aaaaaa"/>
            </mesh>
            <mesh position={[0, 1, 0]}>
              <sphereGeometry args={[0.4, 8, 8]}/>
              <meshStandardMaterial color="#dddddd" metalness={0.9}/>
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <coneGeometry args={[0.5, 0.6, 16]}/>
              <meshStandardMaterial color="#cccccc" metalness={0.8}/>
            </mesh>
          </group>

          {/* ASTRONAUT 1 - with tools */}
          <group ref={astronaut1} position={[5, 1.5, 2]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[0.25, 16, 16]}/>
              <meshStandardMaterial color="#ffffcc" metalness={0.9}/>
            </mesh>
            <mesh position={[0, 0.7, 0.15]}>
              <sphereGeometry args={[0.15, 8, 8]}/>
              <meshStandardMaterial color="#ffaa00" metalness={0.9}/>
            </mesh>
            <mesh position={[0, 0, -0.3]}>
              <boxGeometry args={[0.5, 0.6, 0.3]}/>
              <meshStandardMaterial color="#666" metalness={0.7}/>
            </mesh>
            {/* Arms */}
            <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, 0.2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 6]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 6]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            {/* Tool */}
            <mesh position={[0.5, 0.2, 0.2]} rotation={[0.2, 0.3, 0.1]}>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 6]}/>
              <meshStandardMaterial color="#ffaa00"/>
            </mesh>
            {/* Tether */}
            <mesh position={[0.3, -0.3, -0.3]} rotation={[0.1, 0.5, 0.2]}>
              <cylinderGeometry args={[0.02, 0.02, 2, 4]}/>
              <meshStandardMaterial color="#ccc"/>
            </mesh>
            <pointLight position={[0, 0.7, 0.3]} color="#ffffaa" intensity={0.5} distance={5}/>
          </group>

          {/* ASTRONAUT 2 */}
          <group ref={astronaut2} position={[-18, 2, 1]}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 1, 8]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <sphereGeometry args={[0.25, 16, 16]}/>
              <meshStandardMaterial color="#ffffcc" metalness={0.9}/>
            </mesh>
            <mesh position={[0, 0.7, 0.15]}>
              <sphereGeometry args={[0.15, 8, 8]}/>
              <meshStandardMaterial color="#ffaa00" metalness={0.9}/>
            </mesh>
            <mesh position={[0, 0, -0.3]}>
              <boxGeometry args={[0.5, 0.6, 0.3]}/>
              <meshStandardMaterial color="#666" metalness={0.7}/>
            </mesh>
            <mesh position={[0.4, 0.2, 0.2]} rotation={[0.2, 0.1, 0.1]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 6]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            <mesh position={[-0.4, 0.2, -0.2]} rotation={[-0.1, -0.2, -0.1]}>
              <cylinderGeometry args={[0.1, 0.1, 0.8, 6]}/>
              <meshStandardMaterial color="#ffffff"/>
            </mesh>
            <pointLight position={[0, 0.7, 0.3]} color="#ffffaa" intensity={0.5} distance={5}/>
          </group>

          {/* CAMERA DRONE */}
          <group ref={droneRef} position={[8, 3, 2]}>
            <mesh>
              <sphereGeometry args={[0.2, 8, 8]}/>
              <meshStandardMaterial color="#333333" metalness={0.7}/>
            </mesh>
            <mesh position={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 6]}/>
              <meshStandardMaterial color="#666666"/>
            </mesh>
            <mesh position={[0, 0, 0.55]}>
              <sphereGeometry args={[0.08, 6, 6]}/>
              <meshStandardMaterial color="#88aaff" emissive="#224466"/>
            </mesh>
            {/* Rotors */}
            {[[0.25,0,0], [-0.25,0,0], [0,0.25,0], [0,-0.25,0]].map((pos, i) => (
              <mesh key={i} position={pos}>
                <boxGeometry args={[0.1, 0.02, 0.3]}/>
                <meshStandardMaterial color="#cccccc"/>
              </mesh>
            ))}
            {/* Navigation lights */}
            <pointLight position={[0.2, 0.1, 0.1]} color="#ff0000" intensity={0.5} distance={5}/>
            <pointLight position={[-0.2, -0.1, 0.1]} color="#00ff00" intensity={0.5} distance={5}/>
          </group>

          {/* Left solar wing */}
          <group ref={solarLeft} position={[-20,0,0]}>
            <mesh rotation={[0,0,Math.PI/2]}>
              <cylinderGeometry args={[0.2,0.2,24,8]}/>
              <meshStandardMaterial color="#999"/>
            </mesh>
            {/* Joints */}
            {[-3, 0, 3, 6, 9, 12, 15, 18].map((pos, index) => (
              <mesh 
                key={`joint-${index}`}
                ref={el => {
                  if (el) solarJoints.current[index] = el
                }}
                position={[pos, 0, 0]}
              >
                <sphereGeometry args={[0.35, 16, 16]}/>
                <meshStandardMaterial color="#aaa" metalness={0.9}/>
              </mesh>
            ))}
            {/* Panels */}
            {Array.from({ length: 6 }, (_, row) => (
              Array.from({ length: 2 }, (_, col) => (
                <mesh
                  key={`${row}-${col}`}
                  position={[row*3, col === 0 ? 1.8 : -1.8, 0]}
                >
                  <boxGeometry args={[2.8, 0.03, 5]}/>
                  <meshStandardMaterial
                    map={solarTexture}
                    metalness={0.4}
                    roughness={0.6}
                    emissive="#112244"
                    emissiveIntensity={0.2}
                  />
                </mesh>
              ))
            ))}
          </group>

          {/* Right solar wing */}
          <group ref={solarRight} position={[20,0,0]}>
            <mesh rotation={[0,0,Math.PI/2]}>
              <cylinderGeometry args={[0.2,0.2,24,8]}/>
              <meshStandardMaterial color="#999"/>
            </mesh>
            {/* Joints */}
            {[-3, 0, 3, 6, 9, 12, 15, 18].map((pos, index) => (
              <mesh 
                key={`joint-${index+8}`}
                ref={el => {
                  if (el) solarJoints.current[index+8] = el
                }}
                position={[pos, 0, 0]}
              >
                <sphereGeometry args={[0.35, 16, 16]}/>
                <meshStandardMaterial color="#aaa" metalness={0.9}/>
              </mesh>
            ))}
            {/* Panels */}
            {Array.from({ length: 6 }, (_, row) => (
              Array.from({ length: 2 }, (_, col) => (
                <mesh
                  key={`${row}-${col}`}
                  position={[row*3, col === 0 ? 1.8 : -1.8, 0]}
                >
                  <boxGeometry args={[2.8, 0.03, 5]}/>
                  <meshStandardMaterial
                    map={solarTexture}
                    metalness={0.4}
                    roughness={0.6}
                    emissive="#112244"
                    emissiveIntensity={0.2}
                  />
                </mesh>
              ))
            ))}
          </group>

          {/* Radiator panels */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh key={`rad-${i}`} position={[-6 + i*6, 2.2, 0]}>
              <boxGeometry args={[4, 0.05, 2]}/>
              <meshStandardMaterial color="#e6e6e6" metalness={0.2}/>
            </mesh>
          ))}

          {/* DOCKING PORT */}
          <mesh position={[0,0,8]}>
            <cylinderGeometry args={[0.6,0.6,1,32]}/>
            <meshStandardMaterial color="#e0e0e0" metalness={0.8}/>
          </mesh>

          {/* Navigation lights */}
          <pointLight position={[8, 2, 4]} color="#ff0000" intensity={0.5} distance={15}/>
          <pointLight position={[-8, -2, 4]} color="#00ff00" intensity={0.5} distance={15}/>
        </group>
      </group>
    </group>
  )
}