<template>
  <BaseCard class="media-detail-card">
    <div class="media-detail-card__image">
      <img :src="imageUrl" :alt="media.caption" @error="handleImageError" @load="handleImageLoad" />

      <!-- Carousel Navigation -->
      <div v-if="isCarousel && media.children_urls.length > 1" class="carousel-controls">
        <button
          class="carousel-btn carousel-btn--prev"
          :disabled="currentImageIndex === 0"
          @click="previousImage"
          aria-label="Previous image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <button
          class="carousel-btn carousel-btn--next"
          :disabled="currentImageIndex === totalImages - 1"
          @click="nextImage"
          aria-label="Next image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="carousel-indicator">
          {{ currentImageIndex + 1 }} / {{ totalImages }}
        </div>
      </div>
    </div>

    <div class="media-detail-card__info">
      <div class="info-row">
        <span class="label">{{ localeStore.t('media.detail.type') }}:</span>
        <BaseBadge :variant="mediaTypeBadge">{{ mediaTypeLabel }}</BaseBadge>
      </div>

      <div class="info-row">
        <span class="label">{{ localeStore.t('media.detail.likes') }}:</span>
        <span class="value">{{ media.like_count }}</span>
      </div>

      <div class="info-row">
        <span class="label">{{ localeStore.t('media.detail.commentsCount') }}:</span>
        <span class="value">{{ media.comments_count }}</span>
      </div>

      <div v-if="media.posted_at" class="info-row">
        <span class="label">{{ localeStore.t('media.detail.createdAt') }}:</span>
        <span class="value">{{ formattedPostedAt }}</span>
      </div>

      <div class="info-row info-row--instagram">
        <BaseButton
          v-if="instagramUrl"
          variant="ghost"
          size="sm"
          class="instagram-link-btn instagram-link-btn--full"
          @click="openPermalink"
        >
          {{ localeStore.t('media.card.viewOnInstagram') }}
        </BaseButton>
        <span v-else class="value">—</span>
      </div>
    </div>

    <div class="media-detail-card__caption">
      <h4>{{ localeStore.t('media.card.caption') }}</h4>
      <p>{{ media.caption }}</p>
    </div>

    <div class="media-detail-card__context">
      <div class="context-header">
        <h4>{{ localeStore.t('media.card.aiContext') }}</h4>
        <BaseButton variant="ghost" size="sm" @click="showContextModal = true">
          <svg
            class="action-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="m16.5 3.5 4 4-11 11H5.5v-6.5l11-11Z" />
          </svg>
          {{ localeStore.t('media.card.editContext') }}
        </BaseButton>
      </div>
      <div class="context-content markdown-body" v-html="renderedContext"></div>
    </div>

    <div class="media-detail-card__settings">
      <h4>{{ localeStore.t('media.card.settings') }}</h4>
      <div class="settings-group">
        <label class="checkbox-label checkbox-label--danger">
          <input
            type="checkbox"
            :checked="media.is_processing_enabled"
            @change="toggleProcessing"
          />
          <span>{{ localeStore.t('media.detail.enableProcessing') }}</span>
        </label>

        <label class="checkbox-label checkbox-label--danger">
          <input
            type="checkbox"
            :checked="media.is_comment_enabled"
            @change="confirmToggleComments"
          />
          <div class="checkbox-content">
            <span>{{ localeStore.t('media.card.allowComments') }}</span>
            <small>{{ localeStore.t('media.card.allowCommentsWarning') }}</small>
          </div>
        </label>
      </div>
    </div>

  </BaseCard>

  <FullScreenMarkdownEditor
    v-model="showContextModal"
    :title="localeStore.t('media.detail.editContextTitle')"
    :initial-content="media.context"
    :placeholder="localeStore.t('common.placeholders.context')"
    :save-button-text="localeStore.t('media.detail.saveContext')"
    @save="saveContext"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { Media, UpdateMediaRequest } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FullScreenMarkdownEditor from '@/components/ui/FullScreenMarkdownEditor.vue'
import { apiService } from '@/services/api'
import { format, parseISO } from 'date-fns'
import { useConfirm } from '@/composables/useConfirm'
import { useMarkdown } from '@/composables/useMarkdown'
import { useLocaleStore } from '@/stores/locale'
import { createImagePlaceholder } from '@/utils/placeholders'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: UpdateMediaRequest]
}>()

const { confirm } = useConfirm()
const { parseMarkdown } = useMarkdown()
const localeStore = useLocaleStore()

const showContextModal = ref(false)
const imageError = ref(false)
const currentImageIndex = ref(0)
const imageUrl = ref<string>('')
const isLoadingImage = ref(true)
let abortController: AbortController | null = null
let currentImageRequestId = 0
let usedProxyForCurrentImage = false

// Check if this is a carousel
const isCarousel = computed(() => props.media.type === MediaType.CAROUSEL)

