import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import CreateJob from './pages/CreateJob'
import JobDetail from './pages/JobDetail'
import InvoiceView from './pages/InvoiceView'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {session && <Navbar />}
      <Routes>
        <Route 
          path="/" 
          element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/jobs" 
          element={session ? <Jobs /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/login" 
          element={!session ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/jobs/new" 
          element={session ? <CreateJob /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/jobs/:id" 
          element={session ? <JobDetail /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/jobs/:id/invoice" 
          element={session ? <InvoiceView /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={session ? <Profile /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </div>
  )
}

export default App
