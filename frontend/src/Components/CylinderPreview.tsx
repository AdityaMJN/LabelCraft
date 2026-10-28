import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useState, useEffect } from "react";

const useStyles = makeStyles({
    container: {
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1)",
        border: `2px solid ${tokens.colorNeutralStroke1}`,
        position: "relative",
        overflow: "hidden",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/assets/textures/subtle-dots.svg')",
            opacity: 0.1,
            pointerEvents: "none",
        },
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        pointerEvents: "none",
        borderRadius: tokens.borderRadiusLarge,
    },
    canvas: {
        borderRadius: tokens.borderRadiusLarge,
        overflow: "hidden",
    },
    label: {
        position: "absolute",
        top: "12px",
        left: "12px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        zIndex: 10,
    },
});

type CylinderPreviewProps = {
    labelDataUrl?: string | null;
    topDiameter: number;
    bottomDiameter?: number;
    height: number;
    jarBodyColor?: string;
    jarLidColor?: string;
};

export default function CylinderPreview({
    labelDataUrl,
    topDiameter,
    bottomDiameter,
    height,
    jarBodyColor = "#e8f4f8",
    jarLidColor = "#2c2c2c",
}: CylinderPreviewProps) {
    const styles = useStyles();
    const topRadius = (topDiameter / 2) || (bottomDiameter ? bottomDiameter / 2 : 50);
    const bottomRadius = (bottomDiameter ? bottomDiameter / 2 : topRadius);

    return (
        <div className={styles.container}>
            <div className={styles.overlay}></div>
            <div className={styles.label}>3D Preview</div>
            <Canvas
                className={styles.canvas}
                camera={{ position: [0, height / 2, Math.max(topRadius, bottomRadius) * 3], fov: 45 }}
            >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
                <directionalLight position={[-5, -5, -5]} intensity={0.3} />
                <pointLight position={[0, height / 2 + 20, 0]} intensity={0.4} />
                <SceneContent
                    labelDataUrl={labelDataUrl}
                    key={`${labelDataUrl}-${jarBodyColor}-${jarLidColor}`}
                    topRadius={topRadius}
                    bottomRadius={bottomRadius}
                    height={height}
                    jarBodyColor={jarBodyColor}
                    jarLidColor={jarLidColor}
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
    jarBodyColor,
    jarLidColor,
}: {
    labelDataUrl?: string | null;
    topRadius: number;
    bottomRadius: number;
    height: number;
    jarBodyColor: string;
    jarLidColor: string;
}) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!labelDataUrl) {
            setTexture(null);
            return;
        }

        const loader = new THREE.TextureLoader();

        loader.load(
            labelDataUrl,
            (tex) => {
                const canvas = document.createElement("canvas");
                canvas.width = tex.image.width;
                canvas.height = tex.image.height;

                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(tex.image, 0, 0);
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
            },
            undefined,
            () => setTexture(null)
        );
    }, [labelDataUrl]);

    const bodyY = -5;

    return (
        <>
            <mesh position={[0, -height / 2 - 8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial color="#e6e6e6" />
            </mesh>

            {texture ? (
                <mesh position={[0, bodyY, 0]}>
                    <cylinderGeometry args={[topRadius, bottomRadius, height, 128, 1, true]} />
                    <meshStandardMaterial
                        map={texture}
                        color={jarBodyColor}
                        side={THREE.FrontSide}
                        roughness={0.5}
                        metalness={0.1}
                    />
                </mesh>
            ) : (
                <mesh position={[0, bodyY, 0]}>
                    <cylinderGeometry args={[topRadius, bottomRadius, height, 64, 1, false]} />
                    <meshStandardMaterial
                        color={jarBodyColor}
                        roughness={0.6}
                        metalness={0.1}
                    />
                </mesh>
            )}

            {/* Top and bottom closure discs */}
            <mesh position={[0, bodyY + height / 2, 0]}>
                <cylinderGeometry args={[topRadius * 0.995, topRadius * 0.995, 1.8, 96]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.5} metalness={0.1} />
            </mesh>
            <mesh position={[0, bodyY - height / 2, 0]}>
                <cylinderGeometry args={[bottomRadius * 0.995, bottomRadius * 0.995, 1.8, 96]} />
                <meshStandardMaterial color="#dadada" roughness={0.5} metalness={0.1} />
            </mesh>

            {/* Jar lid */}
            <mesh position={[0, height / 2 + 6, 0]}>
                <cylinderGeometry args={[topRadius * 1.02, topRadius * 1.02, 12, 64]} />
                <meshStandardMaterial
                    color={jarLidColor}
                    metalness={0.7}
                    roughness={0.25}
                />
            </mesh>

            {/* Lid edge detail */}
            <mesh position={[0, height / 2 + 12, 0]}>
                <cylinderGeometry args={[topRadius * 1.05, topRadius * 1.05, 4, 64]} />
                <meshStandardMaterial
                    color={jarLidColor}
                    metalness={0.85}
                    roughness={0.2}
                />
            </mesh>

            {/* Label edge guide rings */}
            <mesh position={[0, bodyY + height / 2 - 4, 0]}>
                <torusGeometry args={[topRadius * 1.002, 0.9, 16, 96]} />
                <meshStandardMaterial color="#cfd4d8" roughness={0.4} metalness={0.25} />
            </mesh>
            <mesh position={[0, bodyY - height / 2 + 4, 0]}>
                <torusGeometry args={[bottomRadius * 1.002, 0.9, 16, 96]} />
                <meshStandardMaterial color="#cfd4d8" roughness={0.4} metalness={0.25} />
            </mesh>

            {/* Bottom rim */}
            <mesh position={[0, -height / 2 - 3, 0]}>
                <cylinderGeometry args={[bottomRadius * 1.05, bottomRadius * 1.05, 6, 64]} />
                <meshStandardMaterial
                    color="#dddddd"
                    roughness={0.3}
                    metalness={0.2}
                />
            </mesh>
        </>
    );
}
