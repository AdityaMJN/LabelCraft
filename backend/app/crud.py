from sqlmodel import Session, select
from .models import Label, LabelCreate, LabelUpdate, User, UserCreate

from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_label(session: Session, label_in: LabelCreate) -> Label:
    label = Label.from_orm(label_in)
    session.add(label)
    session.commit()
    session.refresh(label)
    return label


def get_label(session: Session, label_id: int) -> Label | None:
    return session.get(Label, label_id)


def list_labels(session: Session, limit: int = 50):
    return session.exec(select(Label).limit(limit)).all()


def update_label(session: Session, label_id: int, label_in: LabelUpdate) -> Label | None:
    label = session.get(Label, label_id)
    if not label:
        return None
    label_data = label_in.dict(exclude_unset=True)
    for key, val in label_data.items():
        setattr(label, key, val)
        session.add(label)
        session.commit()
        session.refresh(label)
    return label


def delete_label(session: Session, label_id: int) -> bool:
    label = session.get(Label, label_id)
    if not label:
        return False
    session.delete(label)
    session.commit()
    return TrueUserCreate

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- user CRUD

def get_user_by_username(session: Session, username: str) -> User | None:
    return session.exec(select(User).where(User.username == username)).first()

def create_user(session: Session, user_in: UserCreate) -> User:
    hashed = get_password_hash(user_in.password)
    user = User(username=user_in.username, email=user_in.email, hashed_password=hashed)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def authenticate_user(session: Session, username: str, password: str) -> User | None:
    user = get_user_by_username(session, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user