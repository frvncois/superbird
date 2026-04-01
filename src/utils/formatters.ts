export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const sign = bytes < 0 ? '-' : ''
  const abs = Math.abs(bytes)
  if (abs < 1024) return sign + abs + ' B'
  if (abs < 1024 * 1024) return sign + (abs / 1024).toFixed(1) + ' KB'
  if (abs < 1024 * 1024 * 1024) return sign + (abs / (1024 * 1024)).toFixed(1) + ' MB'
  return sign + (abs / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

export function savings(orig: number, comp: number): number {
  return Math.round((1 - comp / orig) * 100)
}

export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '')
}

export function extForFormat(fmt: string): string {
  return fmt === 'jpeg' ? 'jpg' : fmt === 'png' ? 'png' : 'webp'
}

export function mimeForFormat(fmt: string): string {
  return fmt === 'jpeg' ? 'image/jpeg' : fmt === 'png' ? 'image/png' : 'image/webp'
}
