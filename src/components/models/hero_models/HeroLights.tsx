'use client';
import * as THREE from "three";

const HeroLights = () => (
  <>
    {/* warm amber desk lamp */}
    <spotLight
      position={[2, 4, 5]}
      angle={0.3}
      penumbra={0.5}
      intensity={60}
      color="#F4A259"
    />
    {/* soft monitor glow */}
    <pointLight position={[0, 1.5, 2]} intensity={15} color="#e8e4dc" />
    {/* sage/forest mood light */}
    <spotLight
      position={[-3, 4, 3]}
      angle={0.5}
      penumbra={1}
      intensity={25}
      color="#8BA989"
    />
    {/* soft sage fill from side */}
    <primitive
      object={new THREE.RectAreaLight("#8BA989", 3, 2, 1.5)}
      position={[0, 2, 3]}
      rotation={[-Math.PI / 6, 0, 0]}
    />
  </>
);

export default HeroLights;
