<template>
  <div class="media-card-stats">
    <div class="media-card-stats__row">
      <div class="media-card-stats__chips">
        <template v-if="isLoading">
          <span
            v-for="n in 5"
            :key="`skeleton-${n}`"
            class="chip chip--skeleton"
        >
          <span class="chip__icon"></span>
          <span class="chip__numbers">
            <span class="chip__total"></span>
            <span class="chip__delta"></span>
          </span>
        </span>
      </template>

      <template v-else-if="error">
        <button type="button" class="chip chip--error" @click.stop="handleRetry">
          {{ localeStore.t('common.actions.retry') }}
        </button>
      </template>

      <template v-else>
        <span
          v-for="item in classificationItems"
          :key="item.key"
          class="chip"
          :class="`chip--${item.key}`"
          :title="item.title"
        >
          <span class="chip__icon" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <span class="chip__numbers">
            <span class="chip__total">{{ item.total }}</span>
            <span class="chip__delta" :class="{ 'is-positive': !!item.lastHour && item.lastHour > 0 }">
              {{ formatDelta(item.lastHour) }}
            </span>
          </span>
        </span>
      </template>
    </div>

    <div
      ref="infoTrigger"
      class="media-card-stats__info"
      :class="{ 'media-card-stats__info--active': tooltipVisible }"
      :aria-label="infoTooltipLabel"
      role="note"
      tabindex="0"
      @pointerdown.stop
      @click.stop.prevent="toggleTooltip"
      @touchstart.stop.prevent="handleTouch"
      @mouseenter="showTooltip()"
      @mouseleave="hideTooltip"
      @focus="showTooltip()"
      @blur="hideTooltip"
      @keydown.enter.prevent="toggleTooltip"
      @keydown.space.prevent="toggleTooltip"
    >
      <svg
        class="media-card-stats__info-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          stroke-width="1.5"
          opacity="0.7"
        />
        <path
          d="M12 11.5V16"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <circle cx="12" cy="8" r="1" fill="currentColor" />
      </svg>
      <div class="media-card-stats__tooltip" :class="{ 'is-visible': tooltipVisible }">
        <p>{{ localeStore.t('media.stats.tooltipTotal') }}</p>
        <p>{{ localeStore.t('media.stats.tooltipDelta') }}</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, watch, type Component, ref, onBeforeUnmount } from 'vue'
import type { Media } from '@/types/api'
import { useMediaStatsStore, type ClassificationGroupKey } from '@/stores/mediaStats'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps<{
  media: Media
}>()

const mediaStatsStore = useMediaStatsStore()
const localeStore = useLocaleStore()

const statsState = computed(() => mediaStatsStore.getStats(props.media.id))

const isLoading = computed(() => statsState.value.loading)
const error = computed(() => statsState.value.error)

const likesTotal = computed(() => props.media.like_count ?? 0)
const infoTooltipLabel = computed(() => localeStore.t('media.stats.legendLabel'))
const tooltipVisible = ref(false)
const infoTrigger = ref<HTMLElement | null>(null)
let autoHideTimer: ReturnType<typeof setTimeout> | null = null

type StatChipKey = ClassificationGroupKey | 'likes'

interface StatChip {
  key: StatChipKey
  icon: Component
  title: string
  total: number
  lastHour: number | null
}

const classificationItems = computed<StatChip[]>(() => {
  const groups = statsState.value.data?.classifications
  return [
    {
      key: 'likes',
      icon: LikeIcon,
      title: localeStore.t('media.stats.titles.likes'),
      total: likesTotal.value,
      lastHour: null
    },
    {
      key: 'questions',
      icon: QuestionIcon,
      title: localeStore.t('media.stats.titles.questions'),
      total: groups?.questions.total ?? 0,
      lastHour: groups?.questions.lastHour ?? 0
    },
    {
      key: 'negative',
      icon: NegativeIcon,
      title: localeStore.t('media.stats.titles.negative'),
      total: groups?.negative.total ?? 0,
      lastHour: groups?.negative.lastHour ?? 0
    },
    {
      key: 'positive',
      icon: PositiveIcon,
      title: localeStore.t('media.stats.titles.positive'),
      total: groups?.positive.total ?? 0,
      lastHour: groups?.positive.lastHour ?? 0
    },
    {
      key: 'urgent',
      icon: UrgentIcon,
      title: localeStore.t('media.stats.titles.urgent'),
      total: groups?.urgent.total ?? 0,
      lastHour: groups?.urgent.lastHour ?? 0
    },
    {
      key: 'other',
      icon: OtherIcon,
      title: localeStore.t('media.stats.titles.other'),
      total: groups?.other.total ?? 0,
      lastHour: groups?.other.lastHour ?? 0
    }
  ]
})

