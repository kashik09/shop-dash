import { Navigate } from 'react-router-dom'

// Google OAuth handles both sign up and sign in
// Redirect to login page
export function SignUp() {
  return <Navigate to="/login" replace />
}
