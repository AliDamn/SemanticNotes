"use client"

import { useState, useEffect } from "react"
import NoteEditor from "./NoteEditor"
import NotesList from "./NotesList"
import SearchBar from "./SearchBar"
import "./NotesTab.css"
import React from 'react'

function NotesTab() {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/notes", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notes")
      }

      const data = await response.json()
      setNotes(data)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching notes:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleNoteAdded = () => {
    fetchNotes()
  }

  const handleNoteDeleted = () => {
    fetchNotes()
  }

  return (
    <div className="notes-tab">
      <div className="notes-header">
        <div>
          <h2>Welcome back!</h2>
          <p className="notes-subtitle">Here are your notes and insights</p>
        </div>
        <SearchBar />
      </div>

      <NoteEditor onNoteAdded={handleNoteAdded} />

      {isLoading ? (
        <div className="notes-loading">Loading notes...</div>
      ) : error ? (
        <div className="notes-error">Error: {error}</div>
      ) : (
        <NotesList notes={notes} onNoteDeleted={handleNoteDeleted} />
      )}
    </div>
  )
}

export default NotesTab
