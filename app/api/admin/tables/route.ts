import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import QRCode from 'qrcode'

export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } })
  return NextResponse.json(tables)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { number } = await req.json()
  const existing = await prisma.table.findUnique({ where: { number } })
  if (existing) return NextResponse.json({ error: `Table ${number} already exists` }, { status: 400 })
  const url = `${process.env.NEXTAUTH_URL}/?table=${number}`
  const qrCode = await QRCode.toDataURL(url, { width: 300, margin: 2 })
  const table = await prisma.table.create({ data: { number, qrCode } })
  return NextResponse.json(table)
}
