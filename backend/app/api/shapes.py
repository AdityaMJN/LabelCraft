from fastapi import APIRouter

router = APIRouter(prefix="/shapes", tags=["Shapes"])


@router.get("/")
def get_shapes():
    return [
        {
            "type": "cylinder",
            "surface": "wrap",
            "params": {
                "top_diameter": 70,
                "bottom_diameter": 70,
                "height": 120
            }
        },
        {
            "type": "box",
            "surface": "face",
            "params": {
                "width": 100,
                "height": 150,
                "depth": 50
            }
        },
        {
            "type": "flat",
            "surface": "flat",
            "params": {
                "width": 100,
                "height": 100
            }
        },
        {
  "type": "tube",
  "surface": "wrap",
  "params": { "radius": 50, "height": 200 }
},
{
  "type": "pouch",
  "surface": "flat",
  "params": { "width": 150, "height": 200 }
}
    ]