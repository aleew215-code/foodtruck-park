'use client'
import { useState, useEffect } from 'react'
import { Plus, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { Avatar } from '@/components/ui/avatar'
import { format } from 'date-fns'

export default function AdminsPage() {
  const { toast } = useToast()
  const [admins, setAdmins] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/admins').then(r => r.json()).then(setAdmins)
  }, [])

  async function createAdmin() {
    setSaving(true)
    const res = await fetch('/api/admin/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    if (res.ok) { toast('Admin created'); setAdmins(p => [...p, d]); setShowModal(false); setForm({ name: '', email: '', password: '' }) }
    else toast(d.error || 'Failed', 'error')
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Super Admins</h1>
        <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" />Add Admin</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {admins.map(a => (
            <div key={a.id} className="px-6 py-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{a.name}</p>
                <p className="text-sm text-gray-500">{a.email}</p>
              </div>
              <p className="text-xs text-gray-400">Joined {format(new Date(a.createdAt), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Super Admin">
        <div className="p-6 space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1" /></div>
          <Button onClick={createAdmin} className="w-full bg-gray-900 hover:bg-gray-800" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Admin
          </Button>
        </div>
      </Modal>
    </div>
  )
}