onMounted(() => {
  if (!statsState.value.data && !statsState.value.loading) {
    mediaStatsStore.fetchStats(props.media.id)
  }
})

watch(
  () => props.media.id,
  (newId, oldId) => {
    if (newId !== oldId) {
      mediaStatsStore.fetchStats(newId)
    }
  }
)

function handleRetry() {
  mediaStatsStore.fetchStats(props.media.id)
}

function formatDelta(value: number | null): string {
  if (value === null || value === undefined) {
    return '--'
  }
  if (value > 0) {
    return `(+${value})`
  }
  if (value === 0) {
    return '(0)'
  }
  return `(${value})`
}

function clearAutoHideTimer() {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
}

function showTooltip(autoHide = false) {
  clearAutoHideTimer()
  tooltipVisible.value = true
  if (autoHide) {
    autoHideTimer = window.setTimeout(() => {
      tooltipVisible.value = false
      autoHideTimer = null
    }, 2500)
  }
}

function hideTooltip() {
  clearAutoHideTimer()
  tooltipVisible.value = false
}

function toggleTooltip() {
  if (tooltipVisible.value) {
    hideTooltip()
  } else {
    showTooltip(true)
  }
}

function handleTouch() {
  showTooltip(true)
}

onBeforeUnmount(() => {
  clearAutoHideTimer()
})

const LikeIcon = {
  name: 'LikeIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('path', {
          d: 'M10.5 9.5V6.75C10.5 6.05964 10.7769 5.39893 11.2678 4.90803C11.7587 4.41712 12.4194 4.14021 13.1098 4.14021C13.6055 4.14021 14 4.53472 14 5.03046C14 6.02148 13.6276 7.3796 12.5 8.5H18.184C18.6646 8.5 19.1182 8.72062 19.4278 9.10193C19.7374 9.48324 19.8715 9.98613 19.793 10.4815L18.9605 15.6674C18.7929 16.7126 17.8846 17.5 16.8276 17.5H11.75C11.016 17.5 10.2291 17.2409 9.67678 16.7678C9.44666 16.5673 9.25 16.3333 9.25 16V9.5H10.5Z',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }),
        h('path', {
          d: 'M7 9.5V16.5',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round'
        }),
        h('path', {
          d: 'M5 9.5V16.5',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round'
        })
      ]
    )
  }
}

const QuestionIcon = {
  name: 'QuestionIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('path', {
          d: 'M12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.8111 13.496 11.8709 12.21 11.9829C12.0948 11.993 12 12.0877 12 12.2031V12.75',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round'
        }),
        h('circle', { cx: '12', cy: '16.5', r: '0.75', fill: 'currentColor' }),
        h('circle', { cx: '12', cy: '12', r: '8.25', stroke: 'currentColor', 'stroke-width': '1.5' })
      ]
    )
  }
}

const NegativeIcon = {
  name: 'NegativeIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('circle', { cx: '12', cy: '12', r: '8.25', stroke: 'currentColor', 'stroke-width': '1.5' }),
        h('path', { d: 'M9 12H15', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
        h('path', {
          d: 'M9 9C9.5 9.5 10.5 10 12 10C13.5 10 14.5 9.5 15 9',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round'
        })
      ]
    )
  }
}

const PositiveIcon = {
  name: 'PositiveIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('circle', { cx: '12', cy: '12', r: '8.25', stroke: 'currentColor', 'stroke-width': '1.5' }),
        h('path', { d: 'M12 9V15', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
        h('path', { d: 'M9 12H15', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' })
      ]
    )
  }
}

const UrgentIcon = {
  name: 'UrgentIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('path', {
          d: 'M12 4L19 18H5L12 4Z',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linejoin': 'round'
        }),
        h('path', { d: 'M12 9V13', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
        h('circle', { cx: '12', cy: '16', r: '0.75', fill: 'currentColor' })
      ]
    )
  }
}

