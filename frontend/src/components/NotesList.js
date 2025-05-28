"use client"
import "./NotesList.css"
import React from 'react'


function NotesList({ notes, onNoteDeleted }) {
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/note/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      if (onNoteDeleted) {
        onNoteDeleted()
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note: " + error.message)
    }
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="notes-empty">
        <p>No notes yet. Create your first note above!</p>
      </div>
    )
  }

  return (
    <div className="notes-grid">
      {notes.map((note) => {
        const formattedDate = note.created_at
          ? new Date(note.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null

        return (
          <div key={note.id} className="note-card card">
            <div className="card-header">
              <h3 className="card-title">Note #{note.id}</h3>
              {formattedDate && <p className="card-subtitle">{formattedDate}</p>}
            </div>
            <div className="card-body">
              <p className="note-text">{note.note}</p>
            </div>
            <div className="card-footer">
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNote(note.id)}>
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotesList
