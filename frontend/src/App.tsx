// src/App.tsx
import { useState, useEffect } from "react";
import LabelEditor from "./Components/LabelEditor";
import CylinderPreview from "./Components/CylinderPreview";
import BoxPreview from "./Components/BoxPreview";
import FlatPreview from "./Components/FlatPreview";
import TubePreview from "./Components/TubePreview";
import PouchPreview from "./Components/PouchPreview";
import { makeStyles, tokens } from "@fluentui/react-components";

type Shape =
  | {
    type: "cylinder";
    params: {
      top_diameter: number;
      bottom_diameter: number;
      height: number;
    };
  }
  | {
    type: "box";
    params: { width: number; height: number; depth: number };
  }
  | {
    type: "flat";
    params: { width: number; height: number };
  }
  | { type: "tube" }
  | { type: "pouch" };

function App() {
  const [labelImage, setLabelImage] = useState<string | null>(null);
  const styles = useStyles();

  const [topDiameter, setTopDiameter] = useState(80);
  const [bottomDiameter, setBottomDiameter] = useState<number | undefined>(80);
  const [height, setHeight] = useState(120);

  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState("cylinder");

  const [boxWidth, setBoxWidth] = useState(100);
  const [boxHeight, setBoxHeight] = useState(150);
  const [boxDepth, setBoxDepth] = useState(80);

  const [flatWidth, setFlatWidth] = useState(150);
  const [flatHeight, setFlatHeight] = useState(100);

  const [tubeRadius, setTubeRadius] = useState(50);
  const [tubeHeight, setTubeHeight] = useState(200);

  const [pouchWidth, setPouchWidth] = useState(150);
  const [pouchHeight, setPouchHeight] = useState(200);

  useEffect(() => {
    fetch("http://localhost:8000/shapes")
      .then((res) => res.json())
      .then((data) => setShapes(data))
      .catch(console.error);
  }, []);

  const handleShapeSelect = (shape: Shape) => {
    setSelectedShape(shape.type);

    if (shape.type === "cylinder" && "params" in shape) {
      setTopDiameter(shape.params.top_diameter);
      setBottomDiameter(shape.params.bottom_diameter);
      setHeight(shape.params.height);
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.headerLabel}>
        <h1>LabelCraft</h1>
      </div>

      <div className={styles.canvascontainer}>
        {/* 2D */}
        <div className={styles.twoDCanvascontainer}>
          <div className={styles.headerLabel}>
            <h2>2D Label Editor</h2>
          </div>

          <LabelEditor
            width={600}
            height={300}
            onExport={setLabelImage}
          />
        </div>

        {/* 3D */}
        <div className={styles.threeDCanvascontainer}>
          <div className={styles.headerLabel}>
            <h2>3D Preview</h2>
          </div>

          {/* ✅ FIXED SELECTOR (NO DUPLICATES) */}
          <div style={{ marginBottom: 10 }}>
            {Array.from(
              new Map(shapes.map((s) => [s.type, s])).values()
            ).map((shape: any) => (
              <button
                key={shape.type}
                onClick={() => handleShapeSelect(shape)}
                style={{
                  marginRight: 10,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  backgroundColor:
                    selectedShape === shape.type ? "#0078D4" : "#f3f3f3",
                  color:
                    selectedShape === shape.type ? "white" : "black",
                }}
              >
                {shape.type}
              </button>
            ))}
          </div>

          {/* ✅ INPUTS WITH LABELS */}

          {selectedShape === "cylinder" && (
            <div className={styles.inputEditor}>
              <label>
                Top Diameter:
                <input value={topDiameter} onChange={(e) => setTopDiameter(+e.target.value)} />
              </label>
              <label>
                Bottom Diameter:
                <input value={bottomDiameter ?? ""} onChange={(e) => setBottomDiameter(+e.target.value)} />
              </label>
              <label>
                Height:
                <input value={height} onChange={(e) => setHeight(+e.target.value)} />
              </label>
            </div>
          )}

          {selectedShape === "box" && (
            <div className={styles.inputEditor}>
              <label>
                Width:
                <input value={boxWidth} onChange={(e) => setBoxWidth(+e.target.value)} />
              </label>
              <label>
                Height:
                <input value={boxHeight} onChange={(e) => setBoxHeight(+e.target.value)} />
              </label>
              <label>
                Depth:
                <input value={boxDepth} onChange={(e) => setBoxDepth(+e.target.value)} />
              </label>
            </div>
          )}

          {selectedShape === "flat" && (
            <div className={styles.inputEditor}>
              <label>
                Width:
                <input value={flatWidth} onChange={(e) => setFlatWidth(+e.target.value)} />
              </label>
              <label>
                Height:
                <input value={flatHeight} onChange={(e) => setFlatHeight(+e.target.value)} />
              </label>
            </div>
          )}

          {selectedShape === "tube" && (
            <div className={styles.inputEditor}>
              <label>
                Radius:
                <input value={tubeRadius} onChange={(e) => setTubeRadius(+e.target.value)} />
              </label>
              <label>
                Height:
                <input value={tubeHeight} onChange={(e) => setTubeHeight(+e.target.value)} />
              </label>
            </div>
          )}

          {selectedShape === "pouch" && (
            <div className={styles.inputEditor}>
              <label>
                Width:
                <input value={pouchWidth} onChange={(e) => setPouchWidth(+e.target.value)} />
              </label>
              <label>
                Height:
                <input value={pouchHeight} onChange={(e) => setPouchHeight(+e.target.value)} />
              </label>
            </div>
          )}

          {/* PREVIEWS */}
          {selectedShape === "cylinder" && (
            <CylinderPreview labelDataUrl={labelImage} topDiameter={topDiameter} bottomDiameter={bottomDiameter} height={height} />
          )}

          {selectedShape === "box" && (
            <BoxPreview labelDataUrl={labelImage} width={boxWidth} height={boxHeight} depth={boxDepth} />
          )}

          {selectedShape === "flat" && (
            <FlatPreview labelDataUrl={labelImage} width={flatWidth} height={flatHeight} />
          )}

          {selectedShape === "tube" && (
            <TubePreview labelDataUrl={labelImage} radius={tubeRadius} height={tubeHeight} />
          )}

          {selectedShape === "pouch" && (
            <PouchPreview labelDataUrl={labelImage} width={pouchWidth} height={pouchHeight} />
          )}
        </div>
      </div>
    </div>
  );
}

const useStyles = makeStyles({
  mainContainer: { display: "flex", flexDirection: "column" },
  headerLabel: { fontWeight: tokens.fontWeightBold, textAlign: "center" },
  canvascontainer: { display: "flex" },
  twoDCanvascontainer: { width: "50%" },
  threeDCanvascontainer: { width: "50%" },
  inputEditor: { display: "flex", gap: "10px" },
});

export default App;