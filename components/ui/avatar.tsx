'use client'
import * as React from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-xl' }

function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-gray-100', sizes[size], className)}>
        <Image src={src} alt={name || 'Avatar'} fill className="object-cover" />
      </div>
    )
  }
  return (
    <div className={cn('rounded-full bg-orange-100 text-orange-600 font-semibold flex items-center justify-center', sizes[size], className)}>
      {name ? getInitials(name) : '?'}
    </div>
  )
}

export { Avatar }
