import React from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import SpaceStation from "./SpaceStation"
import Constellations from "./Constellations"
import Earth from "./Earth"   // ← ADDED BACK

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

return(

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

{/* EARTH (added back) */}
<Earth/>

{/* Station */}
<SpaceStation/>

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

)

}