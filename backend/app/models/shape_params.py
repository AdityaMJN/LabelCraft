from pydantic import BaseModel


class CylinderParams(BaseModel):
    top_diameter: float
    bottom_diameter: float
    height: float


class BoxParams(BaseModel):
    width: float
    height: float
    depth: float


class FlatParams(BaseModel):
    width: float
    height: float