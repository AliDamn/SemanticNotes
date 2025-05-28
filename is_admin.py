from __future__ import annotations

from models import Notes
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from models import User
from authentication import get_db

router = APIRouter()

def get_current_user(request: Request, db: Session) -> User:
    username = request.cookies.get("session_username")
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(User).filter_by(username=username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_admin(user: User):
    if user.username == "AliBidanov":
        return

    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/users")
def list_users(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    require_admin(user)
    return db.query(User).all()

@router.get("/notes")
def list_all_notes(request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    require_admin(user)
    return db.query(Notes).all()

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    require_admin(user)
    note = db.query(Notes).filter_by(id=note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    user = get_current_user(request, db)
    require_admin(user)
    target = db.query(User).filter_by(id=user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(target)
    db.commit()
    return {"message": "User and their notes deleted"}

@router.post("/make-admin/{user_id}")
def make_admin(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):

    current_user = get_current_user(request, db)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Только администраторы могут назначать других администраторов")

    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.is_admin = True
    db.commit()

    return {"success": True, "message": f"Пользователь {user.username} теперь администратор"}


@router.post("/remove-admin/{user_id}")
def remove_admin(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):

    current_user = get_current_user(request, db)
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Только администраторы могут изменять права администраторов")

    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Вы не можете удалить права администратора у самого себя")

    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.is_admin = False
    db.commit()

    return {"success": True, "message": f"Пользователь {user.username} больше не администратор"}



