/**
 * detectStack.ts
 *
 * Detects frameworks, CMS, website builders, and hosting from structural
 * signals only. Brand names in visible page copy are never used as signals.
 *
 * Categories:
 *   FRAMEWORK  — JS meta-frameworks and base frameworks
 *   BUILDER    — No-code / low-code site builders
 *   CMS        — Traditional content management systems
 *   HOSTING    — CDN / deployment platforms
 */

// ---------------------------------------------------------------------------
// Sets used by formatStackSentence and the store
// ---------------------------------------------------------------------------

export const FRAMEWORKS = new Set(['Nuxt', 'Next.js', 'Vue', 'React', 'SvelteKit', 'Svelte', 'Astro', 'Remix', 'Angular'])
export const BUILDERS   = new Set(['Shopify', 'Webflow', 'Wix', 'Squarespace', 'Framer', 'WordPress', 'Elementor', 'Divi', 'Beaver Builder', 'WooCommerce', 'Drupal', 'Joomla', 'Ghost', 'Cargo', 'Format', 'Strikingly', 'Jimdo'])
export const HOSTING    = new Set(['Vercel', 'Netlify', 'Cloudflare', 'GitHub Pages', 'Render', 'Fly.io'])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function any(haystack: string, needles: string[]): boolean {
  return needles.some(n => haystack.includes(n))
}

function anyUrl(urls: string[], needles: string[]): boolean {
  return urls.some(u => needles.some(n => u.includes(n)))
}

function anyRegex(haystack: string, patterns: RegExp[]): boolean {
  return patterns.some(p => p.test(haystack))
}

// ---------------------------------------------------------------------------
// Framework detectors
// ---------------------------------------------------------------------------

