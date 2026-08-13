'use client';

import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Home() {
  const [formData, setFormData] = useState({
    name: 'Ali Khan',
    email: 'ali@example.com',
    message: 'Testing rate limiting on Express server!',
  });

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    rateLimited: 0,
    remaining: 'N/A',
  });
  const [activeAlert, setActiveAlert] = useState(null);

  const addLog = (status, data, headers) => {
    const remaining = headers.get('X-RateLimit-Remaining') || 'N/A';
    const limit = headers.get('X-RateLimit-Limit') || 'N/A';

    const newLog = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString(),
      status,
      message: data.message || data.error || 'No message returned',
      remaining,
      limit,
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs

    setStats((prev) => ({
      total: prev.total + 1,
      success: status === 200 ? prev.success + 1 : prev.success,
      rateLimited: status === 429 ? prev.rateLimited + 1 : prev.rateLimited,
      remaining: remaining,
    }));

    if (status === 429) {
      setActiveAlert({
        type: 'danger',
        message: `🚨 HTTP 429 Too Many Requests! ${data.message || 'Rate limit exceeded.'}`,
      });
    } else if (status === 200) {
      setActiveAlert({
        type: 'success',
        message: `✅ HTTP 200 OK: Request succeeded! (${remaining} remaining in window)`,
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const sendSingleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      addLog(res.status, data, res.headers);
    } catch (err) {
      console.error('Request failed:', err);
      addLog(500, { error: 'Failed to connect to Express backend (is backend running on port 5000?)' }, new Headers());
    } finally {
      setLoading(false);
    }
  };

  const sendBurstRequests = async (count = 5) => {
    setLoading(true);
    for (let i = 0; i < count; i++) {
      try {
        const res = await fetch(`${API_BASE_URL}/ping`, { method: 'GET' });
        const data = await res.json();
        addLog(res.status, data, res.headers);
      } catch (err) {
        addLog(500, { error: 'Backend unreachable' }, new Headers());
      }
      // Small 50ms delay between burst requests
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    setLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
    setStats({ total: 0, success: 0, rateLimited: 0, remaining: 'N/A' });
    setActiveAlert(null);
  };

  return (
    <main>
      <header className="header">
        <h1>⚡ Rate Limiting Practice Playground</h1>
        <p>Express.js Backend + Next.js Frontend (JavaScript)</p>
        <span className="badge">Backend Port: 5000 | Frontend Port: 3000</span>
      </header>

      {/* Metrics Banner */}
      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-value val-primary">{stats.total}</div>
          <div className="metric-label">Total Requests</div>
        </div>
        <div className="metric-box">
          <div className="metric-value val-success">{stats.success}</div>
          <div className="metric-label">200 OK Allowed</div>
        </div>
        <div className="metric-box">
          <div className="metric-value val-danger">{stats.rateLimited}</div>
          <div className="metric-label">429 Rate Limited</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Side: Form & Controls */}
        <div className="card">
          <h2 className="card-title">📝 Express API Form</h2>
          <form onSubmit={sendSingleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                className="form-input"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Form (1 Request)'}
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => sendBurstRequests(6)}
                disabled={loading}
                title="Sends 6 rapid ping requests to test rate limit triggers"
              >
                💥 Send Burst (6x Ping)
              </button>
            </div>
          </form>

          {activeAlert && (
            <div className={`alert alert-${activeAlert.type}`}>
              {activeAlert.message}
            </div>
          )}
        </div>

        {/* Right Side: Real-time Request Stream & Headers */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title" style={{ margin: 0 }}>📊 Live Response Monitor</h2>
            <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={clearLogs}>
              Clear Logs
            </button>
          </div>

          <div className="logs-container">
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '3rem' }}>
                No requests sent yet. Click "Submit Form" or "Send Burst" to test!
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="log-entry">
                  <div>
                    <span className={`log-status status-${log.status}`}>{log.status}</span>
                    <span style={{ marginLeft: '0.75rem', color: '#e2e8f0' }}>{log.message}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {log.time} {log.remaining !== 'N/A' && `| Rem: ${log.remaining}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Guide / Instructions Box for the User */}
      <div className="guide-box">
        <h3>💡 How to Practice Rate Limiting (Aapke liye Instructions):</h3>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
          <li>
            Open file: <code>backend/middleware/rateLimiter.js</code>
          </li>
          <li>
            Uncomment the example rate limiting code block (which limits requests to <strong>max 5 per minute</strong> per IP).
          </li>
          <li>
            Restart backend server or use <code>npm run dev</code>.
          </li>
          <li>
            Click <strong>"💥 Send Burst (6x Ping)"</strong> on this frontend — first 5 requests will pass with status <code>200 OK</code>, and the 6th request will be blocked with HTTP status <code>429 Too Many Requests</code>!
          </li>
        </ul>
      </div>
    </main>
  );
}
