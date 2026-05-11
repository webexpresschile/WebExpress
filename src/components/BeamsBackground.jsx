import { useEffect, useRef } from 'react'

export default function BeamsBackground({ beamWidth = 2, beamHeight = 15, beamNumber = 12, lightColor = '#ffffff', speed = 2, noiseIntensity = 1.75, scale = 0.2, rotation = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let time = 0

    function resize() {
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth * window.devicePixelRatio
      canvas.height = parent.clientHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    function animate() {
      time += 0.01 * speed
      const w = canvas.width / window.devicePixelRatio
      const h = canvas.height / window.devicePixelRatio

      ctx.clearRect(0, 0, w, h)

      const radRotation = (rotation * Math.PI) / 180
      const centerX = w / 2
      const centerY = h / 2

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(radRotation)
      ctx.translate(-centerX, -centerY)

      for (let i = 0; i < beamNumber; i++) {
        const x = (w / (beamNumber + 1)) * (i + 1)
        const baseWidth = beamWidth * scale * Math.min(w, h)
        const baseHeight = beamHeight * scale * Math.min(w, h)

        // Noise-based flicker
        const noise1 = Math.sin(i * 2.3 + time * 1.7) * noiseIntensity * 0.3
        const noise2 = Math.cos(i * 1.7 + time * 2.1) * noiseIntensity * 0.3
        const noise3 = Math.sin(i * 3.1 + time * 0.9 + 1.2) * noiseIntensity * 0.2

        const flicker = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 2 + i * 0.7))
        const widthScale = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 1.5 + i * 1.1 + noise1))
        const heightOffset = noise2 * baseHeight * 0.3

        const bw = baseWidth * widthScale
        const bh = baseHeight * (0.3 + 0.7 * flicker)

        // Fade gradient
        const gradient = ctx.createRadialGradient(x, centerY + heightOffset, 0, x, centerY + heightOffset, bh * 0.8)
        gradient.addColorStop(0, lightColor + 'ff')
        gradient.addColorStop(0.2, lightColor + Math.round(80 * flicker).toString(16).padStart(2, '0'))
        gradient.addColorStop(0.5, lightColor + Math.round(30 * flicker).toString(16).padStart(2, '0'))
        gradient.addColorStop(1, lightColor + '00')

        ctx.fillStyle = gradient
        ctx.fillRect(x - bw / 2, centerY + heightOffset - bh / 2, bw, bh)

        // Secondary glow
        const glowGrad = ctx.createRadialGradient(x, centerY + heightOffset, 0, x, centerY + heightOffset, bh * 1.5)
        glowGrad.addColorStop(0, lightColor + Math.round(15 * flicker * noiseIntensity * 0.5).toString(16).padStart(2, '0'))
        glowGrad.addColorStop(1, lightColor + '00')
        ctx.fillStyle = glowGrad
        ctx.fillRect(x - bh, centerY + heightOffset - bh, bh * 2, bh * 2)
      }

      ctx.restore()

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [beamWidth, beamHeight, beamNumber, lightColor, speed, noiseIntensity, scale, rotation])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  )
}
