<template>
  <BaseCard class="media-detail-card">
    <div class="media-detail-card__image">
      <img :src="media.url" :alt="media.caption" />
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
        <span class="label">Shortcode:</span>
        <code class="value">{{ media.shortcode }}</code>
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

    <div class="media-detail-card__link">
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
import { ref, computed } from 'vue'
import type { Media, UpdateMediaRequest } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

interface Props {
  media: Media
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [data: UpdateMediaRequest]
}>()

const showContextModal = ref(false)
const editedContext = ref(props.media.context)

const mediaTypeLabel = computed(() => {
  switch (props.media.type) {
    case MediaType.IMAGE:
      return 'Image'
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
  window.open(props.media.permalink, '_blank')
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

code.value {
  background-color: var(--slate-100);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
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
