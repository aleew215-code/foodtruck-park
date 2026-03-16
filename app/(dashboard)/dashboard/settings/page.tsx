'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'

export default function TruckSettingsPage() {
  const { toast } = useToast()
  const [form, setForm] = useState({ name: '', description: '', cuisine: '', phone: '', email: '', address: '', isOpen: false, tableServiceEnabled: true, avgPrepTime: 20, openTime: '', closeTime: '', smsFromNumber: '', smsOrderConfirmMsg: '', smsPrepMsg: '', smsReadyMsg: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/settings')
      .then(r => r.json())
      .then(d => { setForm(f => ({ ...f, ...d })); setFetching(false) })
  }, [])

  async function handleSave() {
    setLoading(true)
    await fetch('/api/dashboard/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    toast('Settings saved!')
    setLoading(false)
  }

  if (fetching) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 rounded-full border-2 border-gray-200 border-t-orange-500" /></div>

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Truck Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div><Label>Truck Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1" /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1" /></div>
        <div><Label>Cuisine Type</Label><Input value={form.cuisine} onChange={e => setForm({...form, cuisine: e.target.value})} placeholder="Mexican, Burgers, etc." className="mt-1" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
        </div>
        <div><Label>Address / Location</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="mt-1" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Open Time</Label><Input type="time" value={form.openTime} onChange={e => setForm({...form, openTime: e.target.value})} className="mt-1" /></div>
          <div><Label>Close Time</Label><Input type="time" value={form.closeTime} onChange={e => setForm({...form, closeTime: e.target.value})} className="mt-1" /></div>
        </div>
        <div><Label>Avg Prep Time (minutes)</Label><Input type="number" value={form.avgPrepTime} onChange={e => setForm({...form, avgPrepTime: parseInt(e.target.value)})} className="mt-1 max-w-xs" /></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Service Settings</h2>
        <div className="flex items-center justify-between py-2">
          <div><p className="font-medium text-sm">Open for Orders</p><p className="text-xs text-gray-500">Customers can currently order from your truck</p></div>
          <Switch checked={form.isOpen} onCheckedChange={v => setForm({...form, isOpen: v})} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div><p className="font-medium text-sm">Table Service</p><p className="text-xs text-gray-500">Enable delivery to customer tables</p></div>
          <Switch checked={form.tableServiceEnabled} onCheckedChange={v => setForm({...form, tableServiceEnabled: v})} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">SMS Notifications</h2>
        <p className="text-sm text-gray-500">Use {'{order}'} and {'{truck}'} as placeholders in your messages.</p>
        <div><Label>SMS Phone Number</Label><Input value={form.smsFromNumber} onChange={e => setForm({...form, smsFromNumber: e.target.value})} placeholder="+15550000000" className="mt-1" /></div>
        <div><Label>Order Confirmation Message</Label><Textarea value={form.smsOrderConfirmMsg} onChange={e => setForm({...form, smsOrderConfirmMsg: e.target.value})} placeholder="Leave blank to use default" className="mt-1" rows={2} /></div>
        <div><Label>Preparing Message</Label><Textarea value={form.smsPrepMsg} onChange={e => setForm({...form, smsPrepMsg: e.target.value})} placeholder="Leave blank to use default" className="mt-1" rows={2} /></div>
        <div><Label>Ready Message</Label><Textarea value={form.smsReadyMsg} onChange={e => setForm({...form, smsReadyMsg: e.target.value})} placeholder="Leave blank to use default" className="mt-1" rows={2} /></div>
      </div>

      <Button onClick={handleSave} disabled={loading} size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  )
}
