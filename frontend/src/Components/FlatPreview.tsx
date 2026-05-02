import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";

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
    const texture = labelDataUrl
        ? new THREE.TextureLoader().load(labelDataUrl)
        : null;

    if (texture) texture.flipY = false;

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas>
                <ambientLight intensity={1} />

                <Bounds fit clip observe margin={1.2}>
                    <mesh>
                        <planeGeometry args={[width, height]} />
                        <meshBasicMaterial
                            map={texture || undefined}
                            color={!texture ? "gray" : undefined}
                        />
                    </mesh>
                </Bounds>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}