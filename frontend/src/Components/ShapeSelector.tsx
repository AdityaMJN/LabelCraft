import { useEffect, useState } from "react";
import { fetchShapes } from "../api/shapes";
import type { Shape } from "../api/shapes";

type Props = {
    onSelect: (shape: Shape) => void;
};

export default function ShapeSelector({ onSelect }: Props) {
    const [shapes, setShapes] = useState<Shape[]>([]);

    useEffect(() => {
        fetchShapes().then((data) => {
            // ✅ Deduplicate by type
            const unique = Array.from(
                new Map(data.map((s) => [s.type, s])).values()
            );
            setShapes(unique);
        });
    }, []);

    return (
        <div style={{ padding: 10 }}>
            <h3>Select Shape</h3>

            {shapes.map((shape) => (
                <button
                    key={shape.type} // ✅ stable key (not index)
                    onClick={() => onSelect(shape)}
                    style={{
                        marginRight: 10,
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                    }}
                >
                    {shape.type}
                </button>
            ))}
        </div>
    );
}