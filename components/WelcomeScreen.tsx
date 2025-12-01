'use client'

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function WelcomeScreen() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#2d1b4e] to-black flex items-center justify-center relative">
      {/* Help Icon */}
      <div className="absolute bottom-6 right-6">
        <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
          <HelpCircle className="w-5 h-5 text-yellow-400" />
        </button>
      </div>

      <div className="text-center px-6 max-w-md w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 flex items-center justify-center relative overflow-hidden shadow-lg">
            {/* Large yellow star */}
            <div className="absolute right-3 top-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20 9L14.09 9.74L12 16L9.91 9.74L4 9L9.91 8.26L12 2Z"
                  fill="#fbbf24"
                />
              </svg>
            </div>
            {/* Small purple star */}
            <div className="absolute left-3 top-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20 9L14.09 9.74L12 16L9.91 9.74L4 9L9.91 8.26L12 2Z"
                  fill="#c084fc"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to Personal OS
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-lg mb-8">
          Your Life. Simplified. Track budgets, habits, notes, and workouts all
          in one beautiful place.
        </p>

        {/* Auth Forms */}
        <div className="bg-[#1e2332] rounded-2xl p-6 border border-gray-700">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isLogin
                  ? 'bg-yellow-400 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-yellow-400 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}

