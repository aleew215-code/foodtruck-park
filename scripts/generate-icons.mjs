/**
 * Generates PWA icons from an SVG using the canvas API.
 * Run with: node scripts/generate-icons.mjs
 * Requires: npm install canvas
 */
import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outputDir, { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const radius = size * 0.2 // rounded corners

  // Background: orange gradient
  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#fb923c') // orange-400
  grad.addColorStop(1, '#ea580c') // orange-600

  // Rounded rect background
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  // Draw a simple truck icon (white)
  ctx.fillStyle = '#ffffff'
  const s = size * 0.55 // icon size
  const ox = (size - s) / 2 // offset x
  const oy = (size - s) / 2 // offset y

  // Truck body
  const bodyW = s * 0.65
  const bodyH = s * 0.45
  const bodyX = ox
  const bodyY = oy + s * 0.15
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH)

  // Cab
  const cabW = s * 0.3
  const cabH = s * 0.35
  const cabX = ox + bodyW
  const cabY = bodyY + bodyH - cabH
  ctx.fillRect(cabX, cabY, cabW, cabH)

  // Windshield cutout
  ctx.fillStyle = grad
  ctx.fillRect(cabX + cabW * 0.1, cabY + cabH * 0.1, cabW * 0.8, cabH * 0.45)
  ctx.fillStyle = '#ffffff'

  // Wheels
  const wheelR = s * 0.1
  const wheelY = bodyY + bodyH + wheelR * 0.3

  // Left wheel
  ctx.beginPath()
  ctx.arc(ox + bodyW * 0.22, wheelY, wheelR, 0, Math.PI * 2)
  ctx.fill()

  // Right wheel
  ctx.beginPath()
  ctx.arc(ox + bodyW * 0.72, wheelY, wheelR, 0, Math.PI * 2)
  ctx.fill()

  return canvas.toBuffer('image/png')
}

for (const size of SIZES) {
  const buffer = drawIcon(size)
  const outPath = join(outputDir, `icon-${size}x${size}.png`)
  writeFileSync(outPath, buffer)
  console.log(`✅ Generated ${size}x${size} icon`)
}

console.log('\n🎉 All PWA icons generated in public/icons/')
