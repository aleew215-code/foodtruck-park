'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, ToggleLeft, ToggleRight, Eye, EyeOff, Copy, Check, X } from 'lucide-react'

type Employee = {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function load() {
    const res = await fetch('/api/dashboard/employees')
    if (res.ok) setEmployees(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createEmployee() {
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    setSaving(true)
    setError('')
    const res = await fetch('/api/dashboard/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Failed to create employee')
      return
    }
    setForm({ name: '', email: '', password: '' })
    setShowForm(false)
    load()
  }

  async function toggleActive(emp: Employee) {
    await fetch(`/api/dashboard/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !emp.isActive }),
    })
    load()
  }

  async function deleteEmployee(emp: Employee) {
    if (!confirm(`Remove ${emp.name}? This cannot be undone.`)) return
    await fetch(`/api/dashboard/employees/${emp.id}`, { method: 'DELETE' })
    load()
  }

  function generatePassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    const pass = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    setForm(f => ({ ...f, password: pass }))
    setShowPass(true)
  }

  function copyCredentials() {
    const text = `Email: ${form.email}\nPassword: ${form.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-orange-50">
            <Users className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Team</h1>
            <p className="text-xs text-gray-500">Manage employee access</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#f97316,#ea6c00)', boxShadow: '0 4px 14px rgba(249,115,22,0.30)' }}
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">New Employee</h2>
            <button onClick={() => { setShowForm(false); setError('') }} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="Jane Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email</label>
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-24 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                <button
                  onClick={() => setShowPass(s => !s)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition"
                  type="button"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={generatePassword}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition"
                  type="button"
                >
                  Generate
                </button>
              </div>
            </div>
            {form.email && form.password && (
              <button
                onClick={copyCredentials}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold transition"
                style={{ color: copied ? '#16a34a' : '#9ca3af' }}
                type="button"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy credentials to share'}
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={createEmployee}
              disabled={saving}
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea6c00)', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Creating…' : 'Create Employee'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="rounded-2xl px-5 py-4 flex items-start gap-3 bg-orange-50 border border-orange-100">
        <span className="text-lg mt-0.5">💡</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Employee Access</p>
          <p className="text-xs text-gray-600 mt-0.5">
            Employees log in at{' '}
            <span className="text-orange-600 font-medium">/login</span>{' '}
            and are taken to a tablet-optimized order screen. They can update order status but cannot see analytics, financials, or settings.
          </p>
        </div>
      </div>

      {/* Employee list */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
          <div className="h-8 w-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mx-auto" />
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700">No employees yet</p>
          <p className="text-sm text-gray-400 mt-1">Add team members so they can manage orders from a tablet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {employees.map((emp, i) => (
            <div
              key={emp.id}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f6' }}
            >
              {/* Avatar */}
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                style={{
                  background: emp.isActive ? 'rgba(249,115,22,0.12)' : '#f3f4f6',
                  color: emp.isActive ? '#ea6c00' : '#9ca3af',
                }}
              >
                {(emp.name?.[0] ?? '?').toUpperCase()}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{emp.name}</p>
                <p className="text-xs text-gray-400 truncate">{emp.email}</p>
              </div>
              {/* Status badge */}
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                style={{
                  background: emp.isActive ? 'rgba(34,197,94,0.10)' : '#f3f4f6',
                  color: emp.isActive ? '#16a34a' : '#9ca3af',
                }}
              >
                {emp.isActive ? 'Active' : 'Inactive'}
              </span>
              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(emp)}
                  className="p-2 rounded-xl hover:bg-gray-50 transition"
                  style={{ color: emp.isActive ? '#22c55e' : '#d1d5db' }}
                  title={emp.isActive ? 'Deactivate' : 'Activate'}
                >
                  {emp.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => deleteEmployee(emp)}
                  className="p-2 rounded-xl hover:bg-red-50 transition text-red-400"
                  title="Remove employee"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
