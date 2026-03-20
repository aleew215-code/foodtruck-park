import { NextRequest, NextResponse } from 'next/server'
import { authTruck } from '@/lib/auth-truck'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const truck = await prisma.foodTruck.findUnique({
    where: { userId: session.user.id },
    include: { employees: { select: { id: true, name: true, email: true, isActive: true, createdAt: true } } },
  })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(truck.employees)
}

export async function POST(req: NextRequest) {
  const session = await authTruck()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const truck = await prisma.foodTruck.findUnique({ where: { userId: session.user.id } })
  if (!truck) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 12)
  const employee = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: 'EMPLOYEE',
      employeeTruckId: truck.id,
    },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true },
  })

  return NextResponse.json(employee, { status: 201 })
}
