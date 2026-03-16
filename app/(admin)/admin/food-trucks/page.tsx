'use client'
import { useState, useEffect } from 'react'
import { Plus, Power, Loader2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { useToast } from '@/components/ui/toast'
import { format } from 'date-fns'

export default function AdminFoodTrucksPage() {
  const { toast } = useToast()
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', cuisine: '', phone: '' })

  useEffect(() => {
    fetch('/api/admin/food-trucks')
      .then(r => r.json())
      .then(d => { setTrucks(d); setLoading(false) })
  }, [])

  async function createTruck() {
    setSaving(true)
    const res = await fetch('/api/admin/food-trucks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    if (res.ok) {
      toast(`Food truck created! Temporary password sent to ${form.email}`)
      setTrucks(prev => [...prev, d.truck])
      setShowModal(false)
      setForm({ name: '', email: '', cuisine: '', phone: '' })
    } else {
      toast(d.error || 'Failed to create', 'error')
    }
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/food-trucks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    setTrucks(prev => prev.map(t => t.id === id ? { ...t, isActive: !current } : t))
    toast(!current ? 'Food truck reactivated' : 'Food truck deactivated')
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Food Trucks</h1>
        <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-2" /> Add Food Truck</Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {trucks.map(truck => (
            <div key={truck.id} className="px-6 py-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{truck.name}</p>
                <p className="text-sm text-gray-500 truncate">{truck.user?.email} · {truck.cuisine || 'No cuisine set'}</p>
                <p className="text-xs text-gray-400">Joined {format(new Date(truck.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={truck.isOpen ? 'success' : 'secondary'}>{truck.isOpen ? 'Open' : 'Closed'}</Badge>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Active</span>
                  <Switch checked={truck.isActive} onCheckedChange={() => toggleActive(truck.id, truck.isActive)} />
                </div>
              </div>
            </div>
          ))}
          {trucks.length === 0 && <div className="px-6 py-12 text-center text-gray-400">No food trucks yet</div>}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Food Truck">
        <div className="p-6 space-y-4">
          <div><Label>Truck Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Taco Express" className="mt-1" /></div>
          <div><Label>Owner Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="owner@truck.com" className="mt-1" /></div>
          <div><Label>Cuisine Type</Label><Input value={form.cuisine} onChange={e => setForm({...form, cuisine: e.target.value})} placeholder="Mexican, Burgers..." className="mt-1" /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 000 0000" className="mt-1" /></div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-700">
            A temporary password will be sent to the owner's email. They will be prompted to change it on first login.
          </div>
          <Button onClick={createTruck} className="w-full" disabled={saving || !form.name || !form.email}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Food Truck
          </Button>
        </div>
      </Modal>
    </div>
  )
}
