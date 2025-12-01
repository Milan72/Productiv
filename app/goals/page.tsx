'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, Target, Trash2, TrendingUp, Calendar, CheckCircle, Lightbulb, ChevronRight, Edit2 } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string | null
  targetDate: string | null
  status: string
  progress: number
  priority?: string | null
  timeframe?: string | null
  currentValue?: number | null
  targetValue?: number | null
  okrs: Array<{
    id: string
    title: string
    progress: number
  }>
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    timeframe: 'quarterly',
    progress: 0,
    currentValue: '',
    targetValue: '',
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals)
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || null,
        targetDate: formData.targetDate || null,
        priority: formData.priority,
        timeframe: formData.timeframe,
        progress: formData.progress,
      }

      if (formData.currentValue && formData.targetValue) {
        payload.currentValue = parseFloat(formData.currentValue)
        payload.targetValue = parseFloat(formData.targetValue)
      }

      const url = editingGoal ? `/api/goals/${editingGoal}` : '/api/goals'
      const method = editingGoal ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setShowForm(false)
        setEditingGoal(null)
        setFormData({
          title: '',
          description: '',
          targetDate: '',
          priority: 'medium',
          timeframe: 'quarterly',
          progress: 0,
          currentValue: '',
          targetValue: '',
        })
        fetchGoals()
      }
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  function handleEdit(goal: Goal) {
    setEditingGoal(goal.id)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      priority: goal.priority || 'medium',
      timeframe: goal.timeframe || 'quarterly',
      progress: goal.progress,
      currentValue: goal.currentValue?.toString() || '',
      targetValue: goal.targetValue?.toString() || '',
    })
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this goal?')) return
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      fetchGoals()
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')
  const avgCompletion =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, g) => sum + g.progress, 0) / activeGoals.length
        )
      : 0

  const dueThisWeek = activeGoals.filter((g) => {
    if (!g.targetDate) return false
    const dueDate = new Date(g.targetDate)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return dueDate >= now && dueDate <= weekFromNow
  }).length

  const filteredGoals =
    selectedFilter === 'all'
      ? activeGoals
      : activeGoals.filter((g) => g.timeframe === selectedFilter)

  const goalColors: Record<string, string> = {
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
  }

  function getGoalColor(index: number): string {
    const colors = ['yellow', 'blue', 'green']
    return colors[index % colors.length]
  }

  return (
    <AuthLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Goals & OKRs</h1>
            <p className="text-gray-400">
              Strategic planning inspired by Rockefeller&apos;s discipline
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#252a3a] rounded-2xl p-6">
            <Target className="w-6 h-6 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white mb-1">
              {activeGoals.length}
            </div>
            <div className="text-gray-400 text-sm">Active Goals</div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white mb-1">
              {avgCompletion}%
            </div>
            <div className="text-gray-400 text-sm">Avg Completion</div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6">
            <Calendar className="w-6 h-6 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white mb-1">
              {dueThisWeek}
            </div>
            <div className="text-gray-400 text-sm">Due This Week</div>
          </div>
          <div className="bg-[#252a3a] rounded-2xl p-6">
            <CheckCircle className="w-6 h-6 text-pink-400 mb-2" />
            <div className="text-2xl font-bold text-white mb-1">
              {completedGoals.length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All Goals' },
            { value: 'long-term', label: 'Long-term (10-20 yrs)' },
            { value: 'annual', label: 'Annual' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'daily', label: 'Daily' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-yellow-400 text-white'
                  : 'bg-[#252a3a] text-gray-300 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : filteredGoals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No goals yet</p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {filteredGoals.map((goal, index) => {
              const color = getGoalColor(index)
              const progressValue = goal.currentValue && goal.targetValue
                ? Math.round((goal.currentValue / goal.targetValue) * 100)
                : goal.progress

              return (
                <div
                  key={goal.id}
                  className={`bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors ${
                    index === 0 ? 'border-2 border-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full ${goalColors[color]} flex-shrink-0 mt-2`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            {goal.priority && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  goal.priority === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : goal.priority === 'medium'
                                    ? 'bg-orange-500/20 text-orange-400'
                                    : 'bg-blue-500/20 text-blue-400'
                                }`}
                              >
                                {goal.priority.toUpperCase()}
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-gray-400 text-sm mb-3">
                            {goal.description}
                          </p>
                        )}
                        {goal.currentValue && goal.targetValue ? (
                          <div className="mb-3">
                            <div className="text-white text-sm mb-2">
                              ${goal.currentValue.toLocaleString()} of ${goal.targetValue.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${goalColors[color]}`}
                                  style={{ width: `${progressValue}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold ${goalColors[color].replace('bg-', 'text-')}`}>
                                {progressValue}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${goalColors[color]}`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${goalColors[color].replace('bg-', 'text-')}`}>
                              {goal.progress}%
                            </span>
                          </div>
                        )}
                        {goal.targetDate && (
                          <div className="text-gray-400 text-sm">
                            Due Date {new Date(goal.targetDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="text-blue-400 hover:text-blue-300 p-2"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI Insight Card */}
        <div className="bg-[#252a3a] rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">AI Insight</h3>
              <p className="text-gray-300 mb-4">
                Based on your progress, you&apos;re on track to complete 2 quarterly
                goals early. Consider advancing your timeline or increasing targets to
                maintain momentum.
              </p>
              <button className="text-white text-sm font-medium hover:text-yellow-400 transition-colors flex items-center gap-1">
                View Recommendations <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Goal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#252a3a] rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <select
                    value={formData.timeframe}
                    onChange={(e) =>
                      setFormData({ ...formData, timeframe: e.target.value })
                    }
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                    <option value="long-term">Long-term</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Current Value (optional)"
                    value={formData.currentValue}
                    onChange={(e) =>
                      setFormData({ ...formData, currentValue: e.target.value })
                    }
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Target Value (optional)"
                    value={formData.targetValue}
                    onChange={(e) =>
                      setFormData({ ...formData, targetValue: e.target.value })
                    }
                    className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Progress %"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg flex-1"
                  >
                    {editingGoal ? 'Update' : 'Create'} Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingGoal(null)
                      setFormData({
                        title: '',
                        description: '',
                        targetDate: '',
                        priority: 'medium',
                        timeframe: 'quarterly',
                        progress: 0,
                        currentValue: '',
                        targetValue: '',
                      })
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
