import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, RoundedBox } from "@react-three/drei";
import { useMemo } from "react";

type Props = {
    labelDataUrl?: string | null;
    width?: number;
    height?: number;
    depth?: number;
    pouchBodyColor?: string;
    pouchSealColor?: string;
};

export default function PouchPreview({
    labelDataUrl,
    width = 150,
    height = 200,
    depth = 20,
    pouchBodyColor = "#f5f1e8",
    pouchSealColor = "#e8d5b7",
}: Props) {
    const texture = useMemo(() => {
        if (!labelDataUrl) return null;
        const loadedTexture = new THREE.TextureLoader().load(labelDataUrl);
        loadedTexture.flipY = false;
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        return loadedTexture;
    }, [labelDataUrl]);

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas key={`${pouchBodyColor}-${pouchSealColor}`}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
                <directionalLight position={[-3, -3, -3]} intensity={0.4} />
                <pointLight position={[0, height / 2 + 50, 0]} intensity={0.3} />

                <Bounds fit clip observe margin={1.2}>
                    <>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 10, 0]}>
                            <planeGeometry args={[width * 2.4, width * 2.4]} />
                            <meshStandardMaterial color="#ebe7de" roughness={1} />
                        </mesh>

                        {/* Main pouch body */}
                        <RoundedBox
                            args={[width, height, Math.max(8, depth * 0.75)]}
                            radius={Math.max(2, Math.min(width, height) * 0.045)}
                            smoothness={5}
                        >
                            <meshStandardMaterial
                                color={pouchBodyColor}
                                roughness={0.76}
                                metalness={0.02}
                            />
                        </RoundedBox>

                        {/* Front print panel */}
                        <mesh position={[0, 0, depth * 0.38 + 0.2]}>
                            <planeGeometry args={[width * 0.92, height * 0.86]} />
                            <meshStandardMaterial
                                map={texture || undefined}
                                color={!texture ? "#f8f3e9" : undefined}
                                roughness={0.45}
                                metalness={0.0}
                            />
                        </mesh>

                        {/* Top heat seal */}
                        <mesh position={[0, height / 2 + 6, 0]}>
                            <boxGeometry args={[width * 0.98, 12, Math.max(6, depth * 0.7)]} />
                            <meshStandardMaterial
                                color={pouchSealColor}
                                metalness={0.2}
                                roughness={0.72}
                            />
                        </mesh>
                        <mesh position={[0, height / 2 + 11, 0]}>
                            <boxGeometry args={[width * 0.92, 1.4, Math.max(6, depth * 0.62)]} />
                            <meshStandardMaterial color="#d8c6ab" roughness={0.95} metalness={0} />
                        </mesh>

                        {/* Bottom gusset so pouch can stand */}
                        <mesh position={[0, -height / 2 - 5, depth * 0.1]}>
                            <boxGeometry args={[width * 0.88, 10, Math.max(8, depth * 0.95)]} />
                            <meshStandardMaterial
                                color={pouchSealColor}
                                roughness={0.9}
                                metalness={0.0}
                            />
                        </mesh>

                        {/* Side gusset folds */}
                        <mesh position={[width / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <boxGeometry args={[depth * 0.7, height * 0.9, 6]} />
                            <meshStandardMaterial
                                color={pouchBodyColor}
                                roughness={0.85}
                                metalness={0.0}
                            />
                        </mesh>
                        <mesh position={[-width / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <boxGeometry args={[depth * 0.7, height * 0.9, 6]} />
                            <meshStandardMaterial
                                color={pouchBodyColor}
                                roughness={0.85}
                                metalness={0.0}
                            />
                        </mesh>
                    </>
                </Bounds>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}
