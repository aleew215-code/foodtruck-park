import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: 'CUSTOMER' | 'FOOD_TRUCK' | 'SUPER_ADMIN'
      tempPassword?: boolean
    }
  }

  interface User {
    role: 'CUSTOMER' | 'FOOD_TRUCK' | 'SUPER_ADMIN'
    tempPassword?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'CUSTOMER' | 'FOOD_TRUCK' | 'SUPER_ADMIN'
    tempPassword?: boolean
  }
}
