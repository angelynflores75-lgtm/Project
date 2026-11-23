import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/loading.css'

export default function LoadingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <main className="loading-page" aria-label=" Loading Skwela Taaaaaaa">
      <div className="loading-brand">
        <img className="loading-logo" src="/owl-logo.png" alt="Skwela Ta owl mascot" />
        <h1>Skwela Ta</h1>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  )
}