import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🎓</span>
            <span className={styles.brandName}>Skwela Ta</span>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.avatar} title={user?.name}>{initials}</div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcome}>
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>You're signed in as <strong>{user?.email}</strong></p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📚</div>
            <h2>My Courses</h2>
            <p>Continue where you left off</p>
            <span className={styles.badge}>0 enrolled</span>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>📝</div>
            <h2>Assignments</h2>
            <p>View upcoming tasks and deadlines</p>
            <span className={styles.badge}>0 pending</span>
          </div>
          <div className={styles.card}>
            <div className={styles.cardIcon}>🏆</div>
            <h2>Achievements</h2>
            <p>Track your progress and badges</p>
            <span className={styles.badge}>0 earned</span>
          </div>
        </div>
      </main>
    </div>
  )
}
