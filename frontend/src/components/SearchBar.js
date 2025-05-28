"use client"

import { useState } from "react"
import "./SearchBar.css"
import React from 'react'

function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(query)}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setResults(data.results || [])
      setIsModalOpen(true)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="search"
          className="search-input"
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary search-button" disabled={isSearching || !query.trim()}>
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>

      {isModalOpen && (
        <div className="search-modal-backdrop" onClick={closeModal}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h3>Search Results</h3>
              <button className="search-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="search-modal-content">
              {results.length === 0 ? (
                <p className="search-no-results">No results found for "{query}"</p>
              ) : (
                results.map((result) => (
                  <div key={result.id} className="search-result-card">
                    <div className="search-result-header">
                      <span className="search-result-id">Note #{result.id}</span>
                      <span className="search-result-score">Score: {(result.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="search-result-text">{result.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
