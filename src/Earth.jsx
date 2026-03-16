import React, { useRef } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"

export default function Earth(){

const earth = useRef()
const clouds = useRef()

const earthDay = useLoader(
TextureLoader,
"https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
)

const earthNight = useLoader(
TextureLoader,
"https://threejs.org/examples/textures/planets/earth_lights_2048.png"
)

const earthClouds = useLoader(
TextureLoader,
"https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
)

useFrame(()=>{

if(earth.current)
earth.current.rotation.y += 0.0005

if(clouds.current)
clouds.current.rotation.y += 0.0007

})

return(

<group position={[0,-40,-120]} rotation={[0,0,0.41]}>

{/* EARTH SURFACE */}
<mesh ref={earth}>
<sphereGeometry args={[40,128,128]}/>

<meshStandardMaterial
map={earthDay}
emissiveMap={earthNight}
emissive="#ffffff"
emissiveIntensity={0.05}
roughness={1}
depthWrite={true}
/>
</mesh>

{/* CLOUD LAYER */}
<mesh ref={clouds}>
<sphereGeometry args={[40.5,128,128]}/>

<meshStandardMaterial
map={earthClouds}
transparent
opacity={0.5}
depthWrite={false}
/>
</mesh>

</group>

)

}