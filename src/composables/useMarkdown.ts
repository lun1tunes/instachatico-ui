/**
 * Simple markdown parser for live preview with basic sanitization
 * Supports basic markdown syntax without external dependencies
 */

const PLACEHOLDER_PREFIX = '__MD_PLACEHOLDER__'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value: string): string {
  return escapeHtml(value)
}

function sanitizeUrl(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const lower = trimmed.toLowerCase()
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return null
  }

  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed
  }

  return null
}

export function useMarkdown() {
  function parseMarkdown(markdown: string): string {
    if (!markdown) return ''

    const lines = markdown.split('\n')
    const result: string[] = []
    let inList = false
    let inCodeBlock = false
    let currentParagraph: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        result.push('<p>' + currentParagraph.join(' ') + '</p>')
        currentParagraph = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = (lines[i] ?? '').trimEnd()

      if (line.startsWith('```')) {
        flushParagraph()
        if (!inCodeBlock) {
          inCodeBlock = true
          result.push('<pre><code>')
        } else {
          inCodeBlock = false
          result.push('</code></pre>')
        }
        continue
      }

      if (inCodeBlock) {
        result.push(escapeHtml(line) + '\n')
        continue
      }

      if (line.startsWith('#')) {
        flushParagraph()
        const match = line.match(/^(#{1,6})\s+(.*)$/)
        if (match) {
          const [, hashes = '', headingText = ''] = match
          const level = hashes.length
          const text = processInline(headingText)
          result.push(`<h${level}>${text}</h${level}>`)
          continue
        }
      }

      const listMatch = line.match(/^[\*\-]\s+(.*)$/) || line.match(/^\d+\.\s+(.*)$/)
      if (listMatch) {
        flushParagraph()
        if (!inList) {
          result.push('<ul>')
          inList = true
        }
        const [, listText = ''] = listMatch
        result.push('<li>' + processInline(listText) + '</li>')
        continue
      } else if (inList && line.trim() === '') {
        result.push('</ul>')
        inList = false
        continue
      } else if (inList) {
        result.push('</ul>')
        inList = false
      }

      if (line.trim() === '') {
        flushParagraph()
        continue
      }

      currentParagraph.push(processInline(line))
    }

    if (inList) {
      result.push('</ul>')
    }
    flushParagraph()

    return result.join('')
  }

  function processInline(text: string): string {
    if (!text) return ''

    const placeholders: string[] = []
    const createPlaceholder = (html: string) => {
      const token = `${PLACEHOLDER_PREFIX}${placeholders.length}__`
      placeholders.push(html)
      return token
    }

    let working = text

    working = working.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt = '', url = '') => {
      const safeUrl = sanitizeUrl(url)
      if (!safeUrl) {
        return alt
      }
      return createPlaceholder(
        `<img src="${escapeAttribute(safeUrl)}" alt="${escapeAttribute(alt)}" loading="lazy" referrerpolicy="no-referrer" />`
      )
    })

    working = working.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label = '', url = '') => {
      const safeUrl = sanitizeUrl(url)
      if (!safeUrl) {
        return label
      }
      return createPlaceholder(
        `<a href="${escapeAttribute(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`
      )
    })

    working = working.replace(/`([^`]+)`/g, (_match, code = '') => {
      return createPlaceholder(`<code>${escapeHtml(code)}</code>`)
    })

    let escaped = escapeHtml(working)

    escaped = escaped.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    escaped = escaped.replace(/__(.+?)__/g, '<strong>$1</strong>')
    escaped = escaped.replace(/\*(.+?)\*/g, '<em>$1</em>')
    escaped = escaped.replace(/_(.+?)_/g, '<em>$1</em>')

    placeholders.forEach((html, index) => {
      const token = `${PLACEHOLDER_PREFIX}${index}__`
      escaped = escaped.split(token).join(html)
    })

    return escaped
  }

  return {
    parseMarkdown
  }
}
