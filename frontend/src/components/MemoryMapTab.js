"use client"

import { useState, useEffect, useRef } from "react"
import "./MemoryMapTab.css"
import React from 'react'

function MemoryMapTab() {
  const [memoryMap, setMemoryMap] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const fetchMemoryMap = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("http://localhost:8000/memory-map", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch memory map")
        }

        const data = await response.json()
        setMemoryMap(data)
      } catch (err) {
        setError(err.message)
        console.error("Error fetching memory map:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemoryMap()
  }, [])

  useEffect(() => {
    if (!memoryMap || memoryMap.error || !svgRef.current) return

    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild)
    }

    import("d3").then((d3) => {
      const svg = d3.select(svgRef.current)
      const width = svgRef.current.clientWidth
      const height = 500

      svg.attr("width", width).attr("height", height)

      const simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3
            .forceLink()
            .id((d) => d.id)
            .distance(100),
        )
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(30))

      // Prepare the data
      const nodes = memoryMap.nodes.map((node) => ({ ...node }))
      const links = memoryMap.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
      }))


      const link = svg
        .append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke-width", (d) => d.weight * 3)
        .attr("stroke", "rgba(100, 100, 100, 0.5)")

      const node = svg
        .append("g")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))


      node.append("circle").attr("r", 20).attr("fill", "#3b82f6").attr("stroke", "#2563eb").attr("stroke-width", 2)


      node
        .append("text")
        .text((d) => {
          const shortText = d.text.length > 15 ? d.text.substring(0, 15) + "..." : d.text
          return shortText
        })
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("fill", "white")
        .style("font-size", "10px")


      node.append("title").text((d) => d.text)


      simulation.nodes(nodes).on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y)

        node.attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      })

      simulation.force("link").links(links)


      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }
    })
  }, [memoryMap])

  if (isLoading) {
    return <div className="memory-map-loading">Generating memory map...</div>
  }

  if (error) {
    return <div className="memory-map-error">Error: {error}</div>
  }

  if (!memoryMap || memoryMap.error) {
    return (
      <div className="memory-map-empty">
        <p>Not enough notes to generate a memory map.</p>
      </div>
    )
  }

  return (
    <div className="memory-map-tab">
      <div className="memory-map-header">
        <h2>Memory Map</h2>
        <p className="memory-map-subtitle">Visual representation of connections between your notes</p>
      </div>

      <div className="memory-map-container">
        <svg ref={svgRef} className="memory-map-svg"></svg>
      </div>
    </div>
  )
}

export default MemoryMapTab
