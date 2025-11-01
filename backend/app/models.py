from typing import Optional, List
from sqlmodel import SQLModel, Field
from datetime import datetime
from pydantic import validator


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


#------------------
# User models
# ------------------
class UserBase(SQLModel):
    username: str

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: Optional[str] = None
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(UserBase):
    email: Optional[str] = None
    password: str
    @validator("password")
    def password_length(cls, v):
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password too long (bcrypt max 72 bytes)")
        return v

class UserRead(UserBase):
    id: int
    email: Optional[str] = None
    is_active: bool