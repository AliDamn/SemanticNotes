"use client"

import { useState, useEffect } from "react"
import "./AdminPanel.css"
import AdminUserManager from "../components/AdminUserManager"
import React from "react"

function AdminPanel() {
  const [users, setUsers] = useState([])
  const [notes, setNotes] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("users")

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const usersResponse = await fetch("http://localhost:8000/users", {
        credentials: "include",
      })

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users. Make sure you have admin privileges.")
      }

      const usersData = await usersResponse.json()
      setUsers(usersData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchNotes = async () => {
    try {
      setIsLoadingNotes(true)
      const notesResponse = await fetch("http://localhost:8000/notes", {
        credentials: "include",
      })

      if (!notesResponse.ok) {
        throw new Error("Failed to fetch notes")
      }

      const notesData = await notesResponse.json()
      setNotes(notesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingNotes(false)
    }
  }

  // Fetch users and notes
  useEffect(() => {
    fetchUsers()
    fetchNotes()
  }, [])

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will delete all their notes as well.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      setUsers(users.filter((user) => user.id !== userId))
      setNotes(notes.filter((note) => note.user_id !== userId))
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user: " + error.message)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete note")
      }

      // Update notes list
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note: " + error.message)
    }
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Admin Panel</h2>
        </div>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <p className="admin-subtitle">Manage users and notes</p>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          Users
        </button>
        <button className={`admin-tab ${activeTab === "notes" ? "active" : ""}`} onClick={() => setActiveTab("notes")}>
          All Notes
        </button>
      </div>

      {activeTab === "users" && (
        <div className="admin-section">
          <h3>Users Management</h3>
          {isLoadingUsers ? (
            <div className="admin-loading">Loading users...</div>
          ) : (
            <>
              <AdminUserManager users={users} onUserUpdated={fetchUsers} />

              <div className="admin-table-container">
                <h3>Delete Users</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Admin</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.is_admin ? "Yes" : "No"}</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="admin-section">
          <h3>All Notes</h3>
          {isLoadingNotes ? (
            <div className="admin-loading">Loading notes...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User ID</th>
                    <th>Note</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.id}</td>
                      <td>{note.user_id}</td>
                      <td className="note-content">{note.note}</td>
                      <td>{new Date(note.created_at).toLocaleString()}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteNote(note.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminPanel
