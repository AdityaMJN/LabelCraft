import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useState, useEffect } from "react";

const useStyles = makeStyles({
    container: {
        width: "100%",
        height: "400px",
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow2,
    },
});

type CylinderPreviewProps = {
    labelDataUrl?: string | null;
    topDiameter: number;
    bottomDiameter?: number;
    height: number;
};

export default function CylinderPreview({
    labelDataUrl,
    topDiameter,
    bottomDiameter,
    height,
}: CylinderPreviewProps) {
    const styles = useStyles();
    const topRadius = (topDiameter / 2) || (bottomDiameter ? bottomDiameter / 2 : 50);
    const bottomRadius = (bottomDiameter ? bottomDiameter / 2 : topRadius);

    return (
        <div className={styles.container}>
            <Canvas camera={{ position: [0, height / 2, Math.max(topRadius, bottomRadius) * 3], fov: 45 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={0.6} />
                <SceneContent
                    labelDataUrl={labelDataUrl}
                    key={labelDataUrl}
                    topRadius={topRadius}
                    bottomRadius={bottomRadius}
                    height={height}
                />
                <OrbitControls />
            </Canvas>
        </div>
    );
}

function SceneContent({
    labelDataUrl,
    topRadius,
    bottomRadius,
    height,
}: {
    labelDataUrl?: string | null;
    topRadius: number;
    bottomRadius: number;
    height: number;
}) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!labelDataUrl) {
            console.log("❌ No labelDataUrl");
            setTexture(null);
            return;
        }

        console.log("🔄 Loading texture...");

        const loader = new THREE.TextureLoader();

        loader.load(
            labelDataUrl,
            (tex) => {
                console.log("✅ Texture LOADED");
                console.log("Image size:", tex.image.width, tex.image.height);
                const canvas = document.createElement("canvas");
                canvas.width = tex.image.width;
                canvas.height = tex.image.height;

                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(tex.image, 0, 0);

                const sample = ctx.getImageData(0, 0, 50, 50).data;

                let hasNonWhite = false;
                for (let i = 0; i < sample.length; i += 4) {
                    const r = sample[i];
                    const g = sample[i + 1];
                    const b = sample[i + 2];

                    if (!(r === 255 && g === 255 && b === 255)) {
                        hasNonWhite = true;
                        break;
                    }
                }

                console.log("🧪 Image has non-white pixels:", hasNonWhite);
                const fixedTex = new THREE.CanvasTexture(canvas);
                fixedTex.flipY = true;
                fixedTex.wrapS = THREE.RepeatWrapping;
                fixedTex.repeat.x = -1;
                fixedTex.offset.x = 1;
                fixedTex.minFilter = THREE.LinearFilter;
                fixedTex.generateMipmaps = false;
                fixedTex.colorSpace = THREE.SRGBColorSpace;
                fixedTex.needsUpdate = true;

                setTexture(fixedTex);
                tex.generateMipmaps = false;
                tex.colorSpace = THREE.SRGBColorSpace;

                setTexture(tex);
            },
            undefined,
            (err) => {
                console.error("❌ Texture failed:", err);
            }
        );
    }, [labelDataUrl]);

    console.log("🎯 Current texture state:", texture);

    return (
        <>
            <mesh position={[0, -height / 2 - 5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#e6e6e6" />
            </mesh>

            {texture ? (
                // ✅ FIX: removed rotation={[0, Math.PI, 0]}
                <mesh>
                    <cylinderGeometry args={[topRadius, bottomRadius, height, 128, 1, true]} />
                    <meshBasicMaterial map={texture} side={THREE.FrontSide} />
                </mesh>
            ) : (
                <mesh>
                    <cylinderGeometry args={[topRadius, bottomRadius, height, 32, 1, false]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            )}
        </>
    );
}