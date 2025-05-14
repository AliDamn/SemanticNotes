from fastapi import FastAPI, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from repository import NoteRepository

app = FastAPI()
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/note")
def post_note(note: str = Form(...), user_id: int = Form(...), db: Session = Depends(get_db)):
    note_repo = NoteRepository(db)
    return note_repo.add_note(note=note, user_id=user_id)

@app.get("/note/{id}")
def get_note(id: int, db: Session = Depends(get_db)):
    note_repo = NoteRepository(db)
    note = note_repo.get_note_by_id(id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"note": note.note}

@app.delete("/note/{id}")
def delete_note(id: int, db: Session = Depends(get_db)):
    note_repo = NoteRepository(db)
    result = note_repo.delete_note(id)
    return {"message": result}





