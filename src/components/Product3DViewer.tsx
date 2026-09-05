import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Float,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';

function BottleModel() {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (hovered) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  return (
    <group 
      ref={meshRef} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      {/* Bottle Body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.4, 32]} />
        <meshPhysicalMaterial 
          color={hovered ? "#111" : "#0a0a0a"} 
          roughness={0.1}
          metalness={0.4}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>
      
      {/* Wireframe Overlay */}
      {hovered && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 1.42, 16, 8]} />
          <meshBasicMaterial color="#dc2626" wireframe transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Bottle Cap */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 0.3, 32]} />
        <meshPhysicalMaterial 
          color="#dc2626" 
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Glossy Label Area */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.51, 0.51, 0.8, 32, 1, true]} />
        <meshStandardMaterial 
          color="#111" 
          roughness={0.05} 
        />
      </mesh>
      
      <mesh position={[0, -0.2, 0.52]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#dc2626" transparent opacity={hovered ? 1 : 0.6} />
      </mesh>
    </group>
  );
}

export default function Product3DViewer() {
  return (
    <div
      className="w-full h-full bg-transparent cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3D product model, drag to rotate"
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
        {/* Lit by the scene alone — the old <Environment preset> pulled an HDR from a
            third-party CDN at runtime, and while it loaded the bottle was blank. */}
        <ambientLight intensity={0.7} />
        <hemisphereLight args={["#ffffff", "#222222", 0.8]} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.4} castShadow />
        <directionalLight position={[-6, 4, 6]} intensity={0.9} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <BottleModel />
          </Float>
          <ContactShadows 
            position={[0, -1.2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
}
