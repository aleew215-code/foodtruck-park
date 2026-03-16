import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Demo Customer ───────────────────────────────────────────
  const customerPw = await bcrypt.hash('Demo1234!', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'demo@customer.com' },
    update: { walletBalance: 47.50 },
    create: {
      name: 'Alex Demo',
      email: 'demo@customer.com',
      password: customerPw,
      role: 'CUSTOMER',
      phone: '+1 555 010 0001',
      allergies: ['Peanuts'],
      walletBalance: 47.50,
      isActive: true,
    }
  })
  console.log('✅ Customer:', customer.email)

  // ─── Food Truck 1: Taco Loco ──────────────────────────────────
  const truck1Pw = await bcrypt.hash('Truck1234!', 12)
  const truck1User = await prisma.user.upsert({
    where: { email: 'tacoloco@trucks.com' },
    update: {},
    create: {
      name: 'Maria Garcia',
      email: 'tacoloco@trucks.com',
      password: truck1Pw,
      role: 'FOOD_TRUCK',
      isActive: true,
    }
  })
  const truck1 = await prisma.foodTruck.upsert({
    where: { userId: truck1User.id },
    update: {},
    create: {
      userId: truck1User.id,
      name: 'Taco Loco 🌮',
      description: 'Authentic Mexican street tacos made with love. Family recipe since 1987.',
      cuisine: 'Mexican',
      coverImage: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
      isOpen: true,
      isActive: true,
      rating: 4.8,
      totalRatings: 124,
      avgPrepTime: 12,
    }
  })

  const cat1 = await prisma.menuCategory.upsert({
    where: { id: 'cat-taco-tacos' },
    update: {},
    create: { id: 'cat-taco-tacos', foodTruckId: truck1.id, name: 'Tacos', sortOrder: 1 }
  })
  const cat2 = await prisma.menuCategory.upsert({
    where: { id: 'cat-taco-sides' },
    update: {},
    create: { id: 'cat-taco-sides', foodTruckId: truck1.id, name: 'Sides & Drinks', sortOrder: 2 }
  })

  const items1 = [
    { id: 'item-carne-asada', name: 'Carne Asada Taco', description: 'Grilled beef, onion, cilantro, salsa verde', price: 4.50, categoryId: cat1.id },
    { id: 'item-al-pastor', name: 'Al Pastor Taco', description: 'Marinated pork, pineapple, cilantro', price: 4.50, categoryId: cat1.id },
    { id: 'item-fish-taco', name: 'Fish Taco', description: 'Battered cod, cabbage slaw, chipotle mayo', price: 5.00, categoryId: cat1.id },
    { id: 'item-veggie-taco', name: 'Veggie Taco 🥦', description: 'Grilled peppers, black beans, avocado', price: 4.00, categoryId: cat1.id },
    { id: 'item-guac', name: 'Guacamole & Chips', description: 'Fresh homemade guacamole', price: 3.50, categoryId: cat2.id },
    { id: 'item-horchata', name: 'Horchata', description: 'Traditional rice water with cinnamon', price: 2.50, categoryId: cat2.id },
  ]
  for (const item of items1) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, foodTruckId: truck1.id, isAvailable: true }
    })
  }
  console.log('✅ Truck 1: Taco Loco')

  // ─── Food Truck 2: Burger Bros ────────────────────────────────
  const truck2Pw = await bcrypt.hash('Truck1234!', 12)
  const truck2User = await prisma.user.upsert({
    where: { email: 'burgerbros@trucks.com' },
    update: {},
    create: {
      name: 'Jake Miller',
      email: 'burgerbros@trucks.com',
      password: truck2Pw,
      role: 'FOOD_TRUCK',
      isActive: true,
    }
  })
  const truck2 = await prisma.foodTruck.upsert({
    where: { userId: truck2User.id },
    update: {},
    create: {
      userId: truck2User.id,
      name: 'Burger Bros 🍔',
      description: 'Smash burgers with locally sourced beef. Crispy edges, juicy center.',
      cuisine: 'American',
      coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
      isOpen: true,
      isActive: true,
      rating: 4.6,
      totalRatings: 89,
      avgPrepTime: 15,
    }
  })

  const cat3 = await prisma.menuCategory.upsert({
    where: { id: 'cat-burger-burgers' },
    update: {},
    create: { id: 'cat-burger-burgers', foodTruckId: truck2.id, name: 'Burgers', sortOrder: 1 }
  })
  const cat4 = await prisma.menuCategory.upsert({
    where: { id: 'cat-burger-sides' },
    update: {},
    create: { id: 'cat-burger-sides', foodTruckId: truck2.id, name: 'Sides', sortOrder: 2 }
  })

  const items2 = [
    { id: 'item-classic-smash', name: 'Classic Smash Burger', description: 'Double smash patty, American cheese, pickles, special sauce', price: 9.50, categoryId: cat3.id },
    { id: 'item-bacon-smash', name: 'Bacon Smash Burger', description: 'Double smash, crispy bacon, cheddar, caramelized onion', price: 11.00, categoryId: cat3.id },
    { id: 'item-veggie-burger', name: 'Veggie Smash 🌱', description: 'Beyond meat patty, avocado, tomato, lettuce', price: 10.50, categoryId: cat3.id },
    { id: 'item-fries', name: 'Crispy Fries', description: 'Double-fried golden fries with seasoning', price: 3.50, categoryId: cat4.id },
    { id: 'item-onion-rings', name: 'Onion Rings', description: 'Beer-battered crispy onion rings', price: 4.00, categoryId: cat4.id },
    { id: 'item-shake', name: 'Milkshake', description: 'Vanilla, Chocolate or Strawberry', price: 5.50, categoryId: cat4.id },
  ]
  for (const item of items2) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, foodTruckId: truck2.id, isAvailable: true }
    })
  }
  console.log('✅ Truck 2: Burger Bros')

  // ─── Food Truck 3: Wok & Roll ─────────────────────────────────
  const truck3Pw = await bcrypt.hash('Truck1234!', 12)
  const truck3User = await prisma.user.upsert({
    where: { email: 'wokroll@trucks.com' },
    update: {},
    create: {
      name: 'Chen Wei',
      email: 'wokroll@trucks.com',
      password: truck3Pw,
      role: 'FOOD_TRUCK',
      isActive: true,
    }
  })
  const truck3 = await prisma.foodTruck.upsert({
    where: { userId: truck3User.id },
    update: {},
    create: {
      userId: truck3User.id,
      name: 'Wok & Roll 🥡',
      description: 'Pan-Asian street food. Noodles, dumplings and bao made fresh daily.',
      cuisine: 'Asian Fusion',
      coverImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
      isOpen: false,
      isActive: true,
      rating: 4.9,
      totalRatings: 67,
      avgPrepTime: 10,
    }
  })

  const cat5 = await prisma.menuCategory.upsert({
    where: { id: 'cat-wok-mains' },
    update: {},
    create: { id: 'cat-wok-mains', foodTruckId: truck3.id, name: 'Mains', sortOrder: 1 }
  })

  const items3 = [
    { id: 'item-pad-thai', name: 'Pad Thai', description: 'Rice noodles, egg, bean sprouts, peanuts, tamarind sauce', price: 10.00, categoryId: cat5.id },
    { id: 'item-dumplings', name: 'Pan-Fried Dumplings (6)', description: 'Pork & cabbage with ginger soy dipping sauce', price: 8.00, categoryId: cat5.id },
    { id: 'item-bao', name: 'BBQ Pork Bao (2)', description: 'Fluffy steamed buns with char siu pork', price: 7.50, categoryId: cat5.id },
    { id: 'item-fried-rice', name: 'Yang Chow Fried Rice', description: 'Wok-fried rice, shrimp, egg, green onions', price: 9.00, categoryId: cat5.id },
  ]
  for (const item of items3) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, foodTruckId: truck3.id, isAvailable: true }
    })
  }
  console.log('✅ Truck 3: Wok & Roll')

  // ─── Sample Orders ────────────────────────────────────────────
  const order1 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-001' },
    update: {},
    create: {
      orderNumber: 'ORD-001',
      customerId: customer.id,
      foodTruckId: truck1.id,
      status: 'DELIVERED',
      orderType: 'TABLE_SERVICE',
      tableNumber: 7,
      subtotal: 18.50,
      total: 18.50,
      paymentMethod: 'WALLET',
      paymentStatus: 'COMPLETED',
      commission: 0.44,
      items: {
        create: [
          { menuItemId: 'item-carne-asada', name: 'Carne Asada Taco', price: 4.50, quantity: 2 },
          { menuItemId: 'item-al-pastor', name: 'Al Pastor Taco', price: 4.50, quantity: 2 },
          { menuItemId: 'item-guac', name: 'Guacamole & Chips', price: 3.50, quantity: 1 },
          { menuItemId: 'item-horchata', name: 'Horchata', price: 2.50, quantity: 1 },
        ]
      }
    }
  })

  const order2 = await prisma.order.upsert({
    where: { orderNumber: 'ORD-002' },
    update: {},
    create: {
      orderNumber: 'ORD-002',
      customerId: customer.id,
      foodTruckId: truck2.id,
      status: 'PREPARING',
      orderType: 'TABLE_SERVICE',
      tableNumber: 7,
      subtotal: 24.50,
      total: 24.50,
      paymentMethod: 'CARD',
      paymentStatus: 'COMPLETED',
      commission: 0.59,
      items: {
        create: [
          { menuItemId: 'item-bacon-smash', name: 'Bacon Smash Burger', price: 11.00, quantity: 2 },
          { menuItemId: 'item-fries', name: 'Crispy Fries', price: 3.50, quantity: 1 },
          { menuItemId: 'item-shake', name: 'Milkshake', price: 5.50, quantity: 1 },
        ]
      }
    }
  })
  console.log('✅ Sample orders created')

  // ─── Wallet Transactions ──────────────────────────────────────
  await prisma.walletTransaction.createMany({
    skipDuplicates: true,
    data: [
      { userId: customer.id, amount: 50.00, type: 'credit', description: 'Wallet top-up via Stripe' },
      { userId: customer.id, amount: -18.50, type: 'debit', description: 'Order ORD-001 · Taco Loco' },
      { userId: customer.id, amount: 25.00, type: 'credit', description: 'Wallet top-up via Stripe' },
      { userId: customer.id, amount: -9.00, type: 'debit', description: 'Order ORD-003 · Wok & Roll' },
    ]
  })
  console.log('✅ Wallet transactions created')

  // ─── Review ───────────────────────────────────────────────────
  await prisma.review.upsert({
    where: { id: 'review-demo-1' },
    update: {},
    create: {
      id: 'review-demo-1',
      customerId: customer.id,
      foodTruckId: truck1.id,
      orderId: order1.id,
      rating: 5,
      comment: 'Best tacos I\'ve had in years! The al pastor was incredible 🌮🔥',
    }
  })
  console.log('✅ Review created')

  console.log('\n🎉 Seed complete!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Demo Customer:')
  console.log('   Email:    demo@customer.com')
  console.log('   Password: Demo1234!')
  console.log('   Wallet:   $47.50')
  console.log('')
  console.log('🚚 Food Truck Accounts:')
  console.log('   tacoloco@trucks.com  / Truck1234!')
  console.log('   burgerbros@trucks.com / Truck1234!')
  console.log('   wokroll@trucks.com   / Truck1234!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
