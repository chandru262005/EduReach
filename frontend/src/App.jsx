import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import DonorDashboard from './pages/donor/DonorDashboard.jsx'
import DonateMoney from './pages/donor/DonateMoney.jsx'
import DonateBooks from './pages/donor/DonateBooks.jsx'
import DonationHistory from './pages/donor/DonationHistory.jsx'
import SchoolDashboard from './pages/school/SchoolDashboard.jsx'
import SchoolProfile from './pages/school/SchoolProfile.jsx'
import AddRequirements from './pages/school/AddRequirements.jsx'
import CreateEvent from './pages/school/CreateEvent.jsx'
import SchoolEvents from './pages/school/SchoolEvents.jsx'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard.jsx'
import MyEvents from './pages/volunteer/MyEvents.jsx'
import RegisteredEvents from './pages/volunteer/RegisteredEvents.jsx'
import VolunteerProfile from './pages/volunteer/VolunteerProfile.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import PendingSchools from './pages/admin/PendingSchools.jsx'
import PendingVolunteers from './pages/admin/PendingVolunteers.jsx'
import Users from './pages/admin/Users.jsx'

function ProtectedRoute({ allowedRoles, children }) {
  const { role } = useAuth()
  if (!role) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallback =
      role === 'admin'
        ? '/admin'
        : role === 'donor'
          ? '/donor'
          : role === 'school'
            ? '/school'
            : role === 'volunteer'
              ? '/volunteer'
              : '/login'
    return <Navigate to={fallback} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donate-money"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonateMoney />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/donate-books"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonateBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/history"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonationHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/school"
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/profile"
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/requirements"
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <AddRequirements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/events/create"
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/events"
        element={
          <ProtectedRoute allowedRoles={['school']}>
            <SchoolEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/profile"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/events"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <MyEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer/my-events"
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <RegisteredEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pending-schools"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PendingSchools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pending-volunteers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PendingVolunteers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

