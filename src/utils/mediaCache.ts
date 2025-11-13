import type { CommentMediaSummary } from '@/types/api'

const previewCache = new Map<string, string>()
const detailsCache = new Map<string, CommentMediaSummary>()

export function useMediaPreviewCache() {
  return previewCache
}

export function useMediaDetailsCache() {
  return detailsCache
}
