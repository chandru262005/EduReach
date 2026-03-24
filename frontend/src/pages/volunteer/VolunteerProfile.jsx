import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import Card from '../../components/Card.jsx'
import Loader from '../../components/Loader.jsx'
import { volunteerService } from '../../services/volunteerService.js'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Flexible']
const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
  'Any',
]

export default function VolunteerProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const isEditing = searchParams.get('mode') === 'edit'

  // Form details
  const [name, setName] = useState('')
  const [email, setEmail] = useState('') 
  const [phone, setPhone] = useState('')
  const [expertise, setExpertise] = useState('')
  const [skills, setSkills] = useState('')
  
  // Array of availability objects
  const [availability, setAvailability] = useState([])

  const loadProfile = async () => {
    try {
      const { data } = await volunteerService.getProfile()
      const p = data?.data
      setProfile(p || null)
      if (p) {
        setName(p.user_id?.name || '')
        setEmail(p.user_id?.email || '')
        setPhone(p.user_id?.phone || '')
        setExpertise(p.expertise?.join(', ') || '')
        setSkills(p.skills?.join(', ') || '')
        setAvailability(p.availability?.length ? p.availability : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleAddAvailability = () => {
    setAvailability([...availability, { day: 'Flexible', timeSlot: 'Any' }])
  }

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...availability]
    updated[index][field] = value
    setAvailability(updated)
  }

  const handleRemoveAvailability = (index) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const parsedExpertise = expertise.split(',').map(s => s.trim()).filter(Boolean)
      const parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean)
      
      await volunteerService.updateProfile({ 
        name, 
        phone,
        expertise: parsedExpertise, 
        skills: parsedSkills, 
        availability 
      })
      alert('Profile details updated successfully!')
      setSearchParams({ mode: 'view' })
      loadProfile()
    } catch (err) {
      alert('Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadId = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload first.')
      return
    }

    setUpdating(true)
    try {
      const formData = new FormData()
      formData.append('idProof', selectedFile)

      await volunteerService.uploadIdProof(formData)
      alert('ID Proof Uploaded and pending verification!')
      setSelectedFile(null)
      loadProfile()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload ID.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            {isEditing ? 'Edit Profile' : 'My Profile'}
          </h1>
          <button
            onClick={() => setSearchParams({ mode: isEditing ? 'view' : 'edit' })}
            className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isEditing 
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500'
            }`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
        
        {loading ? (
          <Loader />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card title="Personal & Volunteer Details">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-5 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Full Name</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</label>
                        <input
                          type="email"
                          disabled
                          className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 text-slate-500 px-3 py-2.5 text-sm cursor-not-allowed"
                          value={email}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Phone Number</label>
                      <input
                        type="text"
                        className="mt-1 block w-full md:w-1/2 rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    
                    <hr className="my-4 border-slate-100" />

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Expertise</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                        placeholder="Science, Mentoring, Event Organization"
                      />
                      <p className="mt-1 text-xs text-slate-500">Comma separated subjects or domains</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Skills</label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="Math, English, Art, Leadership"
                      />
                      <p className="mt-1 text-xs text-slate-500">Comma separated skills</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={updating}
                        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                      >
                        {updating ? 'Saving...' : 'Save Profile Details'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{email || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{phone || '-'}</p>
                    </div>
                    
                    <hr className="my-2 border-slate-100" />

                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expertise</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {expertise ? (
                          <span className="inline-flex gap-2 flex-wrap">
                            {expertise.split(',').map((item, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                {item.trim()}
                              </span>
                            ))}
                          </span>
                        ) : 'No expertise listed'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Skills</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {skills ? (
                          <span className="inline-flex gap-2 flex-wrap">
                            {skills.split(',').map((item, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                {item.trim()}
                              </span>
                            ))}
                          </span>
                        ) : 'No skills listed'}
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Availability Schedule">
                <div className="pt-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Your preferred slots</p>
                      {availability.length > 0 ? (
                        availability.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <select
                              value={slot.day}
                              onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                              className="block w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select
                              value={slot.timeSlot}
                              onChange={(e) => handleAvailabilityChange(index, 'timeSlot', e.target.value)}
                              className="block flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveAvailability(index)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                              title="Remove slot"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No availability slots added yet.</p>
                      )}
                      <button
                        type="button"
                        onClick={handleAddAvailability}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Time Slot
                      </button>
                    </div>
                  ) : (
                    <div>
                      {availability.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availability.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-indigo-900 shadow-sm">
                              <span className="font-semibold text-sm">{slot.day}</span>
                              <span className="text-indigo-300">|</span>
                              <span className="text-sm">{slot.timeSlot}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No availability specified.</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Verification Status">
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${profile?.isVerified ? 'bg-teal-100 text-teal-600' : 'bg-amber-100 text-amber-600'}`}>
                      {profile?.isVerified ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {profile?.isVerified ? 'Verified Account' : 'Action Required'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {profile?.isVerified ? 'You have full access.' : 'Your identity is pending.'}
                      </p>
                    </div>
                  </div>
                  
                  {!profile?.isVerified && profile?.idProofStatus !== 'pending' && profile?.idProofStatus !== 'approved' && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs tracking-tight text-slate-600 mb-3">
                        Upload a valid government-issued ID proof to complete your verification and get approved by the administrator. (PNG, JPG, PDF up to 5MB)
                      </p>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileChange}
                        className="mb-3 block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                        "
                      />
                      <button 
                        onClick={handleUploadId}
                        disabled={updating || !selectedFile}
                        className="w-full rounded-md border border-indigo-600 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                      >
                        {updating ? 'Uploading...' : 'Upload ID Document'}
                      </button>
                    </div>
                  )}

                  {profile?.idProofStatus === 'pending' && !profile?.isVerified && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Verification Pending</h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Your ID proof has been uploaded successfully and is currently under review by an administrator. Please check back later.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile?.idProofStatus === 'rejected' && !profile?.isVerified && (
                     <div className="mt-4 border-t border-slate-100 pt-4">
                     <p className="text-xs tracking-tight text-red-600 mb-3 font-medium">
                       Your previous ID submission was rejected. Please upload a clear and valid document.
                     </p>
                     <input 
                       type="file" 
                       accept="image/png, image/jpeg, application/pdf"
                       onChange={handleFileChange}
                       className="mb-3 block w-full text-sm text-slate-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-indigo-50 file:text-indigo-700
                         hover:file:bg-indigo-100
                       "
                     />
                     <button 
                       onClick={handleUploadId}
                       disabled={updating || !selectedFile}
                       className="w-full rounded-md border border-indigo-600 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                     >
                       {updating ? 'Uploading...' : 'Re-Upload ID Document'}
                     </button>
                   </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
