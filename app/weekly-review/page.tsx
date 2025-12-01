'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, Calendar, Trash2 } from 'lucide-react'

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  achievements: string | null
  challenges: string | null
  goals: string | null
  notes: string | null
}

export default function WeeklyReviewPage() {
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    weekStart: '',
    weekEnd: '',
    achievements: '',
    challenges: '',
    goals: '',
    notes: '',
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  async function fetchReviews() {
    try {
      const response = await fetch('/api/weekly-reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/weekly-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          weekStart: '',
          weekEnd: '',
          achievements: '',
          challenges: '',
          goals: '',
          notes: '',
        })
        fetchReviews()
      }
    } catch (error) {
      console.error('Failed to create review:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return
    try {
      await fetch(`/api/weekly-reviews/${id}`, { method: 'DELETE' })
      fetchReviews()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Weekly Review</h1>
            <p className="text-gray-400">Reflect on your week</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Review
          </button>
        </div>

        {showForm && (
          <div className="bg-[#252a3a] rounded-2xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  placeholder="Week Start"
                  value={formData.weekStart}
                  onChange={(e) =>
                    setFormData({ ...formData, weekStart: e.target.value })
                  }
                  required
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="date"
                  placeholder="Week End"
                  value={formData.weekEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, weekEnd: e.target.value })
                  }
                  required
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <textarea
                placeholder="Achievements"
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
                rows={3}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <textarea
                placeholder="Challenges"
                value={formData.challenges}
                onChange={(e) =>
                  setFormData({ ...formData, challenges: e.target.value })
                }
                rows={3}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <textarea
                placeholder="Goals for Next Week"
                value={formData.goals}
                onChange={(e) =>
                  setFormData({ ...formData, goals: e.target.value })
                }
                rows={3}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <textarea
                placeholder="Additional Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Save Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-white">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No reviews yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start your weekly reflection
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">
                        {new Date(review.weekStart).toLocaleDateString()} -{' '}
                        {new Date(review.weekEnd).toLocaleDateString()}
                      </span>
                    </div>
                    {review.achievements && (
                      <div className="mb-4">
                        <h4 className="text-green-400 font-semibold mb-2">
                          Achievements
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {review.achievements}
                        </p>
                      </div>
                    )}
                    {review.challenges && (
                      <div className="mb-4">
                        <h4 className="text-orange-400 font-semibold mb-2">
                          Challenges
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {review.challenges}
                        </p>
                      </div>
                    )}
                    {review.goals && (
                      <div className="mb-4">
                        <h4 className="text-yellow-400 font-semibold mb-2">
                          Goals for Next Week
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {review.goals}
                        </p>
                      </div>
                    )}
                    {review.notes && (
                      <div>
                        <h4 className="text-gray-400 font-semibold mb-2">
                          Notes
                        </h4>
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {review.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-400 hover:text-red-300 p-2 ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthLayout>
  )
}



