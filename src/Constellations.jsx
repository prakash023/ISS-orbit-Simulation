import React, { useMemo } from "react"
import * as THREE from "three"

export default function Constellations(){

const stars = useMemo(()=>{

const positions = []
const sizes = []

// Example constellation star angles (RA/DEC style simplified)
const starAngles = [

/* Orion */
[83, -5],
[78, -8],
[88, -1],
[84, -10],
[81, -12],
[86, -13],

/* Ursa Major */
[165, 60],
[170, 62],
[175, 65],
[180, 67],
[185, 69],
[190, 71],
[195, 73],

/* Cassiopeia */
[10, 60],
[20, 62],
[30, 60],
[40, 62],
[50, 60]

]

const radius = 1800

starAngles.forEach(([ra,dec])=>{

const phi = THREE.MathUtils.degToRad(90 - dec)
const theta = THREE.MathUtils.degToRad(ra)

const x = radius * Math.sin(phi) * Math.cos(theta)
const y = radius * Math.cos(phi)
const z = radius * Math.sin(phi) * Math.sin(theta)

positions.push(x,y,z)
sizes.push(2)

})

const geometry = new THREE.BufferGeometry()

geometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(positions,3)
)

return geometry

},[])

return(

<points geometry={stars}>

<pointsMaterial
size={2}
color="white"
sizeAttenuation={false}
depthWrite={false}
/>

</points>

)

}