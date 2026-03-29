import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import JSZip from 'jszip'
import { compressImage, makeThumbnail } from '../utils/compression'
import { formatBytes, savings, baseName, extForFormat } from '../utils/formatters'

interface Dims { width: number; height: number }

export interface CompressItem {
  id: number
  file: File
  thumbnail: string
  status: 'staged' | 'converting' | 'done'
  name: string
  originalName: string
  originalSize: number
  originalWidth: number
  originalHeight: number
  compressedSize: number
  compressedWidth?: number
  compressedHeight?: number
  blob: Blob | null
}

function getImageDimensions(file: File | Blob): Promise<Dims> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }) }
    img.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 0, height: 0 }) }
    img.src = url
  })
}

export const useAppStore = defineStore('compress', () => {
  const PREVIEW_COUNT = 5
  const MAX_IMAGES = 20

  const LOADING_TAGLINES = [
    'Applying unnecessary math',
    'Negotiating with bytes',
    'Removing pixels nobody asked for',
    'Telling your images to do more with less',
    'Reticulating image splines',
    'Compressing the compression algorithm',
    'Dividing pixels by zero (carefully)',
    'Asking the pixels nicely to leave',
    'Running the thing through the other thing',
    'Converting RGB to feels',
    'Defragmenting the vibes',
    'Calculating the square root of your JPEG',
    'Applying quantum pixel entanglement',
    'Reversing the polarity of the image',
    'Initiating pixel eviction proceedings',
    'Compiling the compiler',
    'Untangling the color matrix',
    'Establishing a secure connection to your images',
    'Teaching the bytes to be more efficient',
    'Removing unnecessary electrons',
    'Solving the pixel Sudoku',
    'Inverting the byte curve',
    'Engaging turbo compression mode',
    'Asking ChatGPT what to do next',
    'Performing illegal image operations',
    'Running it through the machine that does the thing',
    'Overclocking the pixels',
    'Summoning the compression daemon',
    'Rearranging atoms for optimal file size',
    'Bribing the bytes to take up less space',
    'Deploying the pixel reduction taskforce',
    'Consulting the ancient compression scrolls',
    'Crossing the streams (probably fine)',
    'Blockchain not involved, we promise',
  ]

  let idCounter = 0

  const maxWidth = ref(1920)
  const format = ref('webp')
  const items = ref<CompressItem[]>([])
  const showAbout = ref(false)
  const showTipJar = ref(false)
  const renamePrefix = ref('')
  const listExpanded = ref(false)
  const clearExif = ref(true)
  const isAdding = ref(false)
  const isCompressing = ref(false)
  const loadingTagline = ref('')
  const showLimitAlert = ref(false)

  const stagedItems = computed(() => items.value.filter(i => i.status === 'staged'))
  const doneFiles = computed(() => items.value.filter(i => i.status === 'done'))
  const totalSaved = computed(() => {
    const orig = doneFiles.value.reduce((s, f) => s + f.originalSize, 0)
    const comp = doneFiles.value.reduce((s, f) => s + f.compressedSize, 0)
    return orig - comp
  })

  function effectiveName(entry: CompressItem, indexAmongDone: number): string {
    if (!renamePrefix.value.trim()) return entry.name
    const ext = entry.name.split('.').pop() ?? ''
    const n = String(indexAmongDone + 1).padStart(2, '0')
    return `${renamePrefix.value.trim()}-${n}.${ext}`
  }

  async function processItem(item: CompressItem): Promise<void> {
    const find = () => items.value.findIndex(i => i.id === item.id)
    let idx = find()
    if (idx !== -1) items.value[idx] = { ...items.value[idx]!, status: 'converting' }
    try {
      const blob = await compressImage(item.file, maxWidth.value, format.value)
      const compressedDims = await getImageDimensions(blob)
      idx = find()
      if (idx !== -1) {
        items.value[idx] = {
          ...items.value[idx]!,
          name: baseName(item.file.name) + '.' + extForFormat(format.value),
          compressedSize: blob.size,
          compressedWidth: compressedDims.width,
          compressedHeight: compressedDims.height,
          blob,
          status: 'done',
        }
      }
    } catch (err) {
      idx = find()
      if (idx !== -1) items.value.splice(idx, 1)
      console.error('Compression failed:', err)
    }
  }

  async function addFiles(fileList: FileList | File[]): Promise<void> {
    const acceptedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif']
    const valid = Array.from(fileList).filter((f): f is File => {
      if (!(f instanceof File)) return false
      if (f.type.startsWith('image/')) return true
      const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
      return acceptedExts.includes(ext)
    })
    if (!valid.length) return
    if (valid.length > MAX_IMAGES) {
      showLimitAlert.value = true
      valid.splice(MAX_IMAGES)
    }

    isAdding.value = true
    loadingTagline.value = LOADING_TAGLINES[Math.floor(Math.random() * LOADING_TAGLINES.length)] ?? ''

    const prepared: CompressItem[] = []
    for (const file of valid) {
      const [thumbnail, dims] = await Promise.all([
        makeThumbnail(file),
        getImageDimensions(file),
      ])
      prepared.push({
        id: ++idCounter,
        file,
        thumbnail,
        status: 'staged',
        name: baseName(file.name) + '.' + extForFormat(format.value),
        originalName: file.name,
        originalSize: file.size,
        originalWidth: dims.width,
        originalHeight: dims.height,
        compressedSize: 0,
        blob: null,
      })
    }

    isAdding.value = false
    items.value.push(...prepared)
  }

  function removeItem(id: number): void {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  async function compress(): Promise<void> {
    const toProcess = stagedItems.value.slice()
    if (!toProcess.length) return
    isCompressing.value = true
    loadingTagline.value = LOADING_TAGLINES[Math.floor(Math.random() * LOADING_TAGLINES.length)] ?? ''
    listExpanded.value = false
    const startTime = Date.now()
    for (const item of toProcess) {
      await processItem(item)
    }
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 2000 - elapsed)
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining))
    isCompressing.value = false
    setTimeout(() => { showTipJar.value = true }, 1200)
  }

  function downloadFile(entry: CompressItem): void {
    const idx = doneFiles.value.indexOf(entry)
    if (!entry.blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(entry.blob)
    a.download = effectiveName(entry, idx)
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  }

  async function downloadAll(): Promise<void> {
    const zip = new JSZip()
    doneFiles.value.forEach((entry, i) => {
      if (entry.blob) zip.file(effectiveName(entry, i), entry.blob)
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (renamePrefix.value.trim() || 'superbird') + '-compressed.zip'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 10000)
  }

  function clearList(): void {
    items.value = []
    listExpanded.value = false
    renamePrefix.value = ''
  }

  function dismissTipJar(): void {
    showTipJar.value = false
  }

  return {
    maxWidth, format, items, showAbout, showTipJar, renamePrefix, listExpanded,
    clearExif, isAdding, isCompressing, loadingTagline, showLimitAlert, PREVIEW_COUNT,
    stagedItems, doneFiles, totalSaved,
    addFiles, removeItem, compress, downloadFile, downloadAll, clearList,
    dismissTipJar, effectiveName,
    formatBytes, savings,
  }
})
