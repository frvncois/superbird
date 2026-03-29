export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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
