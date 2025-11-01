<template>
  <BaseCard ref="cardRef" hover class="media-card" @click="handleCardClick">
    <div class="media-card__image">
      <div v-if="isLoadingImage && !imageUrl" class="image-skeleton"></div>
      <img v-else :src="imageUrl" :alt="media.caption" @error="handleImageError" />
      <div class="media-card__type-badge">
        <BaseBadge :variant="mediaTypeBadge">
          {{ mediaTypeLabel }}
        </BaseBadge>
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
          <div class="media-card__toggle" @click.stop>
            <v-switch
              :model-value="media.is_processing_enabled"
              color="primary"
              density="compact"
              hide-details
              inset
              :label="localeStore.t('media.card.aiProcessing')"
              @update:model-value="handleProcessingSwitch"
            />
          </div>
          <div class="media-card__toggle" @click.stop>
            <v-switch
              :model-value="media.is_comment_enabled"
              color="primary"
              density="compact"
              hide-details="auto"
              inset
              :label="localeStore.t('media.card.allowComments')"
              :messages="[localeStore.t('media.card.allowCommentsWarning')]"
              @update:model-value="handleCommentsSwitch"
            />
          </div>
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
import type { Media } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { apiService } from '@/services/api'
import { format, parseISO } from 'date-fns'
import MediaCardStats from '@/components/media/MediaCardStats.vue'
import { useLocaleStore } from '@/stores/locale'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  'update:comments': [enabled: boolean]
  'update:processing': [enabled: boolean]
}>()

const imageError = ref(false)
const currentImageIndex = ref(0)
const imageUrl = ref<string>('')
const isLoadingImage = ref(true)
let abortController: AbortController | null = null
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

// Fetch image as blob with auth header
async function loadImage() {
  // Cancel previous request if still pending
  if (abortController) {
    abortController.abort()
  }

  abortController = new AbortController()
  isLoadingImage.value = true
  imageError.value = false

  try {
    const childIndex = isCarousel.value && props.media.children_urls.length > 0
      ? currentImageIndex.value
      : undefined

    const blobUrl = await apiService.fetchMediaImage(props.media.id, childIndex)

    // Revoke old URL to prevent memory leaks
    if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl.value)
    }

    imageUrl.value = blobUrl
  } catch (error) {
    // Ignore abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      return
    }
    console.error('Failed to load image:', error)
    imageError.value = true
    const label = localeStore.t('common.placeholders.image')
    imageUrl.value = `https://via.placeholder.com/400x400/3b82f6/ffffff?text=${encodeURIComponent(label)}`
  } finally {
    isLoadingImage.value = false
    abortController = null
  }
}

// Load image on mount
onMounted(() => {
  loadImage()
})

// Watch for carousel index changes
watch(currentImageIndex, () => {
  loadImage()
})

// Cleanup blob URLs on unmount
onBeforeUnmount(() => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value)
  }
  if (abortController) {
    abortController.abort()
  }
})

function handleImageError() {
  imageError.value = true
  const label = localeStore.t('common.placeholders.image')
  imageUrl.value = `https://via.placeholder.com/400x400/3b82f6/ffffff?text=${encodeURIComponent(label)}`
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
function handleCommentsSwitch(enabled: boolean) {
  emit('update:comments', enabled)
}

function handleProcessingSwitch(enabled: boolean) {
  emit('update:processing', enabled)
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
  flex-direction: column;
  gap: var(--spacing-xs);
  align-items: flex-start;
  width: 100%;
}
</style>
