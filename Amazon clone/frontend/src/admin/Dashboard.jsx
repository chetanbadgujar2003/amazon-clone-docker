import React from 'react'

export default function Dashboard() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="cards-grid">
        <div className="card">Total Products<br /><strong>--</strong></div>
        <div className="card">Orders<br /><strong>--</strong></div>
        <div className="card">Users<br /><strong>--</strong></div>
      </div>
    </div>
  )
}
