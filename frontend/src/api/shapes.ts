export type Shape =
    | {
        type: "cylinder";
        surface: "wrap";
        params: {
            top_diameter: number;
            bottom_diameter: number;
            height: number;
        };
    }
    | {
        type: "box";
        surface: "face";
        params: {
            width: number;
            height: number;
            depth: number;
        };
    }
    | {
        type: "flat";
        surface: "flat";
        params: {
            width: number;
            height: number;
        };
    }
    | {
        type: "tube";
        surface: "wrap";
        params: {
            radius: number;
            height: number;
        };
    }
    | {
        type: "pouch";
        surface: "flat";
        params: {
            width: number;
            height: number;
            depth?: number;
        };
    };

export async function fetchShapes(): Promise<Shape[]> {
    const res = await fetch("http://localhost:8000/shapes");

    if (!res.ok) {
        throw new Error("Failed to fetch shapes");
    }

    return res.json();
}