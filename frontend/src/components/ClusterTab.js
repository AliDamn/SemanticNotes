"use client"

import { useState, useEffect } from "react"
import "./ClusterTab.css"
import React from 'react'


function ClustersTab() {
  const [clusters, setClusters] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchClusters = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8000/clusters", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch clusters")
        }

        const data = await response.json()
        setClusters(data)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching clusters:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClusters()
  }, [])

  if (isLoading) {
    return <div className="clusters-loading">Loading clusters...</div>
  }

  if (error) {
    return <div className="clusters-error">Error: {error}</div>
  }

  if (!clusters || clusters.error) {
    return (
      <div className="clusters-empty">
        <p>No clusters found or not enough notes to form clusters.</p>
      </div>
    )
  }

  return (
    <div className="clusters-tab">
      <div className="clusters-header">
        <h2>Note Clusters</h2>
        <p className="clusters-subtitle">Your notes are automatically grouped by semantic similarity</p>
      </div>

      <div className="clusters-grid">
        {Object.entries(clusters.clusters).map(([clusterId, notes]) => (
          <div key={clusterId} className="cluster-card card">
            <div className="card-header">
              <h3 className="card-title">Cluster {Number.parseInt(clusterId) + 1}</h3>
            </div>
            <div className="card-body">
              <ul className="cluster-notes-list">
                {notes.map((note) => (
                  <li key={note.id} className="cluster-note-item">
                    {note.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClustersTab
