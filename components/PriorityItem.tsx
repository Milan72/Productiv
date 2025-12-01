'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

interface PriorityItemProps {
  id: string
  text: string
  completed: boolean
  onToggle?: () => void
}

export default function PriorityItem({
  id,
  text,
  completed,
  onToggle,
}: PriorityItemProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleToggle() {
    setIsUpdating(true)
    try {
      await fetch(`/api/priorities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      })
      if (onToggle) onToggle()
    } catch (error) {
      console.error('Failed to update priority:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={`bg-[#252a3a] rounded-xl p-4 flex items-center gap-3 ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          completed
            ? 'bg-yellow-400'
            : 'border-2 border-gray-500 bg-transparent hover:border-yellow-400'
        }`}
      >
        {completed && <Check className="w-4 h-4 text-white" />}
      </button>
      <span className={`text-white flex-1 ${completed ? 'line-through' : ''}`}>
        {text}
      </span>
    </div>
  )
}

