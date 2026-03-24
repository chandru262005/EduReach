import { Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { logout, role } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="flex items-center justify-between border-b bg-surface/80 px-4 py-3 shadow-sm backdrop-blur-sm lg:px-6">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-muted">
          EduReach
        </span>
        <span className="text-sm font-medium capitalize text-slate-900">
          {role ? `${role} dashboard` : 'Dashboard'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 relative z-10"
          >
            <User className="h-3.5 w-3.5" />
            <span>Account</span>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <Link 
                to={`/${role === 'admin' || role === 'donor' || !role ? role : role + '/profile?mode=view'}`} 
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                View Profile
              </Link>
              <Link 
                to={`/${role === 'admin' || role === 'donor' || !role ? role : role + '/profile?mode=edit'}`} 
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

