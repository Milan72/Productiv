'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from './Sidebar'
import { HelpCircle } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e2332] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1e2332]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {children}
        {/* Help Icon */}
        <div className="fixed bottom-6 right-6">
          <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
          </button>
        </div>
      </main>
    </div>
  )
}



