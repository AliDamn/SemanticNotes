from fastapi import Form, Request, Response, Depends, FastAPI
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import User

app = FastAPI()

SESSION_COOKIE_NAME = "session_username"

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup")
def signup(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        return {"error": f"User {username} already registered"}

    new_user = User(username=username, password=password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {username} created"}

@app.post("/login")
def login(
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": f"User {username} not found"}

    if user.password != password:
        return {"error": "Incorrect password"}

    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=username,
        httponly=True,
        max_age=3600 * 24
    )
    return {"message": f"Welcome, {username}"}

@app.get("/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get(SESSION_COOKIE_NAME)
    if not username:
        return {"error": "Not authenticated"}

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}

    return {"id": user.id, "username": user.username}












