import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, MeshDistortMaterial, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CoreSceneProps {
    heat: number; // 0 (Safe) to 1 (Meltdown)
}

function AnimatedCore({ heat }: CoreSceneProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    
    // Smoothly transition colors from Cyan to Neon Red
    const color = useMemo(() => {
        const cyan = new THREE.Color('#00E5FF');
        const red = new THREE.Color('#FF0033');
        return cyan.lerp(red, heat);
    }, [heat]);

    useFrame((state) => {
        if (!meshRef.current) return;
        
        // Base Rotation
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
        
        // Heartbeat pulse based on heat
        const pulse = 1 + (Math.sin(state.clock.elapsedTime * (2 + heat * 5)) * (0.05 + heat * 0.1));
        meshRef.current.scale.set(pulse, pulse, pulse);
    });

    return (
        <group>
            {/* Outer Wireframe */}
            <Icosahedron ref={meshRef} args={[1, 1]}>
                <meshBasicMaterial 
                    color={color} 
                    wireframe 
                    transparent 
                    opacity={0.8} 
                />
            </Icosahedron>

            {/* Inner Glow / Core */}
            <Icosahedron args={[0.5, 2]}>
                <MeshDistortMaterial
                    color={color}
                    speed={2 + heat * 3}
                    distort={0.4 + heat * 0.4}
                    transparent
                    opacity={0.4}
                />
            </Icosahedron>

            {/* Ambient Point Light */}
            <pointLight position={[2, 2, 2]} color={color} intensity={1.5} />
        </group>
    );
}

export default function CoreThree({ heat }: CoreSceneProps) {
    return (
        <div className="w-full h-full min-h-[300px] relative pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                <ambientLight intensity={0.2} />
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <AnimatedCore heat={heat} />
                </Float>
            </Canvas>
            
            {/* Retro Grid Background Overflow Effect */}
            <div className="absolute inset-0 z-[-1] opacity-20" style={{
                backgroundImage: `linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)'
            }} />
        </div>
    );
}
