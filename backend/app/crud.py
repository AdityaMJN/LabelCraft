from sqlmodel import Session, select
from .models import Label, LabelCreate, LabelUpdate


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
    return True