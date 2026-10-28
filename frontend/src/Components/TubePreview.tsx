import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";

type Props = {
    labelDataUrl?: string | null;
    radius?: number;
    height?: number;
};

export default function TubePreview({
    labelDataUrl,
    radius = 60,
    height = 200,
}: Props) {
    const texture = useMemo(() => {
        if (!labelDataUrl) return null;
        const loaded = new THREE.TextureLoader().load(labelDataUrl);
        loaded.flipY = false;
        loaded.colorSpace = THREE.SRGBColorSpace;
        return loaded;
    }, [labelDataUrl]);

    const bodyTopRadius = radius * 0.92;
    const bodyBottomRadius = radius * 0.74;
    const bodyHeight = height * 0.68;
    const shoulderHeight = Math.max(18, height * 0.12);
    const neckRadius = radius * 0.24;
    const neckHeight = Math.max(12, height * 0.08);
    const capRadius = radius * 0.31;
    const capHeight = Math.max(22, height * 0.16);
    const bodyCenterY = capHeight + neckHeight + shoulderHeight + bodyHeight / 2 - height / 2;
    const shoulderCenterY = capHeight + neckHeight + shoulderHeight / 2 - height / 2;
    const neckCenterY = capHeight + neckHeight / 2 - height / 2;
    const capCenterY = capHeight / 2 - height / 2;

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas camera={{ position: [0, height * 0.15, height * 2.1], fov: 34 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 6, 5]} intensity={0.9} castShadow />
                <directionalLight position={[-3, -3, -3]} intensity={0.3} />
                <pointLight position={[0, height / 2 + 30, 0]} intensity={0.4} />

                <group rotation={[0.08, 0.24, 0]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 6, 0]}>
                        <planeGeometry args={[radius * 5, radius * 5]} />
                        <meshStandardMaterial color="#e8e5dd" roughness={1} />
                    </mesh>

                    {/* Flattened squeeze body */}
                    <mesh position={[0, bodyCenterY, 0]} scale={[1, 1, 0.62]}>
                        <cylinderGeometry args={[bodyTopRadius, bodyBottomRadius, bodyHeight, 96]} />
                        <meshStandardMaterial
                            map={texture || undefined}
                            color={!texture ? "#f8f6f0" : undefined}
                            roughness={0.58}
                            metalness={0.0}
                        />
                    </mesh>

                    {/* Shoulder transition */}
                    <mesh position={[0, shoulderCenterY, 0]} scale={[1, 1, 0.6]}>
                        <cylinderGeometry args={[bodyBottomRadius, neckRadius, shoulderHeight, 64]} />
                        <meshStandardMaterial
                            color="#f0ede8"
                            roughness={0.7}
                            metalness={0.0}
                        />
                    </mesh>

                    {/* Neck/nozzle */}
                    <mesh position={[0, neckCenterY, 0]}>
                        <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 48]} />
                        <meshStandardMaterial
                            color="#e8e4dc"
                            roughness={0.55}
                            metalness={0.05}
                        />
                    </mesh>

                    {/* Cap */}
                    <mesh position={[0, capCenterY, 0]}>
                        <cylinderGeometry args={[capRadius, capRadius, capHeight, 48]} />
                        <meshStandardMaterial
                            color="#2c2c2c"
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>

                    <mesh position={[0, capCenterY + capHeight * 0.26, 0]}>
                        <cylinderGeometry args={[capRadius * 1.05, capRadius * 1.05, 8, 48]} />
                        <meshStandardMaterial
                            color="#1a1a1a"
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </mesh>

                    {/* Crimped seam at the closed end */}
                    <mesh position={[0, bodyCenterY + bodyHeight / 2 + 3, 0]}>
                        <boxGeometry args={[bodyTopRadius * 1.75, 8, bodyTopRadius * 0.16]} />
                        <meshStandardMaterial
                            color="#e5e1d8"
                            roughness={0.65}
                            metalness={0.05}
                        />
                    </mesh>
                    <mesh position={[0, bodyCenterY + bodyHeight / 2 + 7, 0]}>
                        <boxGeometry args={[bodyTopRadius * 1.65, 2, bodyTopRadius * 0.14]} />
                        <meshStandardMaterial color="#d8d2c8" roughness={0.75} metalness={0} />
                    </mesh>
                </group>

                <OrbitControls makeDefault target={[0, bodyCenterY * 0.2, 0]} />
            </Canvas>
        </div>
    );
}