// Total number of images (for carousel)
const totalImages = computed(() => {
  if (isCarousel.value && props.media.children_urls.length > 0) {
    return props.media.children_urls.length
  }
  return 1
})

function getDirectImageSource(): string | null {
  if (isCarousel.value) {
    return props.media.children_urls[currentImageIndex.value] ?? null
  }
  return props.media.url ?? null
}

function updateImageUrl(newUrl: string) {
  const previous = imageUrl.value
  if (previous && previous.startsWith('blob:') && previous !== newUrl) {
    URL.revokeObjectURL(previous)
  }
  imageUrl.value = newUrl
}

function setPlaceholderImage() {
  imageError.value = true
  const label = localeStore.t('common.placeholders.image')
  updateImageUrl(createImagePlaceholder(label, { width: 400, height: 400 }))
  isLoadingImage.value = false
}

async function loadImage(forceProxy = false) {
  currentImageRequestId += 1
  const requestId = currentImageRequestId

  if (abortController) {
    abortController.abort()
    abortController = null
  }

  const directSource = forceProxy ? null : getDirectImageSource()

  if (directSource) {
    usedProxyForCurrentImage = false
    imageError.value = false
    isLoadingImage.value = true
    updateImageUrl(directSource)
    return
  }

  await loadImageViaProxy(requestId)
}

async function loadImageViaProxy(requestId: number) {
  abortController = new AbortController()
  usedProxyForCurrentImage = true
  imageError.value = false
  isLoadingImage.value = true

  try {
    const childIndex =
      isCarousel.value && props.media.children_urls.length > 0
        ? currentImageIndex.value
        : undefined

    const resolvedUrl = await apiService.fetchMediaImage(
      props.media.id,
      childIndex,
      { signal: abortController.signal }
    )

    if (requestId !== currentImageRequestId) {
      return
    }

    updateImageUrl(resolvedUrl)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    console.error('Failed to load image:', error)
    setPlaceholderImage()
  } finally {
    abortController = null
  }
}

// Load image on mount and when index changes
watch([() => props.media.id, currentImageIndex], () => {
  void loadImage()
}, { immediate: true })

// Cleanup blob URLs on unmount
onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
  }
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

function handleImageError() {
  if (!usedProxyForCurrentImage) {
    void loadImage(true)
    return
  }
  setPlaceholderImage()
}

function handleImageLoad() {
  isLoadingImage.value = false
}

// Carousel navigation
function nextImage() {
  if (currentImageIndex.value < totalImages.value - 1) {
    currentImageIndex.value++
    imageError.value = false // Reset error state for new image
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    imageError.value = false // Reset error state for new image
  }
}

const mediaTypeLabel = computed(() => {
  switch (props.media.type) {
    case MediaType.IMAGE:
      return localeStore.t('media.card.types.image')
    case MediaType.VIDEO:
      return localeStore.t('media.card.types.video')
    case MediaType.CAROUSEL:
      return localeStore.t('media.card.types.carousel')
    default:
      return localeStore.t('media.card.types.unknown')
  }
})

const mediaTypeBadge = computed(() => {
  switch (props.media.type) {
    case MediaType.VIDEO:
      return 'info'
    case MediaType.CAROUSEL:
      return 'partnership'
    default:
      return 'default'
  }
})

function resolveSafeExternalUrl(raw?: string | null): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''

  try {
    const fallbackOrigin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://localhost'
    const parsed = new URL(trimmed, fallbackOrigin)
    const protocol = parsed.protocol.toLowerCase()

    if (protocol === 'http:' || protocol === 'https:') {
      return parsed.toString()
    }
  } catch (_error) {
    return ''
  }

  return ''
}

const instagramUrl = computed(() => {
  const fromPermalink = resolveSafeExternalUrl(props.media.permalink)
  if (fromPermalink) {
    return fromPermalink
  }

  if (props.media.shortcode) {
    return resolveSafeExternalUrl(`https://www.instagram.com/p/${props.media.shortcode}/`)
  }

  return ''
})

const formattedPostedAt = computed(() => {
  if (!props.media.posted_at) return ''
  try {
    const date = parseISO(props.media.posted_at)
    const pattern = localeStore.t('formats.date.withTime')
    return format(date, pattern, { locale: localeStore.dateLocale })
  } catch (error) {
    console.error('Failed to parse posted_at date:', error)
    return props.media.posted_at
  }
})

const renderedContext = computed(() => {
  return parseMarkdown(props.media.context || '')
})

function toggleComments(enabled: boolean) {
  emit('update', { is_comment_enabled: enabled })
}

