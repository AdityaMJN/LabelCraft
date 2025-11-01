from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from .config import settings
from .database import init_db, get_session
from . import crud, models
from .config import settings
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from .config import settings
from .database import init_db, get_session
from . import crud, models
from .auth import create_access_token, get_current_active_user

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
CORSMiddleware,
allow_origins=settings.FRONTEND_ORIGINS,
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/labels", response_model=models.LabelRead)
def create_label(label: models.LabelCreate, session: Session = Depends(get_session)):
    return crud.create_label(session, label)


@app.get("/api/labels", response_model=list[models.LabelRead])
def list_labels(session: Session = Depends(get_session)):
    return crud.list_labels(session)


@app.get("/api/labels/{label_id}", response_model=models.LabelRead)
def get_label(label_id: int, session: Session = Depends(get_session)):
    label = crud.get_label(session, label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


@app.patch("/api/labels/{label_id}", response_model=models.LabelRead)
def update_label(label_id: int, label_in: models.LabelUpdate, session: Session = Depends(get_session)):
    label = crud.update_label(session, label_id, label_in)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


@app.delete("/api/labels/{label_id}")
def delete_label(label_id: int, session: Session = Depends(get_session)):
    ok = crud.delete_label(session, label_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Label not found")
    return {"ok": True}


# Register user
@app.post("/auth/register", response_model=models.UserRead)
def register(user_in: models.UserCreate, session: Session = Depends(get_session)):
    existing = crud.get_user_by_username(session, user_in.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    user = crud.create_user(session, user_in)
    return models.UserRead.from_orm(user)

# Login (token)
@app.post("/auth/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = crud.authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Protected example
@app.get("/api/me", response_model=models.UserRead)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return models.UserRead.from_orm(current_user)