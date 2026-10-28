import React, { useRef } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { makeStyles, shorthands, tokens, Button } from "@fluentui/react-components";

type TextElement = {
    id: string;
    type: "text";
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fill: string;
    fontFamily: string;
};

type RectElement = {
    id: string;
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
};

type ImageElement = {
    id: string;
    type: "image";
    x: number;
    y: number;
    width: number;
    height: number;
    src: string;
    invert: boolean;
    crop: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    fillMode: "stretch" | "fit" | "fill";
    keepAspectRatio: boolean;
};

type LabelElement = TextElement | RectElement | ImageElement;

type LabelEditorProps = {
    width: number;
    height: number;
    onExport: (dataUrl: string) => void;
};

export default function LabelEditor({ width, height, onExport }: LabelEditorProps) {
    const styles = useStyles();
    const stageRef = useRef<any>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [availableWidth, setAvailableWidth] = React.useState(width);

    React.useEffect(() => {
        let frameId = 0;

        const updateAvailableWidth = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(() => {
                const nextWidth = editorRef.current?.clientWidth || width;
                setAvailableWidth((currentWidth) =>
                    Math.abs(currentWidth - nextWidth) > 2 ? nextWidth : currentWidth
                );
            });
        };

        updateAvailableWidth();
        window.addEventListener("resize", updateAvailableWidth);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener("resize", updateAvailableWidth);
        };
    }, [width]);

    const canvasScale = Math.min(1, Math.max(0.5, (availableWidth - 24) / width));
    const displayWidth = Math.round(width * canvasScale);
    const displayHeight = Math.round(height * canvasScale);

    const [elements, setElements] = React.useState<LabelElement[]>(() => [
        {
            id: uuidv4(),
            type: "text",
            x: 20,
            y: 20,
            text: "New Text",
            fontSize: 36,
            fill: "#ff0000",
            fontFamily: "Arial",
        },
        {
            id: uuidv4(),
            type: "rect",
            x: 20,
            y: 70,
            width: 120,
            height: 60,
            fill: "#ddd",
        },
    ]);

    const selectedElement = elements.find((el) => el.id === selectedId);
    const selectedText = selectedElement && selectedElement.type === "text" ? selectedElement : null;
    const selectedImage = selectedElement && selectedElement.type === "image" ? selectedElement : null;

    const deleteElement = (id: string) => {
        setElements((s) => s.filter((el) => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const exportImage = () => {
        if (!stageRef.current) return;

        console.log("🧪 ELEMENTS BEFORE EXPORT:", elements);

        const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });

        console.log("📦 EXPORT LENGTH:", dataURL.length);
        console.log("📦 EXPORT SAMPLE:", dataURL.substring(0, 100));

        setPreviewUrl(dataURL); // 👈 show preview
        onExport(dataURL);
    };

    const handleImageFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => {
                const origWidth = img.naturalWidth;
                const origHeight = img.naturalHeight;
                const maxWidth = width * 0.8; // 80% of canvas width
                const maxHeight = height * 0.8; // 80% of canvas height
                let displayWidth = origWidth;
                let displayHeight = origHeight;

                // Calculate scaled dimensions maintaining aspect ratio
                const aspectRatio = origWidth / origHeight;
                if (displayWidth > maxWidth) {
                    displayWidth = maxWidth;
                    displayHeight = displayWidth / aspectRatio;
                }
                if (displayHeight > maxHeight) {
                    displayHeight = maxHeight;
                    displayWidth = displayHeight * aspectRatio;
                }

                setElements((s) => [
                    ...s,
                    {
                        id: uuidv4(),
                        type: "image",
                        x: (width - displayWidth) / 2, // Center horizontally
                        y: (height - displayHeight) / 2, // Center vertically
                        width: displayWidth,
                        height: displayHeight,
                        src,
                        invert: false,
                        crop: { x: 0, y: 0, width: origWidth, height: origHeight },
                        fillMode: "stretch",
                        keepAspectRatio: true,
                    },
                ]);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };

    function UrlImage({
        src,
        x,
        y,
        width,
        height,
        draggable,
        invert,
        crop,
        isSelected,
        onClick,
        onTap,
        onDragEnd,
        onContextMenu,
        onImageResize,
    }: {
        src: string;
        x: number;
        y: number;
        width: number;
        height: number;
        draggable?: boolean;
        invert: boolean;
        crop: { x: number; y: number; width: number; height: number };
        isSelected: boolean;
        onClick: () => void;
        onTap: () => void;
        onDragEnd: (e: any) => void;
        onContextMenu: (e: any) => void;
        onImageResize: (newWidth: number, newHeight: number, newX: number, newY: number) => void;
    }) {
        const [imageObj, setImageObj] = React.useState<HTMLImageElement | null>(null);
        const groupRef = React.useRef<any>(null);

        React.useEffect(() => {
            const img = new window.Image();
            img.src = src;
            img.crossOrigin = "Anonymous";
            img.onload = () => setImageObj(img);
            return () => {
                setImageObj(null);
            };
        }, [src]);

        const HANDLE_SIZE = 10;

        return (
            <Group
                ref={groupRef}
                x={x}
                y={y}
                draggable={draggable}
                onClick={onClick}
                onTap={onTap}
                onDragEnd={(e) => {
                    onDragEnd(e);
                }}
                onContextMenu={onContextMenu}
            >
                <KonvaImage
                    image={imageObj ?? undefined}
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    crop={crop}
                    filters={invert ? [Konva.Filters.Invert] : []}
                    onContextMenu={onContextMenu}
                />

                {isSelected && (
                    <>
                        {/* Bottom-right corner handle */}
                        <Rect
                            x={width - HANDLE_SIZE}
                            y={height - HANDLE_SIZE}
                            width={HANDLE_SIZE}
                            height={HANDLE_SIZE}
                            fill="#007bff"
                            draggable
                            onContextMenu={onContextMenu}
                            onDragMove={(e) => {
                                const newX = e.target.x();
                                const newY = e.target.y();
                                const newWidth = Math.max(20, newX + HANDLE_SIZE);
                                const newHeight = Math.max(20, newY + HANDLE_SIZE);
                                onImageResize(newWidth, newHeight, x, y);
                            }}
                            cursor="nwse-resize"
                        />

                        {/* Top-left corner handle */}
                        <Rect
                            x={-HANDLE_SIZE / 2}
                            y={-HANDLE_SIZE / 2}
                            width={HANDLE_SIZE}
                            height={HANDLE_SIZE}
                            fill="#007bff"
                            draggable
                            onContextMenu={onContextMenu}
                            onDragMove={(e) => {
                                const deltaX = e.target.x() - (-HANDLE_SIZE / 2);
                                const deltaY = e.target.y() - (-HANDLE_SIZE / 2);
                                const newWidth = Math.max(20, width - deltaX);
                                const newHeight = Math.max(20, height - deltaY);
                                const newX = x + deltaX;
                                const newY = y + deltaY;
                                onImageResize(newWidth, newHeight, newX, newY);
                                e.target.x(-HANDLE_SIZE / 2);
                                e.target.y(-HANDLE_SIZE / 2);
                            }}
                            cursor="nwse-resize"
                        />
                    </>
                )}
            </Group>
        );
    }

    return (
        <div className={styles.container} ref={editorRef}>
            <div className={styles.canvasWrapper} style={{ width: displayWidth, height: displayHeight }}>
                <div className={styles.canvasLabel}>2D Canvas</div>
                <Stage
                    width={width}
                    height={height}
                    ref={stageRef}
                    style={{
                        transform: `scale(${canvasScale})`,
                        transformOrigin: "top left",
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.target.getStage()) {
                            setSelectedId(null);
                        }
                    }}
                    onContextMenu={(e) => {
                        e.evt.preventDefault();
                        if (e.target === e.target.getStage()) {
                            setSelectedId(null);
                        }
                    }}
                >
                    <Layer>
                        {/* RECTANGLES FIRST */}
                        {elements
                            .filter((el) => el.type === "rect")
                            .map((el: any) => (
                                <Rect
                                    key={el.id}
                                    x={el.x}
                                    y={el.y}
                                    width={el.width}
                                    height={el.height}
                                    fill={el.fill}
                                    draggable
                                    onClick={() => setSelectedId(el.id)}
                                    onTap={() => setSelectedId(el.id)}
                                    onContextMenu={(e: any) => {
                                        e.evt.preventDefault();
                                        deleteElement(el.id);
                                    }}
                                    onDragEnd={(e) => {
                                        const newPos = { x: e.target.x(), y: e.target.y() };
                                        setElements((s) =>
                                            s.map((x) => (x.id === el.id ? { ...x, ...newPos } : x))
                                        );
                                    }}
                                />
                            ))}

                        {elements
                            .filter((el) => el.type === "image")
                            .map((el: any) => (
                                <UrlImage
                                    key={el.id}
                                    src={el.src}
                                    x={el.x}
                                    y={el.y}
                                    width={el.width}
                                    height={el.height}
                                    invert={el.invert}
                                    crop={el.crop}
                                    isSelected={el.id === selectedId}
                                    draggable
                                    onClick={() => setSelectedId(el.id)}
                                    onTap={() => setSelectedId(el.id)}
                                    onImageResize={(newWidth, newHeight, newX, newY) => {
                                        setElements((s) =>
                                            s.map((x) =>
                                                x.id === el.id && x.type === "image"
                                                    ? { ...x, x: newX, y: newY, width: newWidth, height: newHeight }
                                                    : x
                                            )
                                        );
                                    }}
                                    onContextMenu={(e: any) => {
                                        e.evt.preventDefault();
                                        deleteElement(el.id);
                                    }}
                                    onDragEnd={(e) => {
                                        setElements((s) =>
                                            s.map((x) =>
                                                x.id === el.id && x.type === "image"
                                                    ? { ...x, x: e.target.x(), y: e.target.y() }
                                                    : x
                                            )
                                        );
                                    }}
                                />
                            ))}

                        {elements
                            .filter((el) => el.type === "text")
                            .map((el: any) => (
                                <Text
                                    key={el.id}
                                    text={el.text}
                                    x={el.x}
                                    y={el.y}
                                    fontSize={el.fontSize}
                                    fontFamily={el.fontFamily}
                                    fill={el.fill}
                                    stroke="black"
                                    strokeWidth={1}
                                    draggable
                                    onClick={() => setSelectedId(el.id)}
                                    onTap={() => setSelectedId(el.id)}
                                    onContextMenu={(e: any) => {
                                        e.evt.preventDefault();
                                        deleteElement(el.id);
                                    }}
                                    onDragEnd={(e) => {
                                        const newPos = { x: e.target.x(), y: e.target.y() };
                                        setElements((s) =>
                                            s.map((x) => (x.id === el.id ? { ...x, ...newPos } : x))
                                        );
                                    }}
                                />
                            ))}
                    </Layer>
                </Stage>
            </div>

            <div className={styles.buttonRow}>
                <Button
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    onClick={() =>
                        setElements((s) => [
                            ...s,
                            {
                                id: uuidv4(),
                                type: "text",
                                x: 50,
                                y: 50,
                                text: "New Text",
                                fontSize: 24,
                                fill: "#ff0000",
                                fontFamily: "Arial",
                            },
                        ])
                    }
                >
                    📝 Add Text
                </Button>

                <Button
                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                    onClick={() =>
                        setElements((s) => [
                            ...s,
                            { id: uuidv4(), type: "rect", x: 10, y: 80, width: 80, height: 40, fill: "#ccc" },
                        ])
                    }
                >
                    🔷 Add Shape
                </Button>

                <Button
                    className={`${styles.actionButton} ${styles.secondaryButton}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    🖼️ Add Image
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageFile}
                />

                <Button
                    className={`${styles.actionButton} ${styles.outlineButton}`}
                    onClick={exportImage}
                >
                    💾 Export Image
                </Button>
            </div>

            {selectedId && (
                <div className={styles.editorPanel}>
                    <div className={styles.panelHeader}>
                        <span className={styles.panelIcon}>
                            {selectedElement?.type === "text" ? "📝" :
                                selectedElement?.type === "image" ? "🖼️" : "🔷"}
                        </span>
                        Edit {selectedElement?.type}
                    </div>
                    <div className={styles.panelDescription}>
                        Right-click on the selected item to delete it. Use the controls below to customize your element.
                    </div>

                    {selectedText && (
                        <>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>📝 Text</label>
                                <input
                                    className={styles.textInput}
                                    type="text"
                                    value={selectedText.text}
                                    onChange={(e) => {
                                        const newText = e.target.value;
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "text" && el.id === selectedId
                                                    ? { ...el, text: newText }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>📏 Font Size</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={8}
                                    value={selectedText.fontSize}
                                    onChange={(e) => {
                                        const size = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "text" && el.id === selectedId
                                                    ? { ...el, fontSize: size }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>🎨 Color</label>
                                <input
                                    className={styles.colorInput}
                                    type="color"
                                    value={selectedText.fill}
                                    onChange={(e) => {
                                        const fill = e.target.value;
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "text" && el.id === selectedId
                                                    ? { ...el, fill }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>🔤 Font Family</label>
                                <select
                                    className={styles.selectInput}
                                    value={selectedText.fontFamily}
                                    onChange={(e) => {
                                        const fontFamily = e.target.value;
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "text" && el.id === selectedId
                                                    ? { ...el, fontFamily }
                                                    : el
                                            )
                                        );
                                    }}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Impact">Impact</option>
                                    <option value="Comic Sans MS">Comic Sans MS</option>
                                </select>
                            </div>
                        </>
                    )}

                    {selectedImage && (
                        <>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>🔄 Invert</label>
                                <input
                                    className={styles.checkboxInput}
                                    type="checkbox"
                                    checked={selectedImage.invert}
                                    onChange={(e) => {
                                        const invert = e.target.checked;
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, invert }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>📐 Fill Mode</label>
                                <select
                                    className={styles.selectInput}
                                    value={selectedImage.fillMode}
                                    onChange={(e) => {
                                        const fillMode = e.target.value as ImageElement["fillMode"];
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, fillMode }
                                                    : el
                                            )
                                        );
                                    }}
                                >
                                    <option value="stretch">Stretch</option>
                                    <option value="fit">Fit</option>
                                    <option value="fill">Fill</option>
                                </select>
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>📏 Keep Aspect Ratio</label>
                                <input
                                    className={styles.checkboxInput}
                                    type="checkbox"
                                    checked={selectedImage.keepAspectRatio}
                                    onChange={(e) => {
                                        const keepAspectRatio = e.target.checked;
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, keepAspectRatio }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>↔️ Width</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={10}
                                    value={selectedImage.width}
                                    onChange={(e) => {
                                        const width = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) => {
                                                if (el.type === "image" && el.id === selectedId) {
                                                    if (el.keepAspectRatio && el.width > 0) {
                                                        const ratio = el.height / el.width;
                                                        return { ...el, width, height: Math.max(10, Math.round(width * ratio)) };
                                                    }
                                                    return { ...el, width };
                                                }
                                                return el;
                                            })
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label className={styles.fieldLabel}>↕️ Height</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={10}
                                    value={selectedImage.height}
                                    onChange={(e) => {
                                        const height = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) => {
                                                if (el.type === "image" && el.id === selectedId) {
                                                    if (el.keepAspectRatio && el.height > 0) {
                                                        const ratio = el.width / el.height;
                                                        return { ...el, height, width: Math.max(10, Math.round(height * ratio)) };
                                                    }
                                                    return { ...el, height };
                                                }
                                                return el;
                                            })
                                        );
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* 🔥 DEBUG IMAGE PREVIEW */}
            {previewUrl && (
                <div style={{ marginTop: 20 }}>
                    <div>🧪 Export Preview:</div>
                    <img
                        src={previewUrl}
                        style={{ width: 300, border: "3px solid red" }}
                    />
                </div>
            )}
        </div>
    );
}

const useStyles = makeStyles({
    container: {
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        ...shorthands.padding("0.75rem"),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(102, 126, 234, 0.15)",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "100%",
        transition: "all 0.3s ease",
        "&:hover": {
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.15), 0 6px 20px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
        },
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
        },
        "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/assets/textures/subtle-dots.svg')",
            opacity: 0.03,
            pointerEvents: "none",
        },
    },
    canvasWrapper: {
        ...shorthands.border("2px", "solid", "rgba(102, 126, 234, 0.3)"),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        maxWidth: "100%",
        marginBottom: "0.5rem",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        marginLeft: "auto",
        marginRight: "auto",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/assets/textures/geometric-pattern.svg') repeat",
            backgroundSize: "40px 40px",
            opacity: 0.04,
            pointerEvents: "none",
        },
        "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, rgba(102,126,234,0.02) 0%, rgba(240,147,251,0.02) 100%)",
            pointerEvents: "none",
        },
    },
    canvasLabel: {
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
    buttonRow: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
        marginBottom: "0.75rem",
        justifyContent: "center",
    },
    actionButton: {
        fontWeight: tokens.fontWeightMedium,
        ...shorthands.padding("0.5rem", "0.875rem"),
        ...shorthands.borderRadius(tokens.borderRadiusSmall),
        transition: "all 0.2s ease",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        border: "none",
        cursor: "pointer",
        fontSize: tokens.fontSizeBase200,
        position: "relative",
        overflow: "hidden",
        minWidth: "auto",
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "left 0.3s",
        },
        "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            "&::before": {
                left: "100%",
            },
        },
        "&:active": {
            transform: "translateY(0px)",
        },
    },
    primaryButton: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
    },
    secondaryButton: {
        background: "white",
        color: "#667eea",
        border: "2px solid #667eea",
    },
    outlineButton: {
        background: "transparent",
        color: "#64748b",
        border: "2px solid #e2e8f0",
    },
    editorPanel: {
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        ...shorthands.padding("1rem"),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        border: "1px solid rgba(102, 126, 234, 0.2)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
            boxShadow: "0 20px 56px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
            transform: "translateY(-1px)",
        },
        "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
            borderRadius: `${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge} 0 0`,
        },
        "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('/assets/textures/subtle-dots.svg')",
            opacity: 0.04,
            pointerEvents: "none",
        },
    },
    panelHeader: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: "#1e293b",
        marginBottom: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    panelIcon: {
        fontSize: "1.25rem",
    },
    panelDescription: {
        fontSize: tokens.fontSizeBase200,
        color: "#64748b",
        marginBottom: "1rem",
    },
    fieldRow: {
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: "1rem",
        alignItems: "center",
        marginBottom: "1.25rem",
        ...shorthands.padding("1rem"),
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)",
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        border: "1px solid rgba(102, 126, 234, 0.08)",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)",
            border: "1px solid rgba(102, 126, 234, 0.15)",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
        },
        "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "4px",
            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
            borderRadius: `${tokens.borderRadiusMedium} 0 0 ${tokens.borderRadiusMedium}`,
        },
    },
    fieldLabel: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightMedium,
        color: "#374151",
    },
    textInput: {
        ...shorthands.padding("0.75rem", "1rem"),
        border: `2px solid #e2e8f0`,
        borderRadius: tokens.borderRadiusMedium,
        width: "100%",
        fontSize: tokens.fontSizeBase300,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
        "&:focus": {
            outline: "none",
            border: "2px solid #667eea",
            boxShadow: "0 0 0 4px rgba(102, 126, 234, 0.1), inset 0 1px 3px rgba(0, 0, 0, 0.1)",
            transform: "scale(1.01)",
            background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        },
        "&:hover": {
            border: "2px solid #cbd5e1",
            boxShadow: "0 0 0 2px rgba(203, 213, 225, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.1)",
        },
    },
    colorInput: {
        width: "4.5rem",
        height: "3rem",
        border: `2px solid #e2e8f0`,
        borderRadius: tokens.borderRadiusMedium,
        padding: "0",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "&:hover": {
            border: "2px solid #667eea",
            transform: "scale(1.05) rotate(2deg)",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.2)",
        },
        "&:active": {
            transform: "scale(0.95) rotate(0deg)",
        },
    },
    checkboxInput: {
        width: "1.5rem",
        height: "1.5rem",
        cursor: "pointer",
        accentColor: "#667eea",
        borderRadius: "4px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
            transform: "scale(1.1)",
            filter: "drop-shadow(0 2px 8px rgba(102, 126, 234, 0.3))",
        },
        "&:checked": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "2px solid #667eea",
        },
    },
    selectInput: {
        ...shorthands.padding("0.75rem", "1rem"),
        border: `2px solid #e2e8f0`,
        borderRadius: tokens.borderRadiusMedium,
        width: "100%",
        fontSize: tokens.fontSizeBase300,
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "&:focus": {
            outline: "none",
            border: "2px solid #667eea",
            boxShadow: "0 0 0 4px rgba(102, 126, 234, 0.1), 0 2px 8px rgba(0, 0, 0, 0.1)",
            transform: "scale(1.01)",
            background: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
        },
        "&:hover": {
            border: "2px solid #cbd5e1",
            boxShadow: "0 0 0 2px rgba(203, 213, 225, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)",
        },
    },
    previewContainer: {
        marginTop: "1.5rem",
        ...shorthands.padding("1rem"),
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        border: "2px solid rgba(102, 126, 234, 0.1)",
    },
    previewTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: "#1e293b",
        marginBottom: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    previewImage: {
        maxWidth: "100%",
        height: "auto",
        ...shorthands.borderRadius(tokens.borderRadiusMedium),
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        border: "2px solid rgba(102, 126, 234, 0.2)",
    },
});
