import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";

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
    const texture = labelDataUrl
        ? new THREE.TextureLoader().load(labelDataUrl)
        : null;

    if (texture) texture.flipY = false;

    return (
        <div style={{ width: "100%", height: "400px", position: "relative" }}>
            <Canvas style={{ width: "100%", height: "100%" }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} />

                <Bounds fit clip observe margin={1.2}>
                    <mesh>
                        <boxGeometry args={[width, height, depth]} />
                        <meshStandardMaterial
                            map={texture || undefined}
                            color={!texture ? "#ccc" : undefined}
                        />
                    </mesh>
                </Bounds>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}