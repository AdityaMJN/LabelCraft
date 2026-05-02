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
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

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
        <div className={styles.container}>
            <div className={styles.canvasWrapper} style={{ width, height }}>
                <Stage
                    width={width}
                    height={height}
                    ref={stageRef}
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
                    appearance="primary"
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
                    Add Text
                </Button>

                <Button
                    appearance="secondary"
                    onClick={() =>
                        setElements((s) => [
                            ...s,
                            { id: uuidv4(), type: "rect", x: 10, y: 80, width: 80, height: 40, fill: "#ccc" },
                        ])
                    }
                >
                    Add Shape
                </Button>

                <Button
                    appearance="secondary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Add Image
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageFile}
                />

                <Button appearance="outline" onClick={exportImage}>
                    Export Image
                </Button>
            </div>

            {selectedId && (
                <div className={styles.editorPanel}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                        Edit selected {selectedElement?.type}
                    </div>
                    <div style={{ marginBottom: 8, color: tokens.colorNeutralForeground3 }}>
                        Right-click on the selected item to delete it.
                    </div>

                    {selectedText && (
                        <>
                            <div className={styles.fieldRow}>
                                <label>Text</label>
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
                                <label>Font size</label>
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
                                <label>Color</label>
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
                                <label>Font family</label>
                                <select
                                    className={styles.textInput}
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
                                </select>
                            </div>
                        </>
                    )}

                    {selectedImage && (
                        <>
                            <div className={styles.fieldRow}>
                                <label>Invert</label>
                                <input
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
                                <label>Fill mode</label>
                                <select
                                    className={styles.textInput}
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
                                <label>Keep aspect ratio</label>
                                <input
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
                                <label>Width</label>
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
                                <label>Height</label>
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
                            <div className={styles.fieldRow}>
                                <label>Crop X</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={0}
                                    value={selectedImage.crop.x}
                                    onChange={(e) => {
                                        const x = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, crop: { ...el.crop, x } }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label>Crop Y</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={0}
                                    value={selectedImage.crop.y}
                                    onChange={(e) => {
                                        const y = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, crop: { ...el.crop, y } }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label>Crop width</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={1}
                                    value={selectedImage.crop.width}
                                    onChange={(e) => {
                                        const width = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, crop: { ...el.crop, width } }
                                                    : el
                                            )
                                        );
                                    }}
                                />
                            </div>
                            <div className={styles.fieldRow}>
                                <label>Crop height</label>
                                <input
                                    className={styles.textInput}
                                    type="number"
                                    min={1}
                                    value={selectedImage.crop.height}
                                    onChange={(e) => {
                                        const height = Number(e.target.value);
                                        setElements((s) =>
                                            s.map((el) =>
                                                el.type === "image" && el.id === selectedId
                                                    ? { ...el, crop: { ...el.crop, height } }
                                                    : el
                                            )
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
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.padding("1rem"),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        boxShadow: tokens.shadow4,
    },
    canvasWrapper: {
        ...shorthands.border("1px", "solid", tokens.colorNeutralStroke1),
        width: "100%",
        height: "auto",
        marginBottom: "1rem",
    },
    buttonRow: {
        display: "flex",
        gap: "0.5rem",
    },
    editorPanel: {
        marginTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    fieldRow: {
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "0.5rem",
        alignItems: "center",
    },
    textInput: {
        padding: "0.5rem",
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        width: "100%",
        fontSize: "1rem",
    },
    colorInput: {
        width: "4rem",
        height: "2rem",
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: "0",
    },
});