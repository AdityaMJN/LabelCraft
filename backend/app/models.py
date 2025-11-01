from typing import Optional, List
from sqlmodel import SQLModel, Field


class LabelBase(SQLModel):
    name: str
    description: Optional[str] = None
    template_json: Optional[str] = None # store label layout as JSON


class Label(LabelBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)


class LabelCreate(LabelBase):
    pass


class LabelRead(LabelBase):
    id: int


class LabelUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    template_json: Optional[str] = None