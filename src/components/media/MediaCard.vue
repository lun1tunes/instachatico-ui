<template>
  <BaseCard hover class="media-card" @click="handleCardClick">
    <div class="media-card__image" @click.stop>
      <img :src="imageUrl" :alt="media.caption" @error="handleImageError" />
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
          @click="previousImage"
          aria-label="Previous image"
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
          @click="nextImage"
          aria-label="Next image"
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
        <div class="stat">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5.5 8C5.5 8 6.5 10 8 10C9.5 10 10.5 8 10.5 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ media.like_count }}</span>
        </div>

        <div class="stat">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 10.6667C14 11.0203 13.8595 11.3594 13.6095 11.6095C13.3594 11.8595 13.0203 12 12.6667 12H4.66667L2 14.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10.6667Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ media.comments_count }}</span>
        </div>
      </div>

      <div class="media-card__status">
        <BaseBadge v-if="!media.is_comment_enabled" variant="warning" size="sm">
          Comments Disabled
        </BaseBadge>
        <BaseBadge v-if="!media.is_processing_enabled" variant="error" size="sm">
          Processing Disabled
        </BaseBadge>
        <BaseBadge v-if="media.is_comment_enabled && media.is_processing_enabled" variant="success" size="sm">
          Active
        </BaseBadge>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { Media } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { apiService } from '@/services/api'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const imageError = ref(false)
const currentImageIndex = ref(0)
const imageUrl = ref<string>('')
const isLoadingImage = ref(true)

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
    console.error('Failed to load image:', error)
    imageError.value = true
    imageUrl.value = `https://via.placeholder.com/400x400/3b82f6/ffffff?text=${encodeURIComponent('Image')}`
  } finally {
    isLoadingImage.value = false
  }
}

// Load image on mount and when index changes
watch([() => props.media.id, currentImageIndex], loadImage, { immediate: true })

// Cleanup blob URLs on unmount
onBeforeUnmount(() => {
  if (imageUrl.value && imageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageUrl.value)
  }
})

function handleImageError() {
  imageError.value = true
  imageUrl.value = `https://via.placeholder.com/400x400/3b82f6/ffffff?text=${encodeURIComponent('Image')}`
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
      return 'Post'
    case MediaType.VIDEO:
      return 'Video'
    case MediaType.CAROUSEL:
      return 'Carousel'
    default:
      return 'Unknown'
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
  align-items: center;
  gap: var(--spacing-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--navy-600);
  font-size: 0.875rem;
}

.stat svg {
  color: var(--navy-400);
}

.media-card__status {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
</style>
