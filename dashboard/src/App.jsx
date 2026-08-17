import React, { useState, useEffect } from 'react';

function App() {
  const [logs, setLogs] = useState([]);
  const [apiKey, setApiKey] = useState('dev-key-123');
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/telemetry');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch telemetry logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const testEndpoint = async (endpoint) => {
    try {
      const res = await fetch(`http://localhost:8000/services/${endpoint}?apiKey=${apiKey}`);
      const data = await res.json();
      setStatus(res.status);
      setResponse(data);
      fetchLogs();
    } catch (err) {
      setStatus(500);
      setResponse({ error: "Gateway Unreachable or Offline" });
    }
  };

  const totalReqs = logs.length;
  const successReqs = logs.filter(
    (l) => (l.status >= 200 && l.status < 300) || l.status === 304
  ).length;
  const avgLatency = totalReqs > 0 
    ? (logs.reduce((acc, curr) => acc + (curr.latency || 0), 0) / totalReqs).toFixed(1) 
    : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>⚡ Enterprise API Gateway Dashboard</h1>
        <p>Real-time Proxy Traffic, Key Validation & Telemetry Audit</p>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.card}>
          <h3>TOTAL TRAFFIC</h3>
          <p style={styles.metricVal}>{totalReqs} reqs</p>
        </div>
        <div style={styles.card}>
          <h3>SUCCESSFUL REQUESTS</h3>
          <p style={{ ...styles.metricVal, color: '#38a169' }}>{successReqs}</p>
        </div>
        <div style={styles.card}>
          <h3>AVG LATENCY</h3>
          <p style={{ ...styles.metricVal, color: '#3182ce' }}>{avgLatency} ms</p>
        </div>
      </div>

      <div style={styles.section}>
        <h2>🧪 API Gateway Endpoint Tester</h2>
        <div style={{ marginBottom: '15px' }}>
          <label><strong>API Key Header / Query: </strong></label>
          <input 
            type="text" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
            style={styles.input} 
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button style={styles.btnPrimary} onClick={() => testEndpoint('users')}>Test Users Service (5001)</button>
          <button style={styles.btnPrimary} onClick={() => testEndpoint('orders')}>Test Orders Service (5002)</button>
          <button style={styles.btnDanger} onClick={() => setApiKey('INVALID_KEY')}>Set Invalid Key (Simulate 401)</button>
        </div>

        {response && (
          <div style={styles.responseBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <strong>Gateway Response:</strong>
              <span style={{ 
                color: (status >= 200 && status < 300) || status === 304 ? '#48bb78' : '#e53e3e', 
                fontWeight: 'bold' 
              }}>
                Status: {status}
              </span>
            </div>
            <pre style={styles.code}>{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>📜 Live Request Audit Logs (`telemetry.db`)</h2>
          <button style={styles.btnSecondary} onClick={fetchLogs}>🔄 Refresh Logs</button>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Timestamp</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Path</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Latency</th>
              <th style={styles.th}>API Key</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={styles.td}>{log.id}</td>
                <td style={styles.td}>{log.timestamp}</td>
                <td style={styles.td}><strong>{log.method}</strong></td>
                <td style={styles.td}>{log.path}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: '#fff',
                    backgroundColor: (log.status >= 200 && log.status < 300) || log.status === 304 ? '#38a169' : log.status === 401 ? '#e53e3e' : '#dd6b20',
                    fontSize: '12px'
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={styles.td}>{log.latency} ms</td>
                <td style={styles.td}><code>{log.apiKey}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    padding: '30px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f7fafc',
    color: '#2d3748',
    boxSizing: 'border-box',
  },
  header: {
    backgroundColor: '#1a202c',
    color: '#fff',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  metricVal: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  section: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #cbd5e0',
    marginLeft: '10px',
  },
  btnPrimary: {
    backgroundColor: '#3182ce',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnDanger: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    border: '1px solid #cbd5e0',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  responseBox: {
    backgroundColor: '#2d3748',
    color: '#fff',
    padding: '15px',
    borderRadius: '6px',
  },
  code: {
    margin: 0,
    fontFamily: 'monospace',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px',
    borderBottom: '2px solid #e2e8f0',
    backgroundColor: '#f7fafc',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #e2e8f0',
  },
};

export default App;