"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Header.css"

function Header({ username, isDarkMode, toggleDarkMode, handleLogout, toggleSidebar, isAdmin }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const goToAdminPanel = () => {
    navigate("/dashboard/admin")
    setIsUserMenuOpen(false)
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button className="header-sidebar-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <h1>Semantic Notes</h1>
      </div>
      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <div className="user-menu-container" ref={userMenuRef}>
          <button className="user-menu-button" onClick={toggleUserMenu}>
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
          </button>
          {isUserMenuOpen && (
            <div className="user-menu">
              <div className="user-menu-header">
                <p className="user-menu-name">{username}</p>
                <p className="user-menu-username">@{username}</p>
                {isAdmin && <p className="user-menu-admin-badge">Admin</p>}
              </div>
              <div className="user-menu-divider"></div>
              {isAdmin && (
                <button className="user-menu-item" onClick={goToAdminPanel}>
                  <span className="user-menu-icon">⚙️</span>
                  <span>Admin Panel</span>
                </button>
              )}
              <button className="user-menu-item" onClick={handleLogout}>
                <span className="user-menu-icon">🚪</span>
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

