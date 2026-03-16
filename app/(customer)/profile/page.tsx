'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'

const ALLERGIES = ['Peanuts', 'Gluten', 'Seafood', 'Dairy', 'Eggs', 'Tree Nuts', 'Soy', 'Sesame']

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => { setName(d.name || ''); setPhone(d.phone || ''); setAllergies(d.allergies || []) })
  }, [])

  function toggleAllergy(a: string) {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setLoading(true)
    try {
      let imageUrl: string | null = null
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const res = await fetch('/api/user/upload-photo', { method: 'POST', body: fd })
        const d = await res.json()
        imageUrl = d.url
      }
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, allergies, image: imageUrl }),
      })
      await update({ name })
      toast('Profile updated successfully!')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Photo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar src={preview || session?.user?.image} name={session?.user?.name} size="xl" />
            <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600 transition shadow">
              <Camera className="h-4 w-4 text-white" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Tap the camera to update photo</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={session?.user?.email || ''} disabled className="mt-1 bg-gray-50" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="mt-1" />
          </div>
          <div>
            <Label>Food Allergies</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGIES.map(a => (
                <button key={a} type="button" onClick={() => toggleAllergy(a)} className={`px-3 py-1 rounded-full text-xs font-medium border transition ${allergies.includes(a) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{a}</button>
              ))}
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
