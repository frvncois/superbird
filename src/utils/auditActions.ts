type PromptInput = { title: string; savingsLabel?: string; description?: string }

const defaultPrompt = (issue: PromptInput): string => {
  const parts = [
    `My website has a performance issue detected by Lighthouse:\n\n"${issue.title}"`,
  ]
  if (issue.savingsLabel) parts.push(`Estimated savings: ${issue.savingsLabel}`)
  parts.push(`\nPlease explain:\n1. What causes this issue\n2. Why it impacts performance\n3. Step-by-step how to fix it\n\nContext: modern web app. Keep it practical and concise.`)
  return parts.join('\n')
}

export type AuditAction = {
  label: string
  fix: string
  route?: string
  cta?: string
  category?: 'images' | 'javascript' | 'css' | 'server' | 'seo' | 'network'
  explain?: string
  prompt?: (issue: PromptInput) => string
}

export const AUDIT_ACTIONS: Record<string, AuditAction> = {
  // Images → route to Superbird Compress
  'uses-optimized-images': {
    label: 'Images are too large',
    fix: 'Compress images to reduce file size',
    route: '/compress',
    cta: 'Fix with Superbird',
    category: 'images',
    explain: 'Your page is sending images that are larger than they need to be. The browser downloads all that extra data even though it never displays it at full resolution.',
    prompt: defaultPrompt,
  },
  'uses-responsive-images': {
    label: 'Images are oversized for their display size',
    fix: 'Serve correctly sized images for each screen',
    route: '/compress',
    cta: 'Fix with Superbird',
    category: 'images',
    explain: "Your images are bigger than the space they occupy on screen. A phone doesn't need a 2000px-wide photo to fill a 400px container.",
    prompt: defaultPrompt,
  },
  'offscreen-images': {
    label: 'Offscreen images loaded eagerly',
    fix: 'Defer images that are not visible on load',
    category: 'images',
    explain: 'Images below the fold are downloaded immediately even if the visitor never scrolls to them. Lazy-loading defers that cost until they are needed.',
    prompt: defaultPrompt,
  },
  'modern-image-formats': {
    label: 'Images are not using modern formats',
    fix: 'Convert images to WebP or AVIF',
    route: '/compress',
    cta: 'Fix with Superbird',
    category: 'images',
    explain: 'Your images are in older formats like JPEG or PNG. WebP and AVIF deliver the same visual quality at significantly smaller file sizes.',
    prompt: defaultPrompt,
  },

  // JavaScript
  'render-blocking-resources': {
    label: 'Render-blocking resources',
    fix: 'Defer or inline critical CSS/JS',
    category: 'javascript',
    explain: 'Some CSS or JavaScript files must fully download before the browser can paint anything. Until they finish, the screen stays blank.',
    prompt: defaultPrompt,
  },
  'unused-javascript': {
    label: 'Unused JavaScript',
    fix: 'Remove or defer unused JS bundles',
    category: 'javascript',
    explain: "Your site loads JavaScript that isn't executed on the current page. Every byte still has to be downloaded and parsed by the browser.",
    prompt: defaultPrompt,
  },
  'unminified-javascript': {
    label: 'JavaScript is not minified',
    fix: 'Minify JS files to reduce transfer size',
    category: 'javascript',
    explain: 'Your JavaScript files contain comments, whitespace, and long variable names that are only useful for developers. Minification strips all of that before serving.',
    prompt: defaultPrompt,
  },
  'legacy-javascript': {
    label: 'Legacy JavaScript for modern browsers',
    fix: 'Remove unnecessary polyfills and transpilation',
    category: 'javascript',
    explain: 'Your build is shipping older-syntax JavaScript to support browsers that almost nobody uses anymore. These extra polyfills add unnecessary bytes.',
    prompt: defaultPrompt,
  },
  'bootup-time': {
    label: 'JavaScript execution time is high',
    fix: 'Reduce JS parse and execution time',
    category: 'javascript',
    explain: 'The browser is spending a long time executing your JavaScript. Heavy scripts delay interactivity even after the page has visually loaded.',
    prompt: defaultPrompt,
  },

  // CSS
  'unused-css-rules': {
    label: 'Unused CSS rules',
    fix: 'Remove unused CSS with PurgeCSS or similar',
    category: 'css',
    explain: "Your stylesheets include CSS that doesn't match any element on the current page. Those rules still have to be downloaded and parsed.",
    prompt: defaultPrompt,
  },
  'unminified-css': {
    label: 'CSS is not minified',
    fix: 'Minify CSS files to reduce transfer size',
    category: 'css',
    explain: 'Your CSS files contain whitespace and comments that serve no purpose in production. Minification removes them without changing anything visible.',
    prompt: defaultPrompt,
  },

  // Server / Network
  'server-response-time': {
    label: 'Slow server response (TTFB)',
    fix: 'Reduce backend response time or add caching',
    category: 'server',
    explain: 'The server takes too long to send the first byte. Everything else — HTML, CSS, images — is blocked until that initial response arrives.',
    prompt: defaultPrompt,
  },
  'redirects': {
    label: 'Unnecessary redirects',
    fix: 'Remove redirect chains to reduce latency',
    category: 'network',
    explain: 'Each redirect adds a full network round-trip before the page can start loading. The browser has to wait for each one in sequence.',
    prompt: defaultPrompt,
  },
  'uses-text-compression': {
    label: 'Text assets are not compressed',
    fix: 'Enable Gzip or Brotli compression on your server',
    category: 'server',
    explain: 'HTML, CSS, and JS files are being sent uncompressed. Gzip or Brotli can cut their size by 70–90% with no quality loss.',
    prompt: defaultPrompt,
  },
  'total-byte-weight': {
    label: 'Page transfer size is too large',
    fix: 'Reduce total byte weight of the page',
    category: 'network',
    explain: 'The total amount of data sent to load this page is too high. Large pages are slow on mobile connections and cost users real data.',
    prompt: defaultPrompt,
  },

  // DOM
  'dom-size': {
    label: 'DOM size is excessive',
    fix: 'Reduce the number of DOM nodes',
    category: 'javascript',
    explain: 'Your page has too many HTML elements. A large DOM makes layout recalculations, style updates, and JavaScript operations slower.',
    prompt: defaultPrompt,
  },
}
