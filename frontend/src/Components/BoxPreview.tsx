import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";
import { useMemo } from "react";

type Props = {
    labelDataUrl?: string | null;
    width?: number;
    height?: number;
    depth?: number;
};

export default function BoxPreview({
    labelDataUrl,
    width = 150,
    height = 200,
    depth = 80,
}: Props) {
    const texture = useMemo(() => {
        if (!labelDataUrl) return null;
        const loaded = new THREE.TextureLoader().load(labelDataUrl);
        loaded.flipY = false;
        loaded.colorSpace = THREE.SRGBColorSpace;
        return loaded;
    }, [labelDataUrl]);

    const wallThickness = Math.max(2, Math.min(width, depth) * 0.04);
    const flapThickness = Math.max(1.2, wallThickness * 0.65);
    const flapLengthDepth = Math.max(depth * 0.46, 12);
    const flapLengthWidth = Math.max(width * 0.35, 12);
    const flapOpenAngle = Math.PI * 0.42;

    return (
        <div style={{ width: "100%", height: "400px", position: "relative" }}>
            <Canvas style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 7, 6]} intensity={1} castShadow />
                <directionalLight position={[-3, -3, -3]} intensity={0.4} />
                <pointLight position={[0, height / 2 + 60, 0]} intensity={0.35} />

                <Bounds fit clip observe margin={1.2}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 16, 0]}>
                        <planeGeometry args={[Math.max(width, depth) * 2.6, Math.max(width, depth) * 2.6]} />
                        <meshStandardMaterial
                            color="#ece7db"
                            roughness={1}
                        />
                    </mesh>

                    <group>
                        {/* Carton base */}
                        <mesh position={[0, -height / 2 + wallThickness / 2, 0]}>
                            <boxGeometry args={[width, wallThickness, depth]} />
                            <meshStandardMaterial color="#d7c49f" roughness={0.95} metalness={0} />
                        </mesh>

                        {/* Front wall with label */}
                        <mesh position={[0, 0, depth / 2 - wallThickness / 2]}>
                            <boxGeometry args={[width, height, wallThickness]} />
                            <meshStandardMaterial
                                map={texture || undefined}
                                color={!texture ? "#f6e9d2" : undefined}
                                roughness={0.86}
                                metalness={0}
                            />
                        </mesh>

                        {/* Back wall */}
                        <mesh position={[0, 0, -depth / 2 + wallThickness / 2]}>
                            <boxGeometry args={[width, height, wallThickness]} />
                            <meshStandardMaterial color="#ecd8b8" roughness={0.9} metalness={0} />
                        </mesh>

                        {/* Side walls */}
                        <mesh position={[width / 2 - wallThickness / 2, 0, 0]}>
                            <boxGeometry args={[wallThickness, height, depth - wallThickness * 2]} />
                            <meshStandardMaterial color="#ead4b2" roughness={0.88} metalness={0} />
                        </mesh>
                        <mesh position={[-width / 2 + wallThickness / 2, 0, 0]}>
                            <boxGeometry args={[wallThickness, height, depth - wallThickness * 2]} />
                            <meshStandardMaterial color="#ead4b2" roughness={0.88} metalness={0} />
                        </mesh>

                        {/* Top flaps (open carton) */}
                        <mesh
                            position={[0, height / 2 - flapThickness / 2, depth / 2 - flapLengthDepth / 2]}
                            rotation={[-flapOpenAngle, 0, 0]}
                        >
                            <boxGeometry args={[width - wallThickness * 2, flapThickness, flapLengthDepth]} />
                            <meshStandardMaterial color="#eddcc0" roughness={0.92} metalness={0} />
                        </mesh>
                        <mesh
                            position={[0, height / 2 - flapThickness / 2, -depth / 2 + flapLengthDepth / 2]}
                            rotation={[flapOpenAngle, 0, 0]}
                        >
                            <boxGeometry args={[width - wallThickness * 2, flapThickness, flapLengthDepth]} />
                            <meshStandardMaterial color="#eddcc0" roughness={0.92} metalness={0} />
                        </mesh>
                        <mesh
                            position={[width / 2 - flapLengthWidth / 2, height / 2 - flapThickness / 2, 0]}
                            rotation={[0, 0, flapOpenAngle * 0.75]}
                        >
                            <boxGeometry args={[flapLengthWidth, flapThickness, depth - wallThickness * 2]} />
                            <meshStandardMaterial color="#ecd7b7" roughness={0.92} metalness={0} />
                        </mesh>
                        <mesh
                            position={[-width / 2 + flapLengthWidth / 2, height / 2 - flapThickness / 2, 0]}
                            rotation={[0, 0, -flapOpenAngle * 0.75]}
                        >
                            <boxGeometry args={[flapLengthWidth, flapThickness, depth - wallThickness * 2]} />
                            <meshStandardMaterial color="#ecd7b7" roughness={0.92} metalness={0} />
                        </mesh>
                    </group>
                </Bounds>

                <OrbitControls makeDefault target={[0, height * 0.1, 0]} />
            </Canvas>
        </div>
    );
}