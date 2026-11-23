import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('skwela_user')
    return saved ? JSON.parse(saved) : null
  })

  function register({ name, email, password }) {
    const users = JSON.parse(localStorage.getItem('skwela_users') || '[]')
    if (users.find((u) => u.email === email)) {
      throw new Error('An account with that email already exists.')
    }
    const newUser = { id: Date.now(), name, email, password }
    users.push(newUser)
    localStorage.setItem('skwela_users', JSON.stringify(users))
    const session = { id: newUser.id, name: newUser.name, email: newUser.email }
    localStorage.setItem('skwela_user', JSON.stringify(session))
    setUser(session)
  }

  function login({ email, password }) {
    const users = JSON.parse(localStorage.getItem('skwela_users') || '[]')
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) throw new Error('Invalid email or password.')
    const session = { id: found.id, name: found.name, email: found.email }
    localStorage.setItem('skwela_user', JSON.stringify(session))
    setUser(session)
  }

  function logout() {
    localStorage.removeItem('skwela_user')
    setUser(null)
  }

  function resetPassword({ email, newPassword }) {
    const users = JSON.parse(localStorage.getItem('skwela_users') || '[]')
    const idx = users.findIndex((u) => u.email === email)
    if (idx === -1) throw new Error('No account found with that email.')
    users[idx].password = newPassword
    localStorage.setItem('skwela_users', JSON.stringify(users))
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
