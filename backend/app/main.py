from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from .config import settings
from .database import init_db, get_session
from . import crud, models
from .config import settings

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