import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CaptureProvider } from './context/CaptureContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Capture from './pages/Capture'
import NewPost from './pages/NewPost'
import MyCapsule from './pages/MyCapsule'
import CapsuleMonth from './pages/CapsuleMonth'
import Profile from './pages/Profile'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CaptureProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/new-post" element={<NewPost />} />
            <Route path="/capsule" element={<MyCapsule />} />
            <Route path="/capsule/:year/:month" element={<CapsuleMonth />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CaptureProvider>
    </AuthProvider>
  )
}

export default App
