import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('saas-task-token') || null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('saas-task-token', token);
      const storedUser = localStorage.getItem('saas-task-user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
    } else {
      localStorage.removeItem('saas-task-token');
      localStorage.removeItem('saas-task-user');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  async function handleResponse(res) {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Authentication request failed.');
    }
    return body.data;
  }

  async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('saas-task-user', JSON.stringify(data.user));
    return data.user;
  }

  async function signup(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await handleResponse(res);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('saas-task-user', JSON.stringify(data.user));
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('saas-task-token');
    localStorage.removeItem('saas-task-user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
