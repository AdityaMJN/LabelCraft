from enum import Enum

class ShapeType(str, Enum):
    CYLINDER = "cylinder"
    BOX = "box"
    FLAT = "flat"


class SurfaceType(str, Enum):
    WRAP = "wrap"     # cylinder
    FACE = "face"     # box
    FLAT = "flat"     # sticker