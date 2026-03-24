import { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Card from '../../components/Card.jsx'
import Loader from '../../components/Loader.jsx'
import { volunteerService } from '../../services/volunteerService.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegisteredEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState(false)
  
  const { userId } = useAuth()

  const loadEvents = async () => {
    try {
      const { data } = await volunteerService.getMyEvents()
      setEvents(data?.data || [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadEvents()
    }
  }, [userId])

  const handleWithdraw = async (eventId) => {
    setLoadingAction(true)
    try {
      await volunteerService.withdrawFromEvent(eventId)
      alert('Withdrawn successfully!')
      loadEvents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw')
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          My Registered Events
        </h1>
        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <Card title="No Registrations">
            <p className="text-xs text-muted mt-2">You haven't registered for any upcoming events yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((reg) => {
              const ev = reg.event_id
              if (!ev) return null
              
              return (
                <Card 
                  key={reg._id}
                  title={ev.title}
                  description={`${ev.eventType?.toUpperCase()} - ${ev.location?.city || 'Unknown'}`}
                >
                  <p className="mt-2 text-xs text-slate-700">{ev.description}</p>
                  <div className="mt-2 text-xs text-muted">
                    <p>Date: {new Date(ev.date).toLocaleDateString()}</p>
                    <p>Duration: {ev.durationHours} hours</p>
                    <p className="mt-2 font-medium">
                      Status: 
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                        ${reg.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${reg.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                        ${reg.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {reg.status}
                      </span>
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      onClick={() => handleWithdraw(ev._id)} 
                      disabled={loadingAction}
                      className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-400 disabled:opacity-50"
                    >
                      Withdraw Registration
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
