<template>
  <BaseCard ref="cardRef" hover class="media-card" @click="handleCardClick">
    <div class="media-card__image">
      <div v-if="isLoadingImage && !imageUrl" class="image-skeleton"></div>
      <img
        v-else
        :src="imageUrl"
        :alt="media.caption"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <div class="media-card__type-badge">
        <BaseBadge :variant="mediaTypeBadge">
          {{ mediaTypeLabel }}
        </BaseBadge>
      </div>
      <div class="media-card__platform-badge" :class="`media-card__platform-badge--${platform}`">
        <img :src="platformIconSrc" :alt="platformLabel" />
      </div>

      <!-- Carousel indicator for preview -->
      <div v-if="isCarousel && media.children_urls.length > 1" class="carousel-preview">
        <button
          class="carousel-preview-btn carousel-preview-btn--prev"
          :disabled="currentImageIndex === 0"
          @click.stop="previousImage"
          :aria-label="localeStore.t('media.card.a11y.previousImage')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="carousel-preview-indicator">
          {{ currentImageIndex + 1 }} / {{ totalImages }}
        </div>

        <button
          class="carousel-preview-btn carousel-preview-btn--next"
          :disabled="currentImageIndex === totalImages - 1"
          @click.stop="nextImage"
          :aria-label="localeStore.t('media.card.a11y.nextImage')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="media-card__content">
      <p class="media-card__caption">{{ truncatedCaption }}</p>

      <div class="media-card__stats">
        <MediaCardStats :media="media" />
      </div>

      <div class="media-card__footer">
        <div class="media-card__settings">
          <label class="checkbox-label" @click.stop>
            <input
              type="checkbox"
              :checked="media.is_processing_enabled"
              @change="handleToggleProcessing"
              class="checkbox-input"
            />
            <span class="checkbox-custom"></span>
            <span class="checkbox-text">{{ localeStore.t('media.card.aiProcessing') }}</span>
          </label>
        </div>

        <div v-if="formattedPostedAt" class="media-card__date">
          {{ formattedPostedAt }}
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import type { Media, MediaPlatform } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { apiService } from '@/services/api'
import { format, parseISO } from 'date-fns'
import MediaCardStats from '@/components/media/MediaCardStats.vue'
import { useLocaleStore } from '@/stores/locale'
import { createImagePlaceholder } from '@/utils/placeholders'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  'update:processing': [enabled: boolean]
}>()

const imageError = ref(false)
const currentImageIndex = ref(0)
const imageUrl = ref<string>('')
const isLoadingImage = ref(true)
let abortController: AbortController | null = null
let currentImageRequestId = 0
let usedProxyForCurrentImage = false
const localeStore = useLocaleStore()

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

function createPlaceholderUrl() {
  const label = localeStore.t('common.placeholders.image')
  return createImagePlaceholder(label)
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
    imageUrl.value = directSource
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

    imageUrl.value = resolvedUrl
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    console.error('Failed to load image via proxy:', error)
    setPlaceholderImage()
    isLoadingImage.value = false
  } finally {
    abortController = null
  }
}

function setPlaceholderImage() {
  imageError.value = true
  imageUrl.value = createPlaceholderUrl()
  isLoadingImage.value = false
}

// Load image on mount
onMounted(() => {
  void loadImage()
})

// Watch for carousel index changes
watch(currentImageIndex, () => {
  void loadImage()
})

// Cleanup pending requests on unmount
onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort()
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

// Carousel navigation (prevents card click when navigating)
function nextImage() {
  if (currentImageIndex.value < totalImages.value - 1) {
    currentImageIndex.value++
    imageError.value = false
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    imageError.value = false
  }
}

// Handle card click (only navigate when not clicking carousel buttons)
function handleCardClick() {
  emit('click')
}

// Handle checkbox toggles
function handleToggleProcessing(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:processing', target.checked)
}

const truncatedCaption = computed(() => {
  const maxLength = 100
  if (props.media.caption.length > maxLength) {
    return props.media.caption.substring(0, maxLength) + '...'
  }
  return props.media.caption
})

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

const platform = computed<MediaPlatform>(() => {
  return props.media.platform === 'youtube' ? 'youtube' : 'instagram'
})

const publicBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
const platformIconSrc = computed(() => {
  return platform.value === 'youtube'
    ? `${publicBase}/assets/platforms/youtube.png`
    : `${publicBase}/assets/platforms/instagram.png`
})

const platformLabel = computed(() => {
  return platform.value === 'youtube' ? 'YouTube' : 'Instagram'
})

const formattedPostedAt = computed(() => {
  if (!props.media.posted_at) return ''
  try {
    const date = parseISO(props.media.posted_at)
    const pattern = localeStore.t('formats.date.short')
    return format(date, pattern, { locale: localeStore.dateLocale })
  } catch (error) {
    return props.media.posted_at
  }
})
</script>

<style scoped>
.media-card {
  cursor: pointer;
  transition: all var(--transition-base);
}

.media-card__image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  background-color: var(--slate-100);
}

.media-card__image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity var(--transition-fast);
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--slate-200) 0%,
    var(--slate-100) 50%,
    var(--slate-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.media-card__type-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  z-index: 2;
}

.media-card__platform-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.35rem;
  border-radius: var(--radius-sm);
  background-color: rgba(255, 255, 255, 0.92);
  box-shadow: var(--shadow-sm);
}

.media-card__platform-badge img {
  height: 1.2rem;
  width: auto;
  max-width: 3.5rem;
  display: block;
}

/* Carousel Preview Controls */
.carousel-preview {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.media-card__image:hover .carousel-preview {
  opacity: 1;
}

.carousel-preview-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: var(--navy-700);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.carousel-preview-btn:hover:not(:disabled) {
  background-color: white;
  color: var(--blue-500);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.carousel-preview-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-preview-btn svg {
  width: 1rem;
  height: 1rem;
}

.carousel-preview-indicator {
  background-color: rgba(255, 255, 255, 0.95);
  color: var(--navy-800);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

.media-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.media-card__caption {
  font-size: 0.875rem;
  color: var(--navy-700);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.media-card__stats {
  display: flex;
  justify-content: flex-end;
}

.media-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.media-card__date {
  font-size: 0.75rem;
  color: var(--navy-500);
  font-weight: 500;
}

.media-card__settings {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

/* Checkbox styling - Pineapple style */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-fast);
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

.checkbox-label:hover {
  background-color: rgba(100, 116, 139, 0.05);
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  background-color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-label:hover .checkbox-custom {
  border-color: #94a3b8;
}

.checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -60%) rotate(45deg);
}

.checkbox-input:focus + .checkbox-custom {
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  outline: none;
}

.checkbox-text {
  font-size: 0.75rem;
  color: var(--navy-600);
  font-weight: 500;
  line-height: 1;
}
</style>
