from sqlalchemy.orm import Session
from models import User, Notes

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_username(self, username: str):
        return self.db.query(User).filter(User.username == username).first()

    def create_user(self, username: str, password: str):
        user = User(username=username, password=password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

class NoteRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_note(self, note: str, user_id: int):
        note_obj = Notes(note=note, user_id=user_id)
        self.db.add(note_obj)
        self.db.commit()
        self.db.refresh(note_obj)
        return note_obj

    def get_note_by_id(self, id: int):
        return self.db.query(Notes).filter(Notes.id == id).first()

    def delete_note(self, id: int):
        note = self.db.query(Notes).filter(Notes.id == id).first()
        if note:
            self.db.delete(note)
            self.db.commit()
            return "Note was deleted"
        return "Note not found"








