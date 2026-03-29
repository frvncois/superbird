import { mimeForFormat } from './formatters'

export function compressImage(file: File, targetMaxWidth: number, outputFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (w > targetMaxWidth) {
        h = Math.round((h * targetMaxWidth) / w)
        w = targetMaxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      const mime = mimeForFormat(outputFormat)
      const quality = outputFormat === 'png' ? undefined : outputFormat === 'jpeg' ? 0.85 : 0.95
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error('toBlob failed')); return }
        resolve(blob)
      }, mime, quality)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }
    img.src = url
  })
}

export function makeThumbnail(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const SIZE = 76
      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(''); return }
      const ratio = img.naturalWidth / img.naturalHeight
      let sx: number, sy: number, sw: number, sh: number
      if (ratio > 1) {
        sh = img.naturalHeight; sw = sh
        sx = (img.naturalWidth - sw) / 2; sy = 0
      } else {
        sw = img.naturalWidth; sh = sw
        sx = 0; sy = (img.naturalHeight - sh) / 2
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)
      resolve(canvas.toDataURL('image/webp', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('')
    }
    img.src = url
  })
}