const OtherIcon = {
  name: 'OtherIcon',
  render() {
    return h(
      'svg',
      { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none' },
      [
        h('circle', { cx: '8.5', cy: '12', r: '1.2', fill: 'currentColor', opacity: '0.85' }),
        h('circle', { cx: '12', cy: '12', r: '1.2', fill: 'currentColor', opacity: '0.85' }),
        h('circle', { cx: '15.5', cy: '12', r: '1.2', fill: 'currentColor', opacity: '0.85' })
      ]
    )
  }
}
</script>

<style scoped>
.media-card-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 auto;
  min-width: 0;
}

.media-card-stats__row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.media-card-stats__chips {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.2rem;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.24rem;
  padding: 0.16rem 0.38rem;
  border-radius: 9999px;
  font-size: 0.64rem;
  font-weight: 600;
  background-color: rgba(148, 163, 184, 0.12);
  color: var(--navy-500);
  white-space: nowrap;
}

.chip__icon {
  width: 0.75rem;
  height: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chip__icon svg {
  width: 100%;
  height: 100%;
}

.media-card-stats__info {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border-radius: 999px;
  flex-shrink: 0;
  cursor: help;
  outline: none;
}

.media-card-stats__info:focus-visible {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.media-card-stats__info-icon {
  width: 1rem;
  height: 1rem;
  color: var(--navy-300);
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.media-card-stats__info--active .media-card-stats__info-icon {
  color: var(--navy-500);
  transform: scale(1.05);
}

.media-card-stats__tooltip {
  position: absolute;
  right: 0;
  bottom: calc(100% + 0.5rem);
  min-width: 220px;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: var(--navy-700);
  font-size: 0.75rem;
  line-height: 1.5;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15), 0 2px 4px rgba(15, 23, 42, 0.08);
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: all var(--transition-fast);
  pointer-events: none;
  z-index: 20;
  backdrop-filter: blur(8px);
}

.media-card-stats__tooltip p {
  margin: 0;
  color: inherit;
}

.media-card-stats__tooltip p + p {
  margin-top: 0.35rem;
}

.media-card-stats__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 0.85rem;
  border: 6px solid transparent;
  border-top-color: rgba(248, 250, 252, 0.98);
}

.media-card-stats__tooltip.is-visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.chip__numbers {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  line-height: 1;
}

.chip__total {
  color: inherit;
}

.chip__delta {
  font-weight: 600;
  color: rgba(15, 23, 42, 0.45);
  font-variant-numeric: tabular-nums;
}

.chip__delta.is-positive {
  color: inherit;
}

.chip--questions {
  background: rgba(59, 130, 246, 0.12);
  color: var(--question);
}

.chip--likes {
  background: rgba(139, 92, 246, 0.16);
  color: var(--partnership);
}

.chip--negative {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.chip--positive {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
}

.chip--urgent {
  background: rgba(245, 158, 11, 0.14);
  color: var(--warning);
}

.chip--other {
  background: rgba(100, 116, 139, 0.12);
  color: var(--navy-500);
}

.chip--error {
  border: none;
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
  cursor: pointer;
  padding: 0.2rem 0.55rem;
}

.chip--error:hover {
  background: rgba(239, 68, 68, 0.2);
}

.chip--skeleton {
  gap: 0.2rem;
  color: transparent;
  background: rgba(148, 163, 184, 0.12);
}

.chip--skeleton .chip__icon {
  width: 0.65rem;
  height: 0.65rem;
}

.chip--skeleton .chip__total,
.chip--skeleton .chip__delta {
  width: 0.55rem;
  height: 0.3rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.08) 0%,
    rgba(148, 163, 184, 0.32) 50%,
    rgba(148, 163, 184, 0.08) 100%
  );
  animation: shimmer 1.4s ease-in-out infinite;
}

.chip--skeleton .chip__numbers {
  gap: 0.2rem;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 640px) {
  .chip {
    font-size: 0.65rem;
  }
}
</style>
