/**
 * Generates VAPID keys for Web Push notifications.
 * Run once with: node scripts/generate-vapid.mjs
 * Then add the output to your .env.local
 */
import webpush from 'web-push'

const keys = webpush.generateVAPIDKeys()

console.log('\n🔑 VAPID Keys generated — add these to your .env.local:\n')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`)
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`)
console.log('\n⚠️  Keep VAPID_PRIVATE_KEY secret — never commit it!\n')
