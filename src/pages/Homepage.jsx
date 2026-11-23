import { useNavigate } from 'react-router-dom'
import '../styles/Home.css'

export default function Homepage() {
  const navigate = useNavigate()
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('skwela_user'))
  } catch {
    localStorage.removeItem('skwela_user')
  }

  function handleLogout() {
    localStorage.removeItem('skwela_user')
    navigate('/login')
  }

  const displayName = user?.name?.trim() || 'User123'

  return (
    <div className="home-page">
      <header className="home-header">
        <span className="home-brand">ESKWELA TA</span>
        <button className="home-settings" aria-label="Sign out" onClick={handleLogout}>⚙</button>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <div className="home-mascot" aria-hidden="true">
            <span className="owl">🦉</span>
          </div>
          <div className="home-speech">
            <strong>Hello, {displayName}!</strong>
            <span>“Commit to the Lord whatever you do, and He will establish your plans.”</span>
            <small>– Proverbs 16:3</small>
          </div>
          <div className="home-streak" title="Study streak">
            <span>💧</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="home-today">
          <h1>No classes today</h1>
          <p>Enjoy your break, bro.</p>
        </section>

        <button className="home-note">
          <strong>Make a study note</strong>
          <span>Upload PDF to convert into a Note</span>
        </button>

        <section className="home-section">
          <div className="home-section-title">
            <h2><span className="home-section-line"></span>CLASSES</h2>
            <strong>0/0</strong>
          </div>
          <div className="home-empty">
            <span>📚</span>
            <p>No classes today</p>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section-title">
            <h2><span className="home-section-line"></span>TASKS &amp; DEADLINES</h2>
            <strong>0/0</strong>
          </div>
          <div className="home-empty home-task-empty">
            <span>📋</span>
            <p>No tasks yet</p>
          </div>
          <button className="home-add-task">+ Add task</button>
        </section>

        <button className="home-floating-add" aria-label="Add">+</button>
      </main>

      <nav className="home-nav" aria-label="Main navigation">
        <button className="home-nav-item active" aria-label="Home">
          <span>🏠</span>
          <small>Home</small>
        </button>
        <button className="home-nav-item" aria-label="Tasks and events">
          <span>✓</span>
          <small>Tasks &amp; Events</small>
        </button>
        <button className="home-nav-item" aria-label="Schedule">
          <span>▦</span>
          <small>Schedule</small>
        </button>
        <button className="home-nav-item" aria-label="Study">
          <span>▣</span>
          <small>Study</small>
        </button>
        <button className="home-nav-item" aria-label="Diet dashboard">
          <span>♡</span>
          <small>Diet Dashboard</small>
        </button>
      </nav>
    </div>
  )
}