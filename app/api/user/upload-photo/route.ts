import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size — max 5 MB
    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    const url = await uploadImage(base64, 'profiles')
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('[upload-photo]', err)
    // Surface a readable error so the frontend can display it
    const message = err?.message?.includes('Must supply api_key')
      ? 'Image storage not configured — contact support'
      : err?.message || 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
