'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, BookOpen, Trash2 } from 'lucide-react'

interface DailyLog {
  id: string
  content: string
  mood: string | null
  date: string
}

export default function DailyLogPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    content: '',
    mood: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      const response = await fetch('/api/daily-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({
          content: '',
          mood: '',
          date: new Date().toISOString().split('T')[0],
        })
        fetchLogs()
      }
    } catch (error) {
      console.error('Failed to create log:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this log?')) return
    try {
      await fetch(`/api/daily-logs/${id}`, { method: 'DELETE' })
      fetchLogs()
    } catch (error) {
      console.error('Failed to delete log:', error)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Daily Log</h1>
            <p className="text-gray-400">Record your thoughts and experiences</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {showForm && (
          <div className="bg-[#252a3a] rounded-2xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                rows={6}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Mood (e.g., happy, calm, energetic)"
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData({ ...formData, mood: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Save Entry
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
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No entries yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start journaling your daily thoughts
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-gray-400 text-sm">
                        {new Date(log.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      {log.mood && (
                        <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                          {log.mood}
                        </span>
                      )}
                    </div>
                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                      {log.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
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



