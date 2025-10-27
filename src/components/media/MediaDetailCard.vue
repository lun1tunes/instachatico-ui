<template>
  <BaseCard class="media-detail-card">
    <div class="media-detail-card__image">
      <img :src="imageUrl" :alt="media.caption" @error="handleImageError" />

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
        <span class="label">Type:</span>
        <BaseBadge :variant="mediaTypeBadge">{{ mediaTypeLabel }}</BaseBadge>
      </div>

      <div class="info-row">
        <span class="label">Likes:</span>
        <span class="value">{{ media.like_count }}</span>
      </div>

      <div class="info-row">
        <span class="label">Comments:</span>
        <span class="value">{{ media.comments_count }}</span>
      </div>

      <div class="info-row">
        <BaseButton
          v-if="instagramUrl"
          variant="ghost"
          size="sm"
          class="instagram-link-btn"
          @click="openPermalink"
        >
          Open in Instagram
        </BaseButton>
        <span v-else class="value">—</span>
      </div>
    </div>

    <div class="media-detail-card__caption">
      <h4>Caption</h4>
      <p>{{ media.caption }}</p>
    </div>

    <div class="media-detail-card__context">
      <h4>Context</h4>
      <p>{{ media.context }}</p>
      <BaseButton variant="ghost" size="sm" @click="showContextModal = true">
        Edit Context
      </BaseButton>
    </div>

    <div class="media-detail-card__settings">
      <h4>Settings</h4>
      <div class="settings-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="media.is_comment_enabled"
            @change="toggleComments"
          />
          <span>Allow Comments</span>
        </label>

        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="media.is_processing_enabled"
            @change="toggleProcessing"
          />
          <span>Enable Processing</span>
        </label>
      </div>
    </div>

    <div class="media-detail-card__link" v-if="instagramUrl">
      <BaseButton
        variant="ghost"
        size="sm"
        full-width
        @click="openPermalink"
      >
        View on Instagram
      </BaseButton>
    </div>
  </BaseCard>

  <BaseModal v-model="showContextModal" title="Edit Context">
    <div class="modal-form">
      <label for="context" class="form-label">AI Context Description</label>
      <textarea
        id="context"
        v-model="editedContext"
        class="form-textarea"
        rows="6"
        placeholder="Override or adjust AI description of the post"
      ></textarea>
    </div>

    <template #footer>
      <BaseButton variant="ghost" @click="showContextModal = false">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" @click="saveContext">
        Save Changes
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import type { Media, UpdateMediaRequest } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { apiService } from '@/services/api'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: UpdateMediaRequest]
}>()

const showContextModal = ref(false)
const editedContext = ref(props.media.context)
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

const instagramUrl = computed(() => {
  if (props.media.permalink) {
    return props.media.permalink
  }
  if (props.media.shortcode) {
    return `https://www.instagram.com/p/${props.media.shortcode}/`
  }
  return ''
})

function toggleComments(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', { is_comment_enabled: target.checked })
}

function toggleProcessing(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', { is_processing_enabled: target.checked })
}

function saveContext() {
  emit('update', { context: editedContext.value })
  showContextModal.value = false
}

function openPermalink() {
  if (instagramUrl.value) {
    window.open(instagramUrl.value, '_blank')
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

.label {
  color: var(--navy-600);
  font-weight: 500;
}

.value {
  color: var(--navy-800);
}

.instagram-link-btn {
  padding: 0.25rem 0.75rem;
}

.media-detail-card__caption,
.media-detail-card__context,
.media-detail-card__settings {
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--slate-200);
  margin-bottom: var(--spacing-lg);
}

.media-detail-card__caption h4,
.media-detail-card__context h4,
.media-detail-card__settings h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--navy-700);
  margin-bottom: var(--spacing-sm);
}

.media-detail-card__caption p,
.media-detail-card__context p {
  font-size: 0.875rem;
  color: var(--navy-600);
  line-height: 1.6;
  margin: 0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--navy-700);
}

.checkbox-label input[type="checkbox"] {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
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
