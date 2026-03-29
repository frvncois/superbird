const CLOUDFLARE_DOH = 'https://cloudflare-dns.com/dns-query'
const QUERY_TIMEOUT_MS = 8000

export const RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'CAA', 'SOA']

export const TYPE_META: Record<string, { label: string; typeNum: number }> = {
  A:     { label: 'IPv4 address',          typeNum: 1   },
  AAAA:  { label: 'IPv6 address',          typeNum: 28  },
  CNAME: { label: 'Canonical name',        typeNum: 5   },
  MX:    { label: 'Mail exchange',         typeNum: 15  },
  TXT:   { label: 'Text records',          typeNum: 16  },
  NS:    { label: 'Nameservers',           typeNum: 2   },
  CAA:   { label: 'Certificate authority', typeNum: 257 },
  SOA:   { label: 'Start of authority',    typeNum: 6   },
}

interface DnsAnswer {
  TTL: number
  data: string
}

export interface DnsRecord {
  ttl: number
  raw: string
  value: string
  priority?: number
  subtype?: string | null
  flags?: string
  tag?: string
  mname?: string
  rname?: string
  serial?: string
  refresh?: string
  retry?: string
  expire?: string
  minimum?: string
}

export interface DnsTypeResult {
  type: string
  records: DnsRecord[]
  status: number
  error?: string
}

async function queryRecord(domain: string, type: string, signal?: AbortSignal): Promise<DnsTypeResult> {
  const timeoutSignal = AbortSignal.timeout(QUERY_TIMEOUT_MS)
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const url = `${CLOUDFLARE_DOH}?name=${encodeURIComponent(domain)}&type=${type}`
  const res = await fetch(url, {
    headers: { Accept: 'application/dns-json' },
    signal: combinedSignal,
  })
  if (!res.ok) throw new Error(`DNS query failed: ${res.status}`)
  const data: { Status: number; Answer?: DnsAnswer[] } = await res.json()
  return {
    type,
    records: parseRecords(type, data.Answer ?? []),
    status: data.Status,
  }
}

function parseRecords(type: string, answers: DnsAnswer[]): DnsRecord[] {
  return answers.map(answer => {
    const base = { ttl: answer.TTL, raw: answer.data }
    if (type === 'MX') {
      const parts = answer.data.split(' ')
      return { ...base, priority: parseInt(parts[0] ?? '0'), value: parts[1] ?? '' }
    }
    if (type === 'TXT') {
      const value = answer.data.replace(/^"|"$/g, '').replace(/" "/g, '')
      return { ...base, value, subtype: detectTxtSubtype(value) }
    }
    if (type === 'SOA') {
      const parts = answer.data.split(' ')
      return {
        ...base,
        mname: parts[0], rname: parts[1], serial: parts[2],
        refresh: parts[3], retry: parts[4], expire: parts[5], minimum: parts[6],
        value: answer.data,
      }
    }
    if (type === 'CAA') {
      const parts = answer.data.split(' ')
      return { ...base, flags: parts[0], tag: parts[1], value: parts.slice(2).join(' ').replace(/"/g, '') }
    }
    return { ...base, value: answer.data }
  })
}

function detectTxtSubtype(value: string): string | null {
  if (value.startsWith('v=spf1')) return 'SPF'
  if (value.startsWith('v=DKIM1') || value.includes('k=rsa')) return 'DKIM'
  if (value.startsWith('v=DMARC1')) return 'DMARC'
  if (value.startsWith('google-site-verification')) return 'Google verification'
  if (value.startsWith('MS=')) return 'Microsoft verification'
  if (value.startsWith('apple-domain-verification')) return 'Apple verification'
  if (value.startsWith('facebook-domain-verification')) return 'Facebook verification'
  return null
}

export async function queryAllRecords(
  domain: string,
  onProgress?: (type: string, status: string) => void,
  signal?: AbortSignal,
): Promise<Record<string, DnsTypeResult>> {
  const promises = RECORD_TYPES.map(async (type) => {
    onProgress?.(type, 'loading')
    try {
      const result = await queryRecord(domain, type, signal)
      onProgress?.(type, 'done')
      return result
    } catch (err) {
      onProgress?.(type, 'error')
      return { type, records: [], status: -1, error: (err as Error).message }
    }
  })
  const settled = await Promise.allSettled(promises)
  const results: Record<string, DnsTypeResult> = {}
  settled.forEach(s => {
    if (s.status === 'fulfilled') results[s.value.type] = s.value
  })
  return results
}
