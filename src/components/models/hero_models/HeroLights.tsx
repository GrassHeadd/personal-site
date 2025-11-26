'use client';
import * as THREE from "three";

const HeroLights = () => (
  <>
    {/* warm desk lamp */}
    <spotLight
      position={[2, 4, 5]}
      angle={0.3}
      penumbra={0.5}
      intensity={60}
      color="#ffc266"
    />
    {/* soft monitor glow */}
    <pointLight position={[0, 1.5, 2]} intensity={15} color="#e0e8ff" />
    {/* blue mood light */}
    <spotLight
      position={[-3, 4, 3]}
      angle={0.5}
      penumbra={1}
      intensity={25}
      color="#3b82f6"
    />
    {/* soft blue fill from side */}
    <primitive
      object={new THREE.RectAreaLight("#6090c0", 3, 2, 1.5)}
      position={[0, 2, 3]}
      rotation={[-Math.PI / 6, 0, 0]}
    />
  </>
);

export default HeroLights;
