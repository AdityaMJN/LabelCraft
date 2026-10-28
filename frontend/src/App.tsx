// src/App.tsx
import { useState, useEffect } from "react";
import LabelEditor from "./Components/LabelEditor";
import CylinderPreview from "./Components/CylinderPreview";
import BoxPreview from "./Components/BoxPreview";
import FlatPreview from "./Components/FlatPreview";
import TubePreview from "./Components/TubePreview";
import PouchPreview from "./Components/PouchPreview";
import { makeStyles, tokens, Button, Text, Input, Label, Card, CardHeader } from "@fluentui/react-components";

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

const DEFAULT_SHAPES: Shape[] = [
  {
    type: "cylinder",
    params: {
      top_diameter: 70,
      bottom_diameter: 70,
      height: 120,
    },
  },
  {
    type: "box",
    params: {
      width: 100,
      height: 150,
      depth: 50,
    },
  },
  {
    type: "flat",
    params: {
      width: 100,
      height: 100,
    },
  },
  { type: "tube" },
  { type: "pouch" },
];

function App() {
  const styles = useStyles();
  const [labelImage, setLabelImage] = useState<string | null>(null);

  const [topDiameter, setTopDiameter] = useState(80);
  const [bottomDiameter, setBottomDiameter] = useState<number | undefined>(80);
  const [height, setHeight] = useState(120);

  const [shapes, setShapes] = useState<Shape[]>(DEFAULT_SHAPES);
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
  const [pouchDepth, setPouchDepth] = useState(30);

  // Color customization states
  const [jarBodyColor, setJarBodyColor] = useState("#e8f4f8");
  const [jarLidColor, setJarLidColor] = useState("#2c2c2c");
  const [pouchBodyColor, setPouchBodyColor] = useState("#f5f1e8");
  const [pouchSealColor, setPouchSealColor] = useState("#e8d5b7");

  useEffect(() => {
    fetch("http://localhost:8000/shapes/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShapes(data);
        }
      })
      .catch((error) => {
        console.error(error);
        setShapes(DEFAULT_SHAPES);
      });
  }, []);

  const handleShapeSelect = (shape: Shape) => {
    setSelectedShape(shape.type);

    if (shape.type === "cylinder" && "params" in shape) {
      setTopDiameter(shape.params.top_diameter);
      setBottomDiameter(shape.params.bottom_diameter);
      setHeight(shape.params.height);
    }

    if (shape.type === "box" && "params" in shape) {
      setBoxWidth(shape.params.width);
      setBoxHeight(shape.params.height);
      setBoxDepth(shape.params.depth);
    }

    if (shape.type === "flat" && "params" in shape) {
      setFlatWidth(shape.params.width);
      setFlatHeight(shape.params.height);
    }
  };

  const getShapeIcon = (shapeType: string) => {
    const icons: { [key: string]: string } = {
      cylinder: "🛢️",
      box: "📦",
      flat: "📄",
      tube: "🧪",
      pouch: "🛍️"
    };
    return icons[shapeType] || "❓";
  };

  return (
    <div className={styles.app}>
      {/* Professional Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <Text as="h1" className={styles.title}>
              🏷️ LabelCraft Pro
            </Text>
            <Text as="p" className={styles.subtitle}>
              Professional Label Design & 3D Visualization Suite
            </Text>
          </div>
          <div className={styles.headerActions}>
            <Button appearance="outline" className={styles.headerButton}>
              Export
            </Button>
            <Button appearance="primary" className={styles.headerButton}>
              Save Project
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* Left Sidebar - Controls */}
        <aside className={styles.sidebar}>
          <Card className={styles.shapeCard}>
            <CardHeader
              header={
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>🎯</span>
                  <Text weight="semibold" className={styles.sectionTitle}>Shape Selection</Text>
                </div>
              }
            />
            <div className={styles.cardScroll}>
              <div className={styles.shapeGrid}>
                {Array.from(new Map(shapes.map((s) => [s.type, s])).values()).map((shape: any) => (
                  <div
                    key={shape.type}
                    className={`${styles.shapeButtonWrapper} ${selectedShape === shape.type ? styles.selectedShape : ''}`}
                    onClick={() => handleShapeSelect(shape)}
                  >
                    <div className={styles.shapeIcon}>
                      {getShapeIcon(shape.type)}
                    </div>
                    <Text className={styles.shapeLabel}>
                      {shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}
                    </Text>
                    {selectedShape === shape.type && (
                      <div className={styles.selectedIndicator}>
                        <span>✓</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className={styles.dimensionCard}>
            <CardHeader
              header={
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>📏</span>
                  <Text weight="semibold" className={styles.sectionTitle}>Dimensions</Text>
                  <Text size={200} className={styles.unitLabel}>(mm)</Text>
                </div>
              }
            />
            <div className={styles.cardScroll}>
              <div className={styles.dimensionInputs}>
                {selectedShape === "cylinder" && (
                  <>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>⭕</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="topDiameter" className={styles.inputLabel}>Top Diameter</Label>
                        <Input
                          id="topDiameter"
                          type="number"
                          value={topDiameter.toString()}
                          onChange={(e) => setTopDiameter(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>⭕</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="bottomDiameter" className={styles.inputLabel}>Bottom Diameter</Label>
                        <Input
                          id="bottomDiameter"
                          type="number"
                          value={bottomDiameter?.toString() || ""}
                          onChange={(e) => setBottomDiameter(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>📏</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="height" className={styles.inputLabel}>Height</Label>
                        <Input
                          id="height"
                          type="number"
                          value={height.toString()}
                          onChange={(e) => setHeight(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedShape === "box" && (
                  <>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↔️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="boxWidth" className={styles.inputLabel}>Width</Label>
                        <Input
                          id="boxWidth"
                          type="number"
                          value={boxWidth.toString()}
                          onChange={(e) => setBoxWidth(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↕️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="boxHeight" className={styles.inputLabel}>Height</Label>
                        <Input
                          id="boxHeight"
                          type="number"
                          value={boxHeight.toString()}
                          onChange={(e) => setBoxHeight(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>🔲</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="boxDepth" className={styles.inputLabel}>Depth</Label>
                        <Input
                          id="boxDepth"
                          type="number"
                          value={boxDepth.toString()}
                          onChange={(e) => setBoxDepth(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedShape === "flat" && (
                  <>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↔️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="flatWidth" className={styles.inputLabel}>Width</Label>
                        <Input
                          id="flatWidth"
                          type="number"
                          value={flatWidth.toString()}
                          onChange={(e) => setFlatWidth(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↕️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="flatHeight" className={styles.inputLabel}>Height</Label>
                        <Input
                          id="flatHeight"
                          type="number"
                          value={flatHeight.toString()}
                          onChange={(e) => setFlatHeight(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedShape === "tube" && (
                  <>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>⭕</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="tubeRadius" className={styles.inputLabel}>Radius</Label>
                        <Input
                          id="tubeRadius"
                          type="number"
                          value={tubeRadius.toString()}
                          onChange={(e) => setTubeRadius(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>📏</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="tubeHeight" className={styles.inputLabel}>Height</Label>
                        <Input
                          id="tubeHeight"
                          type="number"
                          value={tubeHeight.toString()}
                          onChange={(e) => setTubeHeight(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedShape === "pouch" && (
                  <>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↔️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="pouchWidth" className={styles.inputLabel}>Width</Label>
                        <Input
                          id="pouchWidth"
                          type="number"
                          value={pouchWidth.toString()}
                          onChange={(e) => setPouchWidth(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>↕️</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="pouchHeight" className={styles.inputLabel}>Height</Label>
                        <Input
                          id="pouchHeight"
                          type="number"
                          value={pouchHeight.toString()}
                          onChange={(e) => setPouchHeight(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                    <div className={styles.dimensionField}>
                      <div className={styles.inputIcon}>📦</div>
                      <div className={styles.inputContent}>
                        <Label htmlFor="pouchDepth" className={styles.inputLabel}>Depth</Label>
                        <Input
                          id="pouchDepth"
                          type="number"
                          value={pouchDepth.toString()}
                          onChange={(e) => setPouchDepth(+e.target.value)}
                          className={styles.dimensionInput}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className={styles.colorCard}>
            <CardHeader
              header={
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionIcon}>🎨</span>
                  <Text weight="semibold" className={styles.sectionTitle}>Color Customization</Text>
                </div>
              }
            />
            <div className={styles.cardScroll}>
              <div className={styles.colorInputs}>
                {selectedShape === "cylinder" && (
                  <>
                    <div className={styles.colorField}>
                      <div className={styles.colorIcon}>🏺</div>
                      <div className={styles.colorContent}>
                        <Label htmlFor="jarBodyColor" className={styles.inputLabel}>Jar Body Color</Label>
                        <div className={styles.colorPickerWrapper}>
                          <input
                            id="jarBodyColor"
                            type="color"
                            value={jarBodyColor}
                            onChange={(e) => setJarBodyColor(e.target.value)}
                            className={styles.colorPicker}
                          />
                          <Input
                            value={jarBodyColor}
                            onChange={(e) => setJarBodyColor(e.target.value)}
                            className={styles.colorInput}
                            placeholder="#e8f4f8"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.colorField}>
                      <div className={styles.colorIcon}>🪔</div>
                      <div className={styles.colorContent}>
                        <Label htmlFor="jarLidColor" className={styles.inputLabel}>Jar Lid Color</Label>
                        <div className={styles.colorPickerWrapper}>
                          <input
                            id="jarLidColor"
                            type="color"
                            value={jarLidColor}
                            onChange={(e) => setJarLidColor(e.target.value)}
                            className={styles.colorPicker}
                          />
                          <Input
                            value={jarLidColor}
                            onChange={(e) => setJarLidColor(e.target.value)}
                            className={styles.colorInput}
                            placeholder="#2c2c2c"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedShape === "pouch" && (
                  <>
                    <div className={styles.colorField}>
                      <div className={styles.colorIcon}>🛍️</div>
                      <div className={styles.colorContent}>
                        <Label htmlFor="pouchBodyColor" className={styles.inputLabel}>Pouch Body Color</Label>
                        <div className={styles.colorPickerWrapper}>
                          <input
                            id="pouchBodyColor"
                            type="color"
                            value={pouchBodyColor}
                            onChange={(e) => setPouchBodyColor(e.target.value)}
                            className={styles.colorPicker}
                          />
                          <Input
                            value={pouchBodyColor}
                            onChange={(e) => setPouchBodyColor(e.target.value)}
                            className={styles.colorInput}
                            placeholder="#f5f1e8"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={styles.colorField}>
                      <div className={styles.colorIcon}>🔒</div>
                      <div className={styles.colorContent}>
                        <Label htmlFor="pouchSealColor" className={styles.inputLabel}>Pouch Seal Color</Label>
                        <div className={styles.colorPickerWrapper}>
                          <input
                            id="pouchSealColor"
                            type="color"
                            value={pouchSealColor}
                            onChange={(e) => setPouchSealColor(e.target.value)}
                            className={styles.colorPicker}
                          />
                          <Input
                            value={pouchSealColor}
                            onChange={(e) => setPouchSealColor(e.target.value)}
                            className={styles.colorInput}
                            placeholder="#e8d5b7"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className={styles.content}>
          <div className={styles.canvasGrid}>
            {/* 2D Editor Panel */}
            <Card className={styles.canvasCard}>
              <CardHeader
                header={
                  <div className={styles.canvasHeader}>
                    <div className={styles.canvasTitleSection}>
                      <div className={styles.canvasIcon}>🎨</div>
                      <div>
                        <Text weight="semibold" className={styles.canvasTitle}>2D Label Editor</Text>
                        <Text size={200} className={styles.canvasSubtitle}>
                          Design your label with text, images, and shapes
                        </Text>
                      </div>
                    </div>
                    <div className={styles.canvasActions}>
                      <Button appearance="outline" size="small" className={styles.canvasActionButton}>
                        📥 Import
                      </Button>
                      <Button appearance="primary" size="small" className={styles.canvasActionButton}>
                        💾 Export
                      </Button>
                    </div>
                  </div>
                }
              />
              <div className={`${styles.canvasContainer} ${styles.editorScrollPanel}`}>
                <LabelEditor width={450} height={250} onExport={setLabelImage} />
              </div>
            </Card>

            {/* 3D Preview Panel */}
            <Card className={styles.canvasCard}>
              <CardHeader
                header={
                  <div className={styles.canvasHeader}>
                    <div className={styles.canvasTitleSection}>
                      <div className={styles.canvasIcon}>🔄</div>
                      <div>
                        <Text weight="semibold" className={styles.canvasTitle}>3D Preview</Text>
                        <Text size={200} className={styles.canvasSubtitle}>
                          See your label on the selected product shape
                        </Text>
                      </div>
                    </div>
                    <div className={styles.previewControls}>
                      <div className={styles.shapeIndicator}>
                        <span className={styles.shapeIndicatorIcon}>{getShapeIcon(selectedShape)}</span>
                        <span className={styles.shapeIndicatorText}>
                          {selectedShape.charAt(0).toUpperCase() + selectedShape.slice(1)}
                        </span>
                      </div>
                      <Button appearance="outline" size="small" className={styles.canvasActionButton}>
                        🔄 Rotate
                      </Button>
                    </div>
                  </div>
                }
              />
              <div className={styles.canvasContainer}>
                {selectedShape === "cylinder" && (
                  <CylinderPreview
                    labelDataUrl={labelImage}
                    topDiameter={topDiameter}
                    bottomDiameter={bottomDiameter}
                    height={height}
                    jarBodyColor={jarBodyColor}
                    jarLidColor={jarLidColor}
                  />
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
                  <PouchPreview
                    labelDataUrl={labelImage}
                    width={pouchWidth}
                    height={pouchHeight}
                    depth={pouchDepth}
                    pouchBodyColor={pouchBodyColor}
                    pouchSealColor={pouchSealColor}
                  />
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

const useStyles = makeStyles({
  app: {
    height: "100vh",
    overflow: "hidden",
    background: "url('/assets/backgrounds/hero-bg.svg') no-repeat center center fixed",
    backgroundSize: "cover",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    "&::before": {
      content: '""',
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url('/assets/textures/subtle-dots.svg') repeat",
      backgroundSize: "400px 400px",
      opacity: 0.05,
      pointerEvents: "none",
      zIndex: -1,
    },
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXXL}`,
    boxShadow: tokens.shadow16,
    position: "relative",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  title: {
    fontSize: tokens.fontSizeHero900,
    fontWeight: tokens.fontWeightBold,
    margin: 0,
    marginBottom: tokens.spacingVerticalXS,
  },
  subtitle: {
    fontSize: "0.875rem",
    margin: 0,
    opacity: 0.9,
    fontWeight: "400",
  },
  headerActions: {
    display: "flex",
    gap: tokens.spacingHorizontalL,
  },
  headerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "white",
    backdropFilter: "blur(10px)",
  },
  mainContainer: {
    display: "flex",
    flex: 1,
    maxWidth: "1400px",
    width: "100%",
    minHeight: 0,
    boxSizing: "border-box",
    margin: "0 auto",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    gap: tokens.spacingHorizontalM,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url('/assets/textures/geometric-pattern.svg') repeat",
      backgroundSize: "300px 300px",
      opacity: 0.02,
      pointerEvents: "none",
      zIndex: -1,
    },
  },
  sidebar: {
    width: "340px",
    minWidth: "320px",
    height: "100%",
    minHeight: 0,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalS,
    overflowY: "auto",
    overflowX: "hidden",
    background: "rgba(255, 255, 255, 0.5)",
    borderRight: "1px solid rgba(209, 213, 219, 0.3)",
  },
  shapeCard: {
    background: "#ffffff",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(209, 213, 219, 0.6)",
    position: "relative",
    overflow: "hidden",
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #3b82f6 0%, #7c3aed 100%)",
    },
  },
  dimensionCard: {
    background: "#ffffff",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(209, 213, 219, 0.6)",
    position: "relative",
    overflow: "hidden",
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #10b981 0%, #14b8a6 100%)",
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(124, 58, 237, 0.04) 100%)",
    borderBottom: "1px solid rgba(209, 213, 219, 0.3)",
  },
  sectionIcon: {
    fontSize: "1.2rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: "#1e293b",
    margin: 0,
  },
  unitLabel: {
    color: "#64748b",
    fontWeight: "400",
    marginLeft: "auto",
  },
  shapeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalXS,
  },
  shapeButtonWrapper: {
    position: "relative",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    border: "2px solid #e2e8f0",
    borderRadius: tokens.borderRadiusMedium,
    minHeight: "58px",
    padding: tokens.spacingVerticalXS,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalXXS,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    "&:hover": {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
      border: "2px solid #667eea",
    },
  },
  selectedShape: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "2px solid #667eea",
    color: "white",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
    transform: "translateY(-2px)",
    "&:hover": {
      transform: "translateY(-6px) scale(1.02)",
      boxShadow: "0 16px 32px rgba(102, 126, 234, 0.4)",
    },
  },
  shapeIcon: {
    fontSize: "1.35rem",
    marginBottom: tokens.spacingVerticalXXS,
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
  },
  shapeLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: "center",
    color: "inherit",
  },
  selectedIndicator: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "#10b981",
    color: "white",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
    border: "2px solid white",
  },
  dimensionInputs: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalXS,
  },
  dimensionField: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalXS,
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    "&:hover": {
      border: "1px solid #4facfe",
      boxShadow: "0 4px 12px rgba(79, 172, 254, 0.15)",
    },
    "&:focus-within": {
      border: "1px solid #4facfe",
      boxShadow: "0 0 0 3px rgba(79, 172, 254, 0.1)",
    },
  },
  inputIcon: {
    fontSize: "1.2rem",
    color: "#374151",
    flexShrink: 0,
  },
  inputContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  inputLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: "#1f2937",
    margin: 0,
  },
  dimensionInput: {
    border: "none",
    background: "transparent",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: "#1e293b",
    "&:focus": {
      outline: "none",
      boxShadow: "none",
    },
    "&::placeholder": {
      color: "#9ca3af",
    },
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  canvasGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalM,
    flex: 1,
    minHeight: 0,
  },
  canvasCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(102, 126, 234, 0.1)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    },
  },
  canvasHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: tokens.spacingVerticalS,
    borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  },
  canvasTitleSection: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  canvasIcon: {
    fontSize: "1.5rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
    marginBottom: tokens.spacingVerticalXS,
  },
  canvasTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.2,
  },
  canvasSubtitle: {
    color: tokens.colorNeutralForeground3,
    fontWeight: "400",
    fontSize: tokens.fontSizeBase200,
    margin: 0,
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    border: "1px solid rgba(102, 126, 234, 0.2)",
    display: "inline-block",
    width: "fit-content",
  },
  canvasActions: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  canvasActionButton: {
    fontSize: tokens.fontSizeBase200,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    fontWeight: tokens.fontWeightMedium,
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  previewControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: tokens.spacingVerticalS,
  },
  cardScroll: {
    overflowY: "visible",
    padding: tokens.spacingVerticalXS,
    background: "rgba(255,255,255,0.98)",
    borderTop: "1px solid rgba(148, 163, 184, 0.15)",
  },
  shapeIndicator: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusLarge,
    border: "1px solid rgba(102, 126, 234, 0.2)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    whiteSpace: "nowrap",
  },
  shapeIndicatorIcon: {
    fontSize: "1.25rem",
    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
  },
  shapeIndicatorText: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: "#374151",
  },
  canvasContainer: {
    flex: 1,
    minHeight: 0,
    padding: tokens.spacingVerticalXXS,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%)",
    borderRadius: `0 0 ${tokens.borderRadiusLarge} ${tokens.borderRadiusLarge}`,
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "url('/assets/textures/geometric-pattern.svg') repeat",
      backgroundSize: "60px 60px",
      opacity: 0.02,
      pointerEvents: "none",
    },
  },
  colorCard: {
    background: "#ffffff",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(209, 213, 219, 0.6)",
    position: "relative",
    overflow: "hidden",
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      background: "linear-gradient(90deg, #fb7185 0%, #f97316 50%, #facc15 100%)",
    },
  },
  editorScrollPanel: {
    alignItems: "flex-start",
    justifyContent: "center",
    overflowY: "auto",
    overflowX: "hidden",
    padding: tokens.spacingVerticalS,
  },
  colorInputs: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalXS,
  },
  colorField: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalXS,
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: tokens.borderRadiusMedium,
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    "&:hover": {
      border: "1px solid #ff6b6b",
      boxShadow: "0 4px 12px rgba(255, 107, 107, 0.15)",
    },
    "&:focus-within": {
      border: "1px solid #ff6b6b",
      boxShadow: "0 0 0 3px rgba(255, 107, 107, 0.1)",
    },
  },
  colorIcon: {
    fontSize: "1.15rem",
    color: "#64748b",
    flexShrink: 0,
  },
  colorContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  colorPickerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  colorPicker: {
    width: "34px",
    height: "28px",
    border: "none",
    borderRadius: tokens.borderRadiusSmall,
    cursor: "pointer",
    "&:focus": {
      outline: "2px solid #ff6b6b",
      outlineOffset: "2px",
    },
  },
  colorInput: {
    border: "none",
    background: "transparent",
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: "#1e293b",
    fontFamily: "monospace",
    "&:focus": {
      outline: "none",
      boxShadow: "none",
    },
    "&::placeholder": {
      color: "#9ca3af",
    },
  },
});

export default App;
