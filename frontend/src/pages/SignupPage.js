"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./SignupPage.css"

function SignupPage({ setIsAuthenticated }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)

    try {
      console.log("Attempting to sign up with:", username)
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Signup error response:", response.status, errorData)
        throw new Error(errorData.detail || `Signup failed with status: ${response.status}`)
      }

      const loginResponse = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      if (!loginResponse.ok) {
        throw new Error("Login after signup failed")
      }

      setIsAuthenticated(true)
    } catch (err) {
      console.error("Signup error details:", err)
      setError(err.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join Semantic Notes today</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Create an account</h2>
            <p className="card-subtitle">Enter your details to create a new account</p>
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
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="card-footer flex-col">
              <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </button>
              <p className="login-link">
                Already have an account? <Link to="/">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage

