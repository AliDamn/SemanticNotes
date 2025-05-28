"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./LoginPage.css"
import React from 'react'

function LoginPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || "Login failed")
      }

      setIsAuthenticated(true)
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Semantic Notes</h1>
          <p>Your intelligent note-taking companion</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Login</h2>
            <p className="card-subtitle">Enter your username and password to access your notes</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="card-body">
              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="card-footer flex-col">
              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
              <p className="signup-link">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
