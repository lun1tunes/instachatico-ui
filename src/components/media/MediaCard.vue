<template>
  <BaseCard hover class="media-card" @click="$emit('click')">
    <div class="media-card__image">
      <img :src="media.url" :alt="media.caption" />
      <div class="media-card__type-badge">
        <BaseBadge :variant="mediaTypeBadge">
          {{ mediaTypeLabel }}
        </BaseBadge>
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
import { computed } from 'vue'
import type { Media } from '@/types/api'
import { MediaType } from '@/types/api'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

interface Props {
  media: Media
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

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
}

.media-card__type-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
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
