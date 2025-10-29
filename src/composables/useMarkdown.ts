/**
 * Simple markdown parser for live preview
 * Supports basic markdown syntax without external dependencies
 */
export function useMarkdown() {
  function parseMarkdown(markdown: string): string {
    if (!markdown) return ''

    // Split into lines for processing
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
      let line = lines[i].trimEnd()

      // Code blocks
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
        result.push(line + '\n')
        continue
      }

      // Headers
      if (line.startsWith('#')) {
        flushParagraph()
        const match = line.match(/^(#{1,6})\s+(.*)$/)
        if (match) {
          const level = match[1].length
          const text = processInline(match[2])
          result.push(`<h${level}>${text}</h${level}>`)
          continue
        }
      }

      // Lists (unordered and ordered)
      const listMatch = line.match(/^[\*\-]\s+(.*)$/) || line.match(/^\d+\.\s+(.*)$/)
      if (listMatch) {
        flushParagraph()
        if (!inList) {
          result.push('<ul>')
          inList = true
        }
        result.push('<li>' + processInline(listMatch[1]) + '</li>')
        continue
      } else if (inList && line.trim() === '') {
        // Empty line ends the list
        result.push('</ul>')
        inList = false
        continue
      } else if (inList) {
        // Non-list line ends the list
        result.push('</ul>')
        inList = false
      }

      // Empty line
      if (line.trim() === '') {
        flushParagraph()
        continue
      }

      // Regular paragraph text
      currentParagraph.push(processInline(line))
    }

    // Flush remaining content
    if (inList) {
      result.push('</ul>')
    }
    flushParagraph()

    return result.join('')
  }

  function processInline(text: string): string {
    let result = text

    // Bold and italic (order matters!)
    result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')
    result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
    result = result.replace(/_(.+?)_/g, '<em>$1</em>')

    // Links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    // Images
    result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>')

    return result
  }

  return {
    parseMarkdown
  }
}