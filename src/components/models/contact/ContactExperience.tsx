'use client';
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import Computer from "./Computer";

const ContactExperience = () => {
  return (
    <Canvas shadows camera={{ position: [0, 3, 7], fov: 45 }}>
      <ambientLight intensity={0.5} color="#fff4e6" />

      <directionalLight position={[5, 5, 3]} intensity={2.5} color="#ffd9b3" />

      <directionalLight
        position={[5, 9, 1]}
        castShadow
        intensity={2.5}
        color="#ffd9b3"
      />

      <OrbitControls
        enableZoom={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Floor - wooden */}
      <mesh
        receiveShadow
        position={[0, -1.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#5c3d2e" />
      </mesh>

      {/* Back wall - cream/off-white */}
      <mesh
        receiveShadow
        position={[0, 6, -8]}
      >
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial color="#e8e0d5" />
      </mesh>

      {/* Left wall */}
      <mesh
        receiveShadow
        position={[-10, 6, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial color="#ddd5ca" />
      </mesh>

      {/* Right wall */}
      <mesh
        receiveShadow
        position={[10, 6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[30, 15]} />
        <meshStandardMaterial color="#ddd5ca" />
      </mesh>

      <group scale={0.03} position={[0, -1.49, -2]} castShadow>
        <Computer />
      </group>
    </Canvas>
  );
};

export default ContactExperience;
