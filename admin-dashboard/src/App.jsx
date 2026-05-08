import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('ums_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo mode - accept any credentials
    const mockUser = {
      id: '1',
      email: email,
      role: 'ADMIN',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        department: { name: 'Administration' }
      }
    };
    localStorage.setItem('ums_user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('ums_user');
    setUser(null);
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>;

  return children({ user, login, logout });
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {({ user, login, logout }) => (
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
            <Route path="/*" element={
              user ? (
                <div className="flex h-screen">
                  <Sidebar user={user} onLogout={logout} />
                  <main className="flex-1 overflow-auto p-6 bg-slate-950">
                    <Dashboard />
                  </main>
                </div>
              ) : <Navigate to="/login" />
            } />
          </Routes>
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}