function detectFrameworks(html: string, urls: string[]): string[] {
  const out: string[] = []

  if (html.includes('__NUXT__') || html.includes('data-n-head') || anyUrl(urls, ['/_nuxt/']))
    out.push('Nuxt')
  else if (html.includes('__NEXT_DATA__') || anyUrl(urls, ['/_next/']))
    out.push('Next.js')
  else if (html.includes('__sveltekit_data') || anyUrl(urls, ['/_app/immutable/']))
    out.push('SvelteKit')
  else if (html.includes('__remixContext') || anyUrl(urls, ['/__remix_manifest']))
    out.push('Remix')
  else if (html.includes('astro-island') || html.includes('astro-slot'))
    out.push('Astro')
  else {
    // Base frameworks — only if no meta-framework matched
    if (anyRegex(html, [/data-v-[0-9a-f]{6,8}/, /__vue_app__/, /__VUE__/]) || anyUrl(urls, ['/vue.runtime', '/vue.esm']))
      out.push('Vue')
    else if (any(html, ['data-reactroot', 'data-reactid', '__reactFiber']) || anyUrl(urls, ['react.production.min.js', 'react.development.js']))
      out.push('React')
    else if (anyRegex(html, [/ng-version=/, /ng-app/, /\[ng-/]) || anyUrl(urls, ['/angular/core', 'angular.min.js']))
      out.push('Angular')
    else if (any(html, ['__SVELTE_']) || anyUrl(urls, ['/svelte/']))
      out.push('Svelte')
  }

  return out
}

// ---------------------------------------------------------------------------
// Builder / CMS detectors — structural signals only
// ---------------------------------------------------------------------------

function detectBuilders(html: string, urls: string[]): string[] {
  const out: string[] = []

  // --- Shopify ---
  // Hard structural signals: CDN, JS namespace, proprietary attributes
  if (
    any(html, ['cdn.shopify.com', 'myshopify.com', 'window.Shopify', 'Shopify.theme', 'shopify-section', '/cart.js', 'data-shopify']) ||
    anyUrl(urls, ['cdn.shopify.com', 'myshopify.com'])
  ) out.push('Shopify')

  // --- WooCommerce (WordPress plugin — check before generic WP) ---
  if (
    any(html, ['woocommerce', 'wc-cart', 'wc_cart_hash', '/wc-api/', 'is-cart', 'woocommerce-page']) ||
    anyUrl(urls, ['/woocommerce/', 'wc-block'])
  ) out.push('WooCommerce')

  // --- WordPress ---
  if (
    any(html, ['/wp-content/', '/wp-includes/', 'wp-json', 'wp-embed']) ||
    anyUrl(urls, ['/wp-content/', '/wp-includes/'])
  ) out.push('WordPress')

  // --- Elementor (WordPress page builder) ---
  if (
    any(html, ['elementor-kit-', 'data-elementor-type', 'elementor-widget', 'e-con-inner']) ||
    anyUrl(urls, ['/elementor/css/', '/elementor/js/'])
  ) out.push('Elementor')

  // --- Divi (Elegant Themes) ---
  if (
    any(html, ['et_pb_section', 'et_pb_row', 'et_pb_module', 'et-db', 'data-et-multi-page']) ||
    anyUrl(urls, ['/et-core/', '/divi/'])
  ) out.push('Divi')

  // --- Beaver Builder ---
  if (
    any(html, ['fl-builder', 'fl-row', 'fl-col', 'fl-module']) ||
    anyUrl(urls, ['/bb-plugin/', '/bb-ultimate-addon/'])
  ) out.push('Beaver Builder')

  // --- Webflow ---
  if (
    any(html, ['data-wf-page', 'data-wf-site', 'data-wf-domain']) ||
    anyUrl(urls, ['assets.website-files.com', 'uploads-ssl.webflow.com', 'webflow.com/css'])
  ) out.push('Webflow')

  // --- Framer ---
  if (
    any(html, ['__framer_', 'data-framer-', 'framerusercontent.com']) ||
    anyUrl(urls, ['framerusercontent.com', 'framer.com/m/'])
  ) out.push('Framer')

  // --- Wix ---
  if (
    any(html, ['wixstatic.com', 'parastorage.com', '_wixCssModules', 'thunderbolt-']) ||
    anyUrl(urls, ['static.wixstatic.com', 'siteassets.parastorage.com'])
  ) out.push('Wix')

  // --- Squarespace ---
  if (
    any(html, ['squarespace-cdn.com', 'static1.squarespace.com', 'data-squarespace-type', 'sqs-block', 'sqs-layout']) ||
    anyUrl(urls, ['squarespace-cdn.com', 'static1.squarespace.com'])
  ) out.push('Squarespace')

  // --- Ghost ---
  if (
    any(html, ['ghost-url', 'ghost.io', '@tryghost', 'data-ghost-']) ||
    anyUrl(urls, ['/ghost/api/', 'cdn.jsdelivr.net/ghost'])
  ) out.push('Ghost')

  // --- Drupal ---
  if (
    any(html, ['drupal.org', 'data-drupal-', 'Drupal.settings', 'drupalSettings']) ||
    anyUrl(urls, ['/sites/default/files/', '/sites/all/modules/'])
  ) out.push('Drupal')

  // --- Joomla ---
  if (
    any(html, ['Joomla!', '/media/jui/', '/media/system/js/']) ||
    anyUrl(urls, ['/media/jui/', '/media/com_'])
  ) out.push('Joomla')

  // --- Strikingly ---
  if (any(html, ['strikingly.com', 's-editable']) || anyUrl(urls, ['strikingly.com'])) out.push('Strikingly')

  // --- Jimdo ---
  if (any(html, ['jimdo.com', 'jimdocontent']) || anyUrl(urls, ['jimdo.com'])) out.push('Jimdo')

  // --- Cargo ---
  if (any(html, ['cargo.site', 'cargocollective.com']) || anyUrl(urls, ['cargo.site', 'cargocollective.com'])) out.push('Cargo')

  // --- Format (portfolio builder) ---
  if (any(html, ['format.com', 'data-format-'])) out.push('Format')

  return out
}

// ---------------------------------------------------------------------------
// Hosting detectors — header-based (most reliable signal)
// ---------------------------------------------------------------------------

function detectHosting(headers: Record<string, string>): string[] {
  const out: string[] = []
  const server = (headers['server'] ?? '').toLowerCase()

  if (server.includes('cloudflare') || 'cf-ray' in headers)            out.push('Cloudflare')
  if (server.includes('vercel') || 'x-vercel-id' in headers)           out.push('Vercel')
  if (server.includes('netlify') || 'x-nf-request-id' in headers)      out.push('Netlify')
  if (server.includes('github.com') || server.includes('pages.github')) out.push('GitHub Pages')
  if (server.includes('render') || 'x-render-origin-server' in headers) out.push('Render')
  if (server.includes('fly.io') || 'fly-request-id' in headers)         out.push('Fly.io')

  return out
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function detectStack(
  html: string,
  headers?: Record<string, string>,
  resourceUrls: string[] = []
): string[] {
  const frameworks = detectFrameworks(html, resourceUrls)
  const builders   = detectBuilders(html, resourceUrls)
  const hosting    = detectHosting(headers ?? {})

  // If a JS framework is detected, suppress builder detections that are
  // almost certainly false positives (e.g. a Vue app that sells on Shopify
  // via embedded buy-button and has Shopify scripts on the page).
  // Exception: WooCommerce always coexists with WordPress intentionally.
  const hasFramework = frameworks.length > 0
  const filteredBuilders = hasFramework
    ? builders.filter(b => ['WordPress', 'WooCommerce'].includes(b))
    : builders

  return [...frameworks, ...filteredBuilders, ...hosting]
}

// ---------------------------------------------------------------------------
// Summary sentence used in auditSummary.ts
// ---------------------------------------------------------------------------

// Platform-specific context lines shown in the audit summary
const BUILDER_CONTEXT: Record<string, string> = {
  'Shopify':        'Shopify themes load significant third-party JS by default — theme bloat is usually the main performance culprit.',
  'WooCommerce':    'WooCommerce adds heavy PHP-rendered pages and often accumulates plugin script debt over time.',
  'WordPress':      'WordPress sites often accumulate plugin and theme scripts that block rendering.',
  'Elementor':      'Elementor generates significant CSS and JS overhead — consider removing unused widgets and enabling asset optimization.',
  'Divi':           'Divi\'s visual builder outputs heavy inline CSS — enable static CSS file generation in Divi performance settings.',
  'Beaver Builder': 'Beaver Builder adds inline styles per module — check if the caching and minification add-on is enabled.',
  'Webflow':        'Webflow sites can ship unused interaction JS — audit which Webflow interactions are actually in use.',
  'Framer':         'Framer sites load a large runtime bundle — optimize by reducing animations and using static exports where possible.',
  'Wix':            'Wix apps and widgets each add their own scripts — disable any unused Wix apps in your dashboard.',
  'Squarespace':    'Squarespace loads its full platform JS regardless of features used — third-party scripts are the main lever here.',
  'Nuxt':           'Server-side rendered Nuxt apps hydrate a full Vue runtime — make sure unused modules are tree-shaken.',
  'Next.js':        'Next.js bundles can grow large — use dynamic imports and the Bundle Analyzer to find heavy dependencies.',
  'SvelteKit':      'SvelteKit ships minimal JS by default — check for large data fetches or third-party embeds causing slowdowns.',
  'Astro':          'Astro ships zero JS by default — any slowdowns are likely from islands, third-party scripts, or images.',
  'Ghost':          'Ghost is fast out of the box — performance issues usually come from custom theme JS or embedded content.',
  'Drupal':         'Drupal\'s aggregated JS/CSS helps, but contrib modules often re-add their own assets — audit active modules.',
  'Joomla':         'Joomla extension scripts load globally by default — use a script manager extension to load them conditionally.',
}

export function formatStackSentence(signals: string[]): string | null {
  const framework = signals.find(s => FRAMEWORKS.has(s))
  const builder   = signals.find(s => BUILDERS.has(s))
  const host      = signals.find(s => HOSTING.has(s))

  // Compose the tech line
  const parts: string[] = []
  if (builder)   parts.push(builder)
  if (framework) parts.push(framework)
  if (host)      parts.push(host)

  if (parts.length === 0) return null

  const primary  = builder ?? framework

  // Context hint based on the primary platform
  const context = primary ? (BUILDER_CONTEXT[primary] ?? null) : null

  const techLine = parts.join(' + ')
  const stackLine = `Running on ${techLine}.`

  return context ? `${stackLine} ${context}` : stackLine
}
