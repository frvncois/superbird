import Lenis from 'lenis'

let instance: Lenis | null = null

export function createLenis(): Lenis {
  instance = new Lenis({ autoRaf: true })
  return instance
}

export function useLenis(): Lenis | null {
  return instance
}