async function confirmToggleComments(event: Event) {
  const target = event.target as HTMLInputElement
  const nextValue = target.checked

  if (!nextValue) {
    const confirmed = await confirm({
      title: localeStore.t('comments.confirmations.disableComments.title'),
      message: localeStore.t('comments.confirmations.disableComments.message'),
      variant: 'danger',
      confirmText: localeStore.t('comments.confirmations.disableComments.confirm'),
      cancelText: localeStore.t('comments.confirmations.disableComments.cancel')
    })

    if (!confirmed) {
      target.checked = true
      return
    }
  }

  toggleComments(nextValue)
}

function toggleProcessing(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', { is_processing_enabled: target.checked })
}

function saveContext(content: string) {
  emit('update', { context: content })
}

function openPermalink() {
  const url = instagramUrl.value
  if (!url || typeof window === 'undefined') {
    return
  }

  const newTab = window.open(url, '_blank', 'noopener,noreferrer')
  if (newTab) {
    newTab.opener = null
  }
}
</script>

<style scoped>
.media-detail-card__image {
  width: 100%;
  padding-top: 100%;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--slate-100);
  margin-bottom: var(--spacing-lg);
}

.media-detail-card__image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity var(--transition-fast);
}

/* Carousel Controls */
.carousel-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.carousel-btn {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: var(--navy-700);
  cursor: pointer;
  transition: all var(--transition-fast);
  pointer-events: all;
  margin: 0 var(--spacing-md);
  box-shadow: var(--shadow-md);
}

.carousel-btn:hover:not(:disabled) {
  background-color: white;
  color: var(--blue-500);
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.carousel-indicator {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(15, 23, 42, 0.8);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  pointer-events: all;
  backdrop-filter: blur(4px);
}

.media-detail-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--slate-200);
  margin-bottom: var(--spacing-lg);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.info-row--instagram {
  justify-content: center;
}

.label {
  color: var(--navy-600);
  font-weight: 500;
}

.value {
  color: var(--navy-800);
}

.instagram-link-btn {
  padding: 0.625rem 1rem;
  width: 100%;
  justify-content: center;
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  font-weight: 600;
}

.instagram-link-btn--full {
  width: 100%;
}

.info-row .instagram-link-btn {
  flex: 1;
}

.media-detail-card__caption,
.media-detail-card__context,
.media-detail-card__settings {
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--slate-200);
  margin-bottom: var(--spacing-lg);
}

.media-detail-card__caption h4,
.media-detail-card__settings h4,
.context-header h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--navy-700);
}

.context-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.context-header .action-icon {
  width: 1rem;
  height: 1rem;
}

.media-detail-card__caption p {
  font-size: 0.875rem;
  color: var(--navy-600);
  line-height: 1.6;
  margin: 0;
}

/* Markdown context styles */
.context-content {
  font-size: 0.875rem;
  color: var(--navy-600);
  line-height: 1.6;
}

.markdown-body {
  color: var(--navy-800);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: var(--navy-900);
  line-height: 1.3;
}

.markdown-body :deep(h1) { font-size: 1.5em; }
.markdown-body :deep(h2) { font-size: 1.25em; }
.markdown-body :deep(h3) { font-size: 1.125em; }
.markdown-body :deep(h4) { font-size: 1em; }

.markdown-body :deep(h1:first-child),
.markdown-body :deep(h2:first-child),
.markdown-body :deep(h3:first-child),
.markdown-body :deep(h4:first-child) {
  margin-top: 0;
}

.markdown-body :deep(p) {
  margin: 0 0 1em 0;
}

.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(p + ul),
.markdown-body :deep(p + ol) {
  margin-top: 0;
}

.markdown-body :deep(p:has(+ ul)),
.markdown-body :deep(p:has(+ ol)) {
  margin-bottom: 0;
}

.markdown-body :deep(ul:last-child),
.markdown-body :deep(ol:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--navy-900);
}

.markdown-body :deep(em) {
  font-style: italic;
}

.markdown-body :deep(code) {
  padding: 0.125rem 0.375rem;
  background: var(--slate-100);
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8125em;
  color: var(--navy-800);
}

.markdown-body :deep(pre) {
  padding: var(--spacing-sm);
  background: var(--navy-900);
  color: #e2e8f0;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 0.75em 0;
  padding-left: 1.5em;
}

.markdown-body :deep(li) {
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

.markdown-body :deep(li p) {
  margin: 0;
  display: inline;
}

.markdown-body :deep(a) {
  color: var(--blue-600);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: 0.5em 0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--navy-700);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.checkbox-label:hover {
  background-color: var(--slate-100);
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.checkbox-label--danger {
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.checkbox-label--danger:hover {
  background-color: rgba(239, 68, 68, 0.08);
}

.checkbox-label--danger small {
  color: var(--error);
  font-size: 0.75rem;
  line-height: 1.2;
}

.media-detail-card__link {
  margin-bottom: 0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--navy-700);
}

.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-sans);
  color: var(--navy-800);
  background-color: white;
  resize: vertical;
  transition: all var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}
</style>
