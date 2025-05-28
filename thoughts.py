from fastapi import APIRouter, Form, Depends, HTTPException, Query,Request
from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from repository import NoteRepository
from models_embeddings import model,get_embedding,cosine_similarity
from models import NoteEmbedding, Notes,User
from authentication import get_me
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity



router = APIRouter()


init_db()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/note")
def create_note(
    note_text: str = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_me)
):
    note = Notes(note=note_text, user_id=current_user["id"])
    db.add(note)
    db.commit()
    db.refresh(note)

    vector = model.encode(note_text).tolist()

    embedding = NoteEmbedding(note_id=note.id, embedding=vector)
    db.add(embedding)
    db.commit()

    return {"note_id": note.id}


@router.get("/note/{id}")
def get_note(id: int, db: Session = Depends(get_db)):
    note_repo = NoteRepository(db)
    note = note_repo.get_note_by_id(id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"note": note.note}

@router.delete("/note/{id}")
def delete_note(id: int, db: Session = Depends(get_db)):
    note_repo = NoteRepository(db)
    result = note_repo.delete_note(id)
    return {"message": result}

@router.get("/notes")
def get_all_notes(db: Session = Depends(get_db)):
    repo = NoteRepository(db)
    return repo.get_all_notes()


@router.get("/search")
def search_notes(query: str = Query(...), db: Session = Depends(get_db)):
    query_embedding = np.array(get_embedding(query)).reshape(1, -1)

    notes = db.query(Notes).join(Notes.embedding).all()

    scored_notes = []
    for note in notes:
        note_emb = np.array(note.embedding.embedding).reshape(1, -1)
        score = cosine_similarity(query_embedding, note_emb)[0][0]
        scored_notes.append((score, note))


    scored_notes.sort(key=lambda x: x[0], reverse=True)


    top_notes = [
        {"id": n.id, "note": n.note, "score": round(s, 4)}
        for s, n in scored_notes[:3]
    ]

    return {"results": top_notes}

@router.get("/clusters")
def get_clusters(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get("session_username")
    if not username:
        return {"error": "Not authenticated"}

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}

    notes = (db.query(Notes).join(NoteEmbedding).filter(Notes.user_id == user.id).all())

    if not notes:
        return {"error": "No notes found"}

    embeddings = np.array([note.embedding.embedding for note in notes])
    threshold = 0.5

    clusters = []
    assigned = set()

    for i, (note, emb) in enumerate(zip(notes, embeddings)):
        if i in assigned:
            continue

        cluster = [{"id": note.id, "text": note.note}]
        assigned.add(i)

        for j in range(i + 1, len(embeddings)):
            if j in assigned:
                continue

            sim = cosine_similarity([embeddings[i]], [embeddings[j]])[0][0]
            if sim >= threshold:
                cluster.append({"id": notes[j].id, "text": notes[j].note})
                assigned.add(j)

        clusters.append(cluster)

    return {"clusters": {i: cluster for i, cluster in enumerate(clusters)}}


@router.get("/duplicates")
def find_duplicates(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get("session_username")
    if not username:
        return {"error": "Not authenticated"}

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}

    notes = (
        db.query(Notes)
        .join(NoteEmbedding)
        .filter(Notes.user_id == user.id)
        .all()
    )

    if len(notes) < 2:
        return {"error": "Not enough notes to compare"}

    embeddings = np.array([note.embedding.embedding for note in notes])
    sim_matrix = cosine_similarity(embeddings)


    duplicates = []
    seen = set()
    for i in range(len(notes)):
        for j in range(i + 1, len(notes)):
            if sim_matrix[i][j] > 0.9:
                pair_key = tuple(sorted([notes[i].id, notes[j].id]))
                if pair_key not in seen:
                    seen.add(pair_key)
                    duplicates.append({
                        "note1": {"id": notes[i].id, "text": notes[i].note},
                        "note2": {"id": notes[j].id, "text": notes[j].note},
                        "similarity": float(sim_matrix[i][j])
                    })

    return {"duplicates": duplicates}


@router.get("/memory-map")
def memory_map(request: Request, db: Session = Depends(get_db)):
    username = request.cookies.get("session_username")
    if not username:
        return {"error": "Not authenticated"}

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}

    notes = db.query(Notes).join(NoteEmbedding).filter(Notes.user_id == user.id).all()

    if len(notes) < 2:
        return {"error": "Not enough notes for memory map"}


    embeddings = np.array([note.embedding.embedding for note in notes])
    texts = [note.note for note in notes]


    sim_matrix = cosine_similarity(embeddings)


    nodes = [{"id": idx, "text": text} for idx, text in enumerate(texts)]
    edges = []

    threshold = 0.5
    for i in range(len(notes)):
        for j in range(i + 1, len(notes)):
            similarity = sim_matrix[i][j]
            if similarity > threshold:
                edges.append({"source": i, "target": j, "weight": float(similarity)})

    return {
        "nodes": nodes,
        "edges": edges
    }










