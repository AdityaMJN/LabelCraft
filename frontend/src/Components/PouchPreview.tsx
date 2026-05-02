import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds } from "@react-three/drei";

type Props = {
    labelDataUrl?: string | null;
    width?: number;
    height?: number;
    depth?: number;
};

export default function PouchPreview({
    labelDataUrl,
    width = 150,
    height = 200,
    depth = 20,
}: Props) {
    const texture = labelDataUrl
        ? new THREE.TextureLoader().load(labelDataUrl)
        : null;

    if (texture) texture.flipY = false;

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas>
                <ambientLight intensity={0.9} />
                <directionalLight position={[5, 5, 5]} />

                <Bounds fit clip observe margin={1.2}>
                    <>
                        {/* 🔥 MAIN BODY (slightly rounded edges) */}
                        <mesh>
                            <boxGeometry args={[width, height, depth]} />
                            <meshStandardMaterial
                                map={texture || undefined}
                                color={!texture ? "#e6c9a8" : undefined}
                            />
                        </mesh>

                        {/* 🔥 TOP SEAL */}
                        <mesh position={[0, height / 2 + 5, 0]}>
                            <boxGeometry args={[width, 10, depth]} />
                            <meshStandardMaterial color="#d4a373" />
                        </mesh>

                        {/* 🔥 BOTTOM GUSSET (small extrusion) */}
                        <mesh position={[0, -height / 2 - 5, depth / 2]}>
                            <boxGeometry args={[width * 0.9, 10, depth]} />
                            <meshStandardMaterial color="#c69c72" />
                        </mesh>
                    </>
                </Bounds>

                <OrbitControls makeDefault />
            </Canvas>
        </div>
    );
}