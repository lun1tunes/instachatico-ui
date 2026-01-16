function readEnv(key: string): string {
  const value = (import.meta as any)?.env?.[key]
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function parseOrigin(value: string): string | null {
  if (!isAbsoluteUrl(value)) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function resolveAuthHostUrl(): string | null {
  const envHost = readEnv('VITE_MIDDLE_URL') || readEnv('VITE_AUTH_HOST_URL')
  if (envHost) {
    const origin = parseOrigin(envHost)
    if (origin) return normalizeUrl(origin)
  }

  const tokenUrl = readEnv('VITE_AUTH_TOKEN_URL')
  if (tokenUrl) {
    const origin = parseOrigin(tokenUrl)
    if (origin) return normalizeUrl(origin)
  }

  return null
}

export function buildAuthTokenUrl(): string | null {
  const host = resolveAuthHostUrl()
  if (!host) return null
  return `${host}/token`
}

export function buildAuthApiUrl(path: string): string | null {
  const host = resolveAuthHostUrl()
  if (!host) return null
  const cleanPath = path.replace(/^\/+/, '')
  return `${host}/api/v1/${cleanPath}`
}
