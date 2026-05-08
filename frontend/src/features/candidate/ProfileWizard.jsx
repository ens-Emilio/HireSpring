import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../lib/api'

export default function CandidateProfile() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/candidates/me').then((r) => r.data),
  })

  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    bio: '',
    location: '',
    salaryExpectation: '',
    currency: 'USD',
    skills: '',
    remote: false,
    jobTypes: [],
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        salaryExpectation: profile.salaryExpectation || '',
        currency: profile.currency || 'USD',
        skills: profile.skills?.join(', ') || '',
        remote: profile.remote || false,
        jobTypes: profile.jobTypes || [],
      })
    }
  }, [profile])

  const mutation = useMutation({
    mutationFn: (data) => api.put('/candidates/me', data),
    onSuccess: () => toast.success('Profile updated!'),
    onError: () => toast.error('Failed to update profile'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  if (profileLoading) {
    return <div className="max-w-2xl mx-auto card animate-pulse">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="input-field"
            placeholder="e.g. Full Stack Developer | React & Node.js"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input-field"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Salary Expectation</label>
            <input
              type="number"
              value={formData.salaryExpectation}
              onChange={(e) => setFormData({ ...formData, salaryExpectation: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="input-field"
            placeholder="Java, Spring Boot, React"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.remote}
            onChange={(e) => setFormData({ ...formData, remote: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm">Open to remote work</label>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
