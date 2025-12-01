'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, Dumbbell, Trash2, Edit2 } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  type: string
  duration: number | null
  calories: number | null
  notes: string | null
  date: string
}

export default function ExercisePage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'cardio',
    duration: '',
    calories: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchExercises()
  }, [])

  async function fetchExercises() {
    try {
      const response = await fetch('/api/exercises')
      if (response.ok) {
        const data = await response.json()
        setExercises(data.exercises)
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingExercise ? `/api/exercises/${editingExercise}` : '/api/exercises'
      const method = editingExercise ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          calories: formData.calories ? parseInt(formData.calories) : null,
        }),
      })
      if (response.ok) {
        setShowForm(false)
        setEditingExercise(null)
        setFormData({
          name: '',
          type: 'cardio',
          duration: '',
          calories: '',
          notes: '',
          date: new Date().toISOString().split('T')[0],
        })
        fetchExercises()
      }
    } catch (error) {
      console.error('Failed to save exercise:', error)
    }
  }

  function handleEdit(exercise: Exercise) {
    setEditingExercise(exercise.id)
    setFormData({
      name: exercise.name,
      type: exercise.type,
      duration: exercise.duration?.toString() || '',
      calories: exercise.calories?.toString() || '',
      notes: exercise.notes || '',
      date: new Date(exercise.date).toISOString().split('T')[0],
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this exercise?')) return
    try {
      await fetch(`/api/exercises/${id}`, { method: 'DELETE' })
      fetchExercises()
    } catch (error) {
      console.error('Failed to delete exercise:', error)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Exercise</h1>
            <p className="text-gray-400">Track your workouts and activities</p>
          </div>
          <button
            onClick={() => {
              setEditingExercise(null)
              setFormData({
                name: '',
                type: 'cardio',
                duration: '',
                calories: '',
                notes: '',
                date: new Date().toISOString().split('T')[0],
              })
              setShowForm(!showForm)
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Exercise
          </button>
        </div>

        {showForm && (
          <div className="bg-[#252a3a] rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingExercise ? 'Edit Exercise' : 'New Exercise'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Exercise Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="number"
                  placeholder="Calories burned"
                  value={formData.calories}
                  onChange={(e) =>
                    setFormData({ ...formData, calories: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <textarea
                placeholder="Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg"
                >
                  {editingExercise ? 'Update' : 'Add'} Exercise
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingExercise(null)
                    setFormData({
                      name: '',
                      type: 'cardio',
                      duration: '',
                      calories: '',
                      notes: '',
                      date: new Date().toISOString().split('T')[0],
                    })
                  }}
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
        ) : exercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No exercises logged yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start tracking your workouts
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {exercise.name}
                      </h3>
                      <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                        {exercise.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      {exercise.duration && (
                        <span>⏱️ {exercise.duration} min</span>
                      )}
                      {exercise.calories && (
                        <span>🔥 {exercise.calories} cal</span>
                      )}
                      <span>
                        {new Date(exercise.date).toLocaleDateString()}
                      </span>
                    </div>
                    {exercise.notes && (
                      <p className="text-gray-300 mt-3">{exercise.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exercise)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthLayout>
  )
}



