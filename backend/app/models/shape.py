from pydantic import BaseModel
from typing import Union

from .shape_types import ShapeType, SurfaceType
from .shape_params import CylinderParams, BoxParams, FlatParams


class Shape(BaseModel):
    type: ShapeType
    surface: SurfaceType
    params: Union[CylinderParams, BoxParams, FlatParams]