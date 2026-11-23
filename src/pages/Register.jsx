import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      register({ name: form.name, email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <span className={styles.brandName}>Skwela Ta</span>
        </div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start your learning journey today</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.error} role="alert">{error}</div>}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className={styles.input}
              placeholder="Juan dela Cruz"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="juan@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.label}>Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.foot}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
