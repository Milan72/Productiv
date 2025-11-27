'use client'

import { useEffect, useState } from 'react'
import AuthLayout from '@/components/AuthLayout'
import { Plus, Users, Trash2, Mail, Phone, Building } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
}

export default function NetworkPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        setShowForm(false)
        setFormData({ name: '', email: '', phone: '', company: '', notes: '' })
        fetchContacts()
      }
    } catch (error) {
      console.error('Failed to create contact:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      fetchContacts()
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  return (
    <AuthLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Network</h1>
            <p className="text-gray-400">Manage your contacts and connections</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Contact
          </button>
        </div>

        {showForm && (
          <div className="bg-[#252a3a] rounded-2xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full bg-[#1e2332] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <textarea
                placeholder="Notes"
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
                  Add Contact
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
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No contacts yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Start building your network
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-[#252a3a] rounded-2xl p-6 hover:bg-[#2a3042] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {contact.name}
                    </h3>
                    {contact.company && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Building className="w-4 h-4" />
                        {contact.company}
                      </div>
                    )}
                    <div className="space-y-2">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-gray-400 text-sm mt-3">
                        {contact.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-400 hover:text-red-300 p-2"
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



