"use client"
import { useNavigate } from "react-router-dom"
import "./Sidebar.css"
import React from 'react'

function Sidebar({ activeTab, setActiveTab, isOpen, toggleSidebar, isAdmin }) {
  const navigate = useNavigate()

  const handleTabClick = (tab) => {
    setActiveTab(tab)

    switch (tab) {
      case "notes":
        navigate("/dashboard")
        break
      case "clusters":
        navigate("/dashboard/clusters")
        break
      case "duplicates":
        navigate("/dashboard/duplicates")
        break
      case "memory-map":
        navigate("/dashboard/memory-map")
        break
      case "admin":
        navigate("/dashboard/admin")
        break
      default:
        navigate("/dashboard")
    }
  }

  const sidebarItems = [
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "clusters", label: "Clusters", icon: "📊" },
    { id: "duplicates", label: "Duplicates", icon: "🔄" },
    { id: "memory-map", label: "Memory Map", icon: "🧠" },
  ]

  // Add admin tab if user is admin
  if (isAdmin) {
    sidebarItems.push({ id: "admin", label: "Admin Panel", icon: "⚙️" })
  }

  return (
    <>
      <div className={`sidebar-mobile-toggle ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
        {isOpen ? "✕" : "☰"}
      </div>
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>Semantic Notes</h2>
          <p>Intelligent note-taking</p>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => handleTabClick(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>© 2025 Semantic Notes</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
