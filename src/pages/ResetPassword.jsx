import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/auth.css'

const STEP = { EMAIL: 'email', NEW_PASSWORD: 'new_password', DONE: 'done' }

export default function ResetPassword() {
  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }
    // In a real app this would send an email. Here we verify the account exists.
    let users = []
    try {
      const storedUsers = JSON.parse(localStorage.getItem('skwela_users') || '[]')
      users = Array.isArray(storedUsers) ? storedUsers : []
    } catch {
      users = []
    }
    if (!users.find((u) => typeof u.email === 'string' && u.email.trim().toLowerCase() === normalizedEmail)) {
      setError('No account found with that email.')
      return
    }
    setEmail(normalizedEmail)
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
      let users = []
      try {
        const storedUsers = JSON.parse(localStorage.getItem('skwela_users') || '[]')
        users = Array.isArray(storedUsers) ? storedUsers : []
      } catch {
        users = []
      }
      const index = users.findIndex((user) =>
        typeof user.email === 'string' &&
        user.email.trim().toLowerCase() === email
      )
      if (index === -1) throw new Error('No account found with that email.')
      users[index].password = form.newPassword
      localStorage.setItem('skwela_users', JSON.stringify(users))
      setStep(STEP.DONE)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <span className="brandIcon">🎓</span>
          <span className="brandName">Skwela Ta</span>
        </div>

        {step === STEP.EMAIL && (
          <>
            <h1 className="title">Reset your password</h1>
            <p className="subtitle">Enter your email and we'll set a new password</p>
            <form onSubmit={handleEmailSubmit} className="form" noValidate>
              {error && <div className="error" role="alert">{error}</div>}
              <div className="field">
                <label htmlFor="reset-email" className="label">Email address</label>
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="juan@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                />
              </div>
              <button type="submit" className="btn">Continue</button>
            </form>
          </>
        )}

        {step === STEP.NEW_PASSWORD && (
          <>
            <h1 className="title">Set a new password</h1>
            <p className="subtitle">Choose a strong password for <strong>{email}</strong></p>
            <form onSubmit={handlePasswordSubmit} className="form" noValidate>
              {error && <div className="error" role="alert">{error}</div>}
              <div className="field">
                <label htmlFor="reset-new-password" className="label">New password</label>
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="At least 8 characters"
                  value={form.newPassword}
                  onChange={(e) => { setForm((f) => ({ ...f, newPassword: e.target.value })); setError('') }}
                />
              </div>
              <div className="field">
                <label htmlFor="reset-confirm-password" className="label">Confirm new password</label>
                <input
                  id="reset-confirm-password"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={(e) => { setForm((f) => ({ ...f, confirm: e.target.value })); setError('') }}
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}

        {step === STEP.DONE && (
          <div className="successBlock">
            <div className="successIcon">✓</div>
            <h1 className="title">Password updated</h1>
            <p className="subtitle">Your password has been changed successfully.</p>
            <Link to="/login" className="btn" style={{ display: 'block', textAlign: 'center', marginTop: '24px' }}>
              Back to sign in
            </Link>
          </div>
        )}

        {step !== STEP.DONE && (
          <p className="foot">
            Remembered it?{' '}
            <Link to="/login" className="link">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  )
}