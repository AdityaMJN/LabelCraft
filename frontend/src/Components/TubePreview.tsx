import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";

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
    const texture = labelDataUrl
        ? new THREE.TextureLoader().load(labelDataUrl)
        : null;

    if (texture) texture.flipY = false;

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas>
                <ambientLight intensity={0.8} />

                <Bounds fit clip observe margin={1.2}>
                    <>
                        {/* Body */}
                        <mesh>
                            <cylinderGeometry args={[radius, radius * 0.85, height, 64]} />
                            <meshStandardMaterial
                                map={texture || undefined}
                                color={!texture ? "#ddd" : undefined}
                            />
                        </mesh>

                        {/* Cap */}
                        <mesh position={[0, -height / 2 - 20, 0]}>
                            <cylinderGeometry args={[radius * 0.9, radius * 0.9, 40, 32]} />
                            <meshStandardMaterial color="#444" />
                        </mesh>
                    </>
                </Bounds>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}