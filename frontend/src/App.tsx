import { useEffect, useState } from 'react'
import { getHealth, type ApiHealth } from './lib/api'
import './App.css'

function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true

    async function loadHealth() {
      try {
        setIsLoading(true)
        const result = await getHealth()

        if (isCurrent) {
          setHealth(result)
          setError(null)
        }
      } catch (caught) {
        if (isCurrent) {
          setHealth(null)
          setError(caught instanceof Error ? caught.message : 'Unable to reach the API')
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadHealth()

    return () => {
      isCurrent = false
    }
  }, [])

  const databaseConnected = health?.database.connected ?? false

  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="page-title">
        <div className="status-header">
          <div>
            <p className="eyebrow">HospitalRun Platform</p>
            <h1 id="page-title">Application connection status</h1>
          </div>
          <span className={databaseConnected ? 'badge badge-ok' : 'badge badge-warn'}>
            {databaseConnected ? 'Connected' : 'Needs attention'}
          </span>
        </div>

        <div className="connection-grid">
          <article className="connection-card">
            <span className="label">Frontend</span>
            <strong>React + Vite</strong>
            <p>Served by Caddy and calling Laravel through relative API routes.</p>
          </article>
          <article className="connection-card">
            <span className="label">Backend</span>
            <strong>{health?.service ?? 'Laravel API'}</strong>
            <p>{isLoading ? 'Checking API availability...' : error ?? `Environment: ${health?.environment}`}</p>
          </article>
          <article className="connection-card">
            <span className="label">Database</span>
            <strong>{databaseConnected ? 'MySQL connected' : 'MySQL not confirmed'}</strong>
            <p>
              {health
                ? `${health.database.connection} / ${health.database.database}`
                : 'Waiting for backend health response.'}
            </p>
          </article>
        </div>

        <div className="details">
          <div>
            <span className="label">API endpoint</span>
            <code>/api/health</code>
          </div>
          <div>
            <span className="label">Last checked</span>
            <code>{health?.timestamp ?? 'Not available'}</code>
          </div>
        </div>

        {error ? <p className="error-message">{error}</p> : null}
      </section>
    </main>
  )
}

export default App
