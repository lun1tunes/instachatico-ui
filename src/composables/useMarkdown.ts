/**
 * Simple markdown parser for live preview
 * Supports basic markdown syntax without external dependencies
 */
export function useMarkdown() {
  function parseMarkdown(markdown: string): string {
    if (!markdown) return ''

    let html = markdown

    // Headers (h1-h6)
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Bold
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/_(.+?)_/g, '<em>$1</em>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')

    // Code blocks
    html = html.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>')
    html = html.replace(/^\- (.+)$/gim, '<li>$1</li>')
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>')
    html = html.replace(/\n/g, '<br>')

    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<')) {
      html = '<p>' + html + '</p>'
    }

    return html
  }

  return {
    parseMarkdown
  }
}