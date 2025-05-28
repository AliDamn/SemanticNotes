"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import NotesTab from "../components/NotesTab"
import ClustersTab from "../components/ClusterTab"
import DuplicatesTab from "../components/DuplicateTab"
import MemoryMapTab from "../components/MemoryMapTab"
import AdminPanel from "./AdminPanel"
import "./Dashboard.css"
import React from 'react'

function DashboardPage({ setIsAuthenticated }) {
  const [activeTab, setActiveTab] = useState("notes")
  const [username, setUsername] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:8000/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          console.log("User data:", data)
          setUsername(data.username)

          const isUserAdmin = data.username === "AliBidanov" ? true : data.is_admin === true
          setIsAdmin(isUserAdmin)

          console.log("Is admin:", isUserAdmin)
        } else {
          setIsAuthenticated(false)
          navigate("/")
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error)
      }
    }

    fetchUserInfo()

    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(localStorage.getItem("darkMode") === "true" || prefersDarkMode)
  }, [navigate, setIsAuthenticated])

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }

    localStorage.setItem("darkMode", isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    document.cookie = "session_username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsAuthenticated(false)
    navigate("/")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isAdmin={isAdmin}
      />
      <div className="dashboard-content">
        <Header
          username={username}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          handleLogout={handleLogout}
          toggleSidebar={toggleSidebar}
          isAdmin={isAdmin}
        />
        <main className="dashboard-main">
          <Routes>
            <Route path="/" element={<NotesTab />} />
            <Route path="/clusters" element={<ClustersTab />} />
            <Route path="/duplicates" element={<DuplicatesTab />} />
            <Route path="/memory-map" element={<MemoryMapTab />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel />} />}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage
