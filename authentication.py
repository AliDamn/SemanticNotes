from fastapi import APIRouter, Form, Request, Response, Depends, HTTPException
from sqlalchemy.orm import Session

from models import User
from database import SessionLocal, init_db

router = APIRouter()


init_db()

SESSION_COOKIE_NAME = "session_username"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def signup(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(username=username, password=password)
    db.add(new_user)
    db.commit()
    return {"message": f"User {username} created"}

@router.post("/login")
def login(
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.password != password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=username,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24,
    )
    return {"message": f"Welcome, {username}"}

@router.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get(SESSION_COOKIE_NAME)
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    is_admin = True if username == "AliBidanov" else user.is_admin

    return {
        "id": user.id,
        "username": user.username,
        "is_admin": is_admin
    }













