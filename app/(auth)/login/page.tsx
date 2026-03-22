'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const table = searchParams.get('table')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) {
        toast(res.error === 'Account deactivated' ? 'Your account has been deactivated.' : 'Invalid email or password.', 'error')
      } else {
        // Redirect by role
        const resp = await fetch('/api/auth/session')
        const session = await resp.json()
        const role = session?.user?.role
        if (role === 'FOOD_TRUCK') router.push('/dashboard')
        else if (role === 'SUPER_ADMIN') router.push('/admin')
        else if (role === 'EMPLOYEE') router.push('/employee')
        else router.push(table ? `/marketplace?table=${table}` : '/marketplace')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: table ? `/marketplace?table=${table}` : '/marketplace' })
  }

  return (
    <div className="w-full max-w-md ag-3d-rise">

      {/* ── Logo + Title ──────────────────────────────────────── */}
      <div className="text-center mb-8">
        {/* 3D Logo icon with neon ring + inner shine */}
        <div className="relative inline-block mb-5">
          {/* Outer glow halo */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl"
            style={{ background: 'rgba(249,115,22,0.40)', transform: 'scale(1.5)', zIndex: 0 }}
          />
          {/* Icon container */}
          <div
            className="relative z-10 flex items-center justify-center w-20 h-20 rounded-3xl ag-neon-ring ag-inner-shine"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #c2520e 60%, #7c3210 100%)',
              boxShadow: '0 8px 32px rgba(249,115,22,0.55), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
              transform: 'perspective(400px) rotateX(8deg)',
            }}
          >
            <Truck className="h-9 w-9 text-white drop-shadow-lg" />
          </div>
        </div>

        <h1
          className="text-3xl font-black tracking-tight"
          style={{ color: '#fff' }}
        >
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>
          Sign in to order from your favorite trucks
        </p>
      </div>

      {/* ── Card ─────────────────────────────────────────────── */}
      <div
        className="ag-glass ag-inner-shine relative rounded-3xl p-8 overflow-hidden"
        style={{
          boxShadow: '0 24px 80px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.07), 0 0 60px rgba(249,115,22,0.06)',
        }}
      >
        {/* Subtle corner glow */}
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 70%)' }}
        />

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-3 text-sm font-semibold transition ag-press disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.85)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'
          }}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-xs font-medium"
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.28)' }}
            >
              or sign in with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5 ag-input rounded-xl h-11"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium transition"
                style={{ color: 'rgba(249,115,22,0.80)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(249,115,22,0.80)')}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="ag-input rounded-xl h-11"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-3 transition ag-press"
                style={{ color: 'rgba(255,255,255,0.30)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.30)')}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Don't have an account?{' '}
          <Link
            href={table ? `/register?table=${table}` : '/register'}
            className="font-semibold transition"
            style={{ color: '#f97316' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fbbf24')}
            onMouseLeave={e => (e.currentTarget.style.color = '#f97316')}
          >
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md h-[520px] ag-skeleton rounded-3xl" />
    }>
      <LoginContent />
    </Suspense>
  )
}
