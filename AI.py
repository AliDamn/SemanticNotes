from database import SessionLocal
from repository import NoteRepository

def get_notes():
    db = SessionLocal()
    user_repo = NoteRepository(db)
    notes = user_repo.get_all_notes()
    db.close()
    return notes


