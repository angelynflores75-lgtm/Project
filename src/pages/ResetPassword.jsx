import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Auth.module.css'

const STEP = { EMAIL: 'email', NEW_PASSWORD: 'new_password', DONE: 'done' }

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    // In a real app this would send an email. Here we verify the account exists.
    const users = JSON.parse(localStorage.getItem('skwela_users') || '[]')
    if (!users.find((u) => u.email === email)) {
      setError('No account found with that email.')
      return
    }
    setStep(STEP.NEW_PASSWORD)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      resetPassword({ email, newPassword: form.newPassword })
      setStep(STEP.DONE)
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

        {step === STEP.EMAIL && (
          <>
            <h1 className={styles.title}>Reset your password</h1>
            <p className={styles.subtitle}>Enter your email and we'll set a new password</p>
            <form onSubmit={handleEmailSubmit} className={styles.form} noValidate>
              {error && <div className={styles.error} role="alert">{error}</div>}
              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={styles.input}
                  placeholder="juan@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                />
              </div>
              <button type="submit" className={styles.btn}>Continue</button>
            </form>
          </>
        )}

        {step === STEP.NEW_PASSWORD && (
          <>
            <h1 className={styles.title}>Set a new password</h1>
            <p className={styles.subtitle}>Choose a strong password for <strong>{email}</strong></p>
            <form onSubmit={handlePasswordSubmit} className={styles.form} noValidate>
              {error && <div className={styles.error} role="alert">{error}</div>}
              <div className={styles.field}>
                <label htmlFor="newPassword" className={styles.label}>New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={styles.input}
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={(e) => { setForm((f) => ({ ...f, newPassword: e.target.value })); setError('') }}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirm" className={styles.label}>Confirm new password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={styles.input}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError('') }}
                />
              </div>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}

        {step === STEP.DONE && (
          <div className={styles.successBlock}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Password updated</h1>
            <p className={styles.subtitle}>Your password has been changed successfully.</p>
            <Link to="/login" className={styles.btn} style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>
              Back to sign in
            </Link>
          </div>
        )}

        {step !== STEP.DONE && (
          <p className={styles.foot}>
            Remembered it?{' '}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
