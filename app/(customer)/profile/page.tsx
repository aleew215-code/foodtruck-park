'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Save, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'

const ALLERGIES = ['Peanuts', 'Gluten', 'Seafood', 'Dairy', 'Eggs', 'Tree Nuts', 'Soy', 'Sesame']

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        setName(d.name || '')
        setPhone(d.phone || '')
        setAllergies(d.allergies || [])
        // Show saved image from DB as initial preview
        if (d.image) setPreview(d.image)
      })
      .catch(() => toast('Failed to load profile', 'error'))
  }, [])

  function toggleAllergy(a: string) {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Photo must be under 5 MB'); return }
    if (!file.type.startsWith('image/')) { setPhotoError('File must be an image'); return }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    setLoading(true)
    setPhotoError(null)
    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const res = await fetch('/api/user/upload-photo', { method: 'POST', body: fd })
        const d = await res.json()
        if (!res.ok || d.error) {
          setPhotoError(d.error || 'Photo upload failed')
          setLoading(false)
          return
        }
        imageUrl = d.url
        // Show the Cloudinary URL immediately so the photo is visible right away
        setPreview(imageUrl)
        setImageFile(null)
      }

      const profileRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          allergies,
          ...(imageUrl ? { image: imageUrl } : {}),
        }),
      })

      if (!profileRes.ok) {
        toast('Failed to save profile — please try again', 'error')
        return
      }

      // Update session with BOTH name and new image so navbar/avatar refresh instantly
      await update({ name, ...(imageUrl ? { image: imageUrl } : {}) })
      toast('Profile updated successfully!')
    } catch (err) {
      console.error(err)
      toast('Something went wrong — please try again', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">

      {/* ── Back button ─────────────────────────────────────── */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm transition"
        style={{ color: 'rgba(255,255,255,0.50)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.50)')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="ag-glass rounded-2xl p-6 space-y-6">

        {/* ── Photo ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar src={preview ?? session?.user?.image} name={session?.user?.name} size="xl" />
            <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer hover:bg-orange-600 transition shadow-lg">
              <Camera className="h-4 w-4 text-white" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={loading} />
            </label>
          </div>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Tap the camera icon to change photo · max 5 MB
          </p>

          {photoError && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 w-full">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {photoError}
            </div>
          )}
        </div>

        {/* ── Fields ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div>
            <Label className="text-white/60 text-sm">Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="mt-1 ag-input" />
          </div>

          <div>
            <Label className="text-white/60 text-sm">Email</Label>
            <Input value={session?.user?.email || ''} disabled className="mt-1 ag-input opacity-50 cursor-not-allowed" />
          </div>

          <div>
            <Label className="text-white/60 text-sm">Phone Number</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="mt-1 ag-input" />
          </div>

          {/* ── Allergies ──────────────────────────────────────── */}
          <div>
            <Label className="text-white/60 text-sm">Food Allergies</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALLERGIES.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergy(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    allergies.includes(a)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-orange-400/40'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full ag-glow-btn">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              : <><Save className="h-4 w-4 mr-2" />Save Changes</>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
