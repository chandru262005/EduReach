import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Loader from '../../components/Loader.jsx'
import Modal from '../../components/Modal.jsx'
import { volunteerService } from '../../services/volunteerService.js'

export default function VolunteerDashboard() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good morning')
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)

  const loadProfile = async () => {
    try {
      const { data } = await volunteerService.getProfile()
      setProfile(data?.data || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader />
        </div>
      </DashboardLayout>
    )
  }

  const hours = profile?.hoursContributed || 0
  const userName = profile?.user_id?.name || profile?.firstName || 'Chan'

  const getBadgeInfo = (h) => {
    if (h >= 50) return { name: 'Super Volunteer', color: 'text-purple-600' }
    if (h >= 30) return { name: 'Community Hero', color: 'text-indigo-600' }
    if (h >= 10) return { name: 'Rising Star', color: 'text-amber-500' }
    return { name: 'Beginner', color: 'text-slate-800' }
  }

  const badgeInfo = getBadgeInfo(hours)

  const profileStatusText = profile?.isVerified 
    ? 'Verified' 
    : profile?.idProofStatus === 'pending' 
      ? 'Pending' 
      : 'Incomplete'
      
  const profileStatusColor = profile?.isVerified 
    ? 'text-green-500' 
    : profile?.idProofStatus === 'pending' 
      ? 'text-yellow-500' 
      : 'text-red-500'

  const actionLinks = [
    { label: "Find Events", path: "/volunteer/events" },
    { label: "My Profile", path: "/volunteer/profile" },
    { label: "My Events", path: "/volunteer/my-events" }
  ]

  return (
    <DashboardLayout>
      <div className="p-6 bg-gray-50 min-h-screen rounded-xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">
            {greeting}, {userName}
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s your impact overview today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Hours</p>
            <h2 className="text-xl font-semibold mt-1">{hours} hrs</h2>
          </div>

          <div 
            onClick={() => setIsBadgeModalOpen(true)}
            className="p-4 bg-white border rounded-xl shadow-sm cursor-pointer hover:shadow-md transition group"
          >
            <p className="text-sm text-gray-500">Badge</p>
            <h2 className={`text-xl font-semibold mt-1 ${badgeInfo.color}`}>{badgeInfo.name}</h2>
            <p className="text-xs text-indigo-500 mt-1 opacity-80 group-hover:opacity-100 transition">Click for more details</p>
          </div>

          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">Profile</p>
            <h2 className={`text-xl font-semibold mt-1 ${profileStatusColor}`}>
              {profileStatusText}
            </h2>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {actionLinks.map((item) => (
            <Link to={item.path} key={item.label}>
              <div
                className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md cursor-pointer transition h-full"
              >
                <h3 className="font-medium text-slate-900">{item.label}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Click to explore
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Activity */}
        <div className="p-6 bg-white border rounded-xl shadow-sm text-center">
          <p className="text-gray-500 mb-4">
            No activity yet
          </p>
          <Link to="/volunteer/events">
            <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
              Explore Events
            </button>
          </Link>
        </div>
      </div>

      <Modal open={isBadgeModalOpen} onClose={() => setIsBadgeModalOpen(false)} title="Badge Criteria">
        <div className="mt-2 text-sm text-slate-600">
          <p className="mb-4">Earn badges by volunteering and recording your hours! Here is the breakdown:</p>
          <ul className="space-y-3">
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold text-slate-800">Beginner</span>
              <span>0 - 9 hours</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold text-amber-500">Rising Star</span>
              <span>10 - 29 hours</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold text-indigo-600">Community Hero</span>
              <span>30 - 49 hours</span>
            </li>
            <li className="flex justify-between">
              <span className="font-semibold text-purple-600">Super Volunteer</span>
              <span>50+ hours</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-indigo-50/80 rounded-lg text-sm text-indigo-900 border border-indigo-100">
            You currently have <span className="font-bold">{hours} hrs</span> and hold the <strong>{badgeInfo.name}</strong> rank.
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}
