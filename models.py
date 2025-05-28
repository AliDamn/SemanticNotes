from __future__ import annotations
from sqlalchemy import String, ForeignKey,Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB



class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "user_info"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(100), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    notes: Mapped[list[Notes]] = relationship(
        "Notes",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Notes(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    note: Mapped[str] = mapped_column(String(300), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_info.id"), nullable=False)

    user: Mapped[User] = relationship("User", back_populates="notes")

    embedding: Mapped[NoteEmbedding] = relationship(
        "NoteEmbedding", back_populates="note", uselist=False, cascade="all, delete-orphan"
    )


class NoteEmbedding(Base):
    __tablename__ = "note_embeddings"

    id: Mapped[int] = mapped_column(primary_key=True)
    note_id: Mapped[int] = mapped_column(ForeignKey("notes.id"), nullable=False)
    embedding: Mapped[list] = mapped_column(JSONB)

    note: Mapped[Notes] = relationship("Notes", back_populates="embedding")




