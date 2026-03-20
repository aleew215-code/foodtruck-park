'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.next !== form.confirm) {
      toast('New passwords do not match.', 'error')
      return
    }
    if (form.next.length < 8) {
      toast('Password must be at least 8 characters.', 'error')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.error || 'Something went wrong.', 'error')
      } else {
        setDone(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-md flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Password updated!</h2>
        <p className="text-sm text-gray-500 text-center">Your password has been changed successfully. Redirecting to dashboard…</p>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <KeyRound className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500">Set a secure new password for your account</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current password */}
          <div>
            <Label htmlFor="current">Current Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="current"
                type={show.current ? 'text' : 'password'}
                value={form.current}
                onChange={e => setForm({ ...form, current: e.target.value })}
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
              >
                {show.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <Label htmlFor="next">New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="next"
                type={show.next ? 'text' : 'password'}
                value={form.next}
                onChange={e => setForm({ ...form, next: e.target.value })}
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, next: !s.next }))}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
              >
                {show.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.next.length > 0 && form.next.length < 8 && (
              <p className="text-xs text-red-500 mt-1">Too short — minimum 8 characters</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="confirm"
                type={show.confirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="Repeat your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
              >
                {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirm.length > 0 && form.next !== form.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  )
}
