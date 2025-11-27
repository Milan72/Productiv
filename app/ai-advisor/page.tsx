'use client'

import AuthLayout from '@/components/AuthLayout'
import { Sparkles } from 'lucide-react'

export default function AIAdvisorPage() {
  return (
    <AuthLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Advisor</h1>
          <p className="text-gray-400">Get personalized insights and recommendations</p>
        </div>

        <div className="bg-[#252a3a] rounded-2xl p-12 text-center">
          <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            AI Advisor Coming Soon
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            We&apos;re working on bringing you AI-powered insights to help you
            achieve your goals and improve your productivity.
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}



