import React, { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

import SpaceStation from "./SpaceStation"
import Constellations from "./Constellations"
import Earth from "./Earth"

function Sky(){
  return(
    <group>
      <Stars
        radius={2000}
        depth={1000}
        count={120000}
        factor={10}
        saturation={0}
        fade={false}
        speed={0}
      />
      <Constellations/>
    </group>
  )
}

export default function App(){

  // ✅ TELEMETRY STATE
  const [telemetry, setTelemetry] = useState({
    altitude: 408,
    speed: 7.66
  })

  return(
    <div style={{ width:"100vw", height:"100vh", position:"relative" }}>

      {/* 3D SCENE */}
      <Canvas
        camera={{ position:[25,12,35], fov:70, far:5000 }}
        gl={{ antialias:true }}
      >

        <color attach="background" args={["black"]} />

        {/* Sunlight */}
        <directionalLight position={[40,20,20]} intensity={2} />
        <ambientLight intensity={0.15} />

        {/* Sky */}
        <Sky/>

        {/* Earth */}
        <Earth/>

        {/* Station (now passes telemetry setter) */}
        <SpaceStation setTelemetry={setTelemetry} />

        <OrbitControls
          target={[0,0,0]}
          enableZoom
          enablePan
          enableRotate
          minDistance={10}
          maxDistance={400}
          zoomSpeed={0.9}
          rotateSpeed={0.6}
          enableDamping
          dampingFactor={0.05}
        />

        <EffectComposer>
          <Bloom intensity={0.4}/>
        </EffectComposer>

      </Canvas>

      {/* 🛰 TELEMETRY PANEL */}
      <div style={{
        position: "absolute",
        top: 20,
        left: 20,
        color: "white",
        fontFamily: "monospace",
        background: "rgba(0,0,0,0.6)",
        padding: "12px 16px",
        borderRadius: "8px",
        pointerEvents: "none"
      }}>
        <h3>🛰 ISS Telemetry</h3>
        <p><b>Altitude:</b> {telemetry.altitude} km</p>
        <p><b>Speed:</b> {telemetry.speed} km/s</p>
        <p><b>Orbit:</b> 92 min</p>
        <p><b>Inclination:</b> 51.6°</p>
      </div>

      {/* 📘 INFO PANEL */}
      <div style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: "280px",
        color: "white",
        background: "rgba(0,0,0,0.6)",
        padding: "12px",
        borderRadius: "8px",
        pointerEvents: "none"
      }}>
        <h4>About</h4>
        <p>
          This simulation represents the International Space Station orbiting Earth.
          It travels at ~7.66 km/s and completes one orbit every 90 minutes.
        </p>
      </div>

    </div>
  )
}