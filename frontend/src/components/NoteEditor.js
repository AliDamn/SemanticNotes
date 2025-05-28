"use client"

import { useState } from "react"
import "./NoteEditor.css"
import React from 'react'

function NoteEditor({ onNoteAdded }) {
  const [noteText, setNoteText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setIsLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("note_text", noteText)

    try {
      const response = await fetch("http://localhost:8000/note", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Failed to save note")
      }

      setNoteText("")
      if (onNoteAdded) {
        onNoteAdded()
      }
    } catch (err) {
      setError(err.message || "Failed to save note")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="note-editor card">
      <div className="card-header">
        <h3 className="card-title">Add New Note</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="card-body">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <textarea
            className="note-textarea"
            placeholder="What's on your mind?"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
          ></textarea>
        </div>
        <div className="card-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setNoteText("")}
            disabled={isLoading || !noteText}
          >
            Clear
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading || !noteText}>
            {isLoading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteEditor
