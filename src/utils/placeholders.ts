function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface ImagePlaceholderOptions {
  width?: number
  height?: number
  background?: string
  foreground?: string
  fontSize?: number
}

export function createImagePlaceholder(
  label: string,
  options?: ImagePlaceholderOptions
): string {
  const width = options?.width ?? 400
  const height = options?.height ?? 400
  const background = options?.background ?? '#1d4ed8'
  const foreground = options?.foreground ?? '#ffffff'
  const fontSize = options?.fontSize ?? Math.round(Math.min(width, height) * 0.12)
  const text = escapeSvgText(label || 'Image')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${text}">
  <rect width="100%" height="100%" fill="${background}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${fontSize}" fill="${foreground}" opacity="0.95">${text}</text>
</svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
