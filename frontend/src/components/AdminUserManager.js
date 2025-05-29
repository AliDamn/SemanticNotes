"use client"

import { useState } from "react"
import "./AdminUserManager.css"

function AdminUserManager({ users, onUserUpdated }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleToggleAdmin = async (user) => {
    if (user.is_admin) {
      if (!window.confirm(`Удалить права администратора у пользователя ${user.username}?`)) {
        return
      }
    } else {
      if (!window.confirm(`Назначить пользователя ${user.username} администратором?`)) {
        return
      }
    }

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const endpoint = user.is_admin
        ? `http://localhost:8000/admin/remove-admin/${user.id}`
        : `http://localhost:8000/admin/make-admin/${user.id}`

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || `Ошибка: ${response.status}`)
      }

      const data = await response.json()
      setSuccessMessage(data.message)


      if (onUserUpdated) {
        onUserUpdated()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-user-manager">
      <h3>Управление администраторами</h3>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя пользователя</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>
                  <span className={`user-status ${user.is_admin ? "admin" : "regular"}`}>
                    {user.is_admin ? "Администратор" : "Обычный пользователь"}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${user.is_admin ? "btn-danger" : "btn-primary"}`}
                    onClick={() => handleToggleAdmin(user)}
                    disabled={isLoading}
                  >
                    {user.is_admin ? "Удалить права" : "Сделать админом"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminUserManager