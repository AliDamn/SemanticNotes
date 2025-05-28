"use client"

import { useState, useEffect } from "react"
import "./DuplicateTab.css"
import React from 'react'

function DuplicatesTab() {
  const [duplicates, setDuplicates] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDuplicates = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8000/duplicates", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch duplicates")
        }

        const data = await response.json()
        setDuplicates(data)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching duplicates:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDuplicates()
  }, [])

  if (isLoading) {
    return <div className="duplicates-loading">Checking for duplicates...</div>
  }

  if (error) {
    return <div className="duplicates-error">Error: {error}</div>
  }

  if (!duplicates || duplicates.error || duplicates.duplicates.length === 0) {
    return (
      <div className="duplicates-empty">
        <p>No potential duplicates found.</p>
      </div>
    )
  }

  return (
    <div className="duplicates-tab">
      <div className="duplicates-header">
        <h2>Potential Duplicates</h2>
        <p className="duplicates-subtitle">Notes with high semantic similarity that might be duplicates</p>
      </div>

      <div className="duplicates-list">
        {duplicates.duplicates.map((pair, index) => (
          <div key={index} className="duplicate-card card">
            <div className="card-header">
              <h3 className="card-title">Similarity: {(pair.similarity * 100).toFixed(1)}%</h3>
            </div>
            <div className="card-body">
              <div className="duplicate-pair">
                <div className="duplicate-note">
                  <div className="duplicate-note-header">Note #{pair.note1.id}</div>
                  <div className="duplicate-note-content">{pair.note1.text}</div>
                </div>
                <div className="duplicate-note">
                  <div className="duplicate-note-header">Note #{pair.note2.id}</div>
                  <div className="duplicate-note-content">{pair.note2.text}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DuplicatesTab
