import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, RoundedBox } from "@react-three/drei";
import { useMemo } from "react";

type Props = {
    labelDataUrl?: string | null;
    width?: number;
    height?: number;
};

export default function FlatPreview({
    labelDataUrl,
    width = 200,
    height = 100,
}: Props) {
    const texture = useMemo(() => {
        if (!labelDataUrl) return null;
        const loaded = new THREE.TextureLoader().load(labelDataUrl);
        loaded.flipY = false;
        loaded.colorSpace = THREE.SRGBColorSpace;
        return loaded;
    }, [labelDataUrl]);

    const substrateThickness = Math.max(1, Math.min(width, height) * 0.02);

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas>
                <ambientLight intensity={0.7} />
                <directionalLight position={[3, 6, 5]} intensity={0.8} />
                <directionalLight position={[-3, -3, -3]} intensity={0.25} />

                <Bounds fit clip observe margin={1.2}>
                    <group rotation={[-Math.PI * 0.04, Math.PI * 0.08, 0]}>
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -substrateThickness * 1.5, 0]}>
                            <planeGeometry args={[width * 1.6, height * 1.6]} />
                            <meshStandardMaterial color="#ece8e0" roughness={1} />
                        </mesh>

                        <RoundedBox
                            args={[width, height, substrateThickness]}
                            radius={Math.max(1, Math.min(width, height) * 0.015)}
                            smoothness={4}
                        >
                            <meshStandardMaterial color="#f8f6f2" roughness={0.7} metalness={0} />
                        </RoundedBox>

                        <mesh position={[0, 0, substrateThickness / 2 + 0.2]}>
                            <planeGeometry args={[width * 0.98, height * 0.98]} />
                            <meshStandardMaterial
                                map={texture || undefined}
                                color={!texture ? "#fbfaf8" : undefined}
                                roughness={0.32}
                                metalness={0.02}
                            />
                        </mesh>
                    </group>
                </Bounds>

                <OrbitControls makeDefault target={[0, 0, 0]} />
            </Canvas>
        </div>
    );
}