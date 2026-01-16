<template>
  <div class="statistics-page">
    <div class="container">
      <div class="page-header">
        <h1>{{ localeStore.t('statistics.page.title') }}</h1>
        <p class="page-subtitle">{{ localeStore.t('statistics.page.subtitle') }}</p>
      </div>

      <BaseCard class="controls-card">
        <div class="controls">
          <div class="control-group">
            <label :for="`stats-period-${insightsStore.selectedPeriod}`">
              {{ localeStore.t('statistics.controls.period') }}
            </label>
            <select
              :id="`stats-period-${insightsStore.selectedPeriod}`"
              v-model="selectedPeriod"
              class="period-select"
            >
              <option
                v-for="option in periodOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <BaseButton
            :loading="insightsStore.loading"
            :disabled="insightsStore.loading"
            @click="handleGenerate"
          >
            {{ localeStore.t('statistics.controls.generate') }}
          </BaseButton>
        </div>
        <p v-if="lastUpdated" class="hint">
          {{ localeStore.t('statistics.controls.lastUpdated', { date: lastUpdated }) }}
        </p>
      </BaseCard>

      <div v-if="insightsStore.error" class="error-state">
        <p>{{ insightsStore.error }}</p>
        <BaseButton variant="ghost" @click="handleGenerate">
          {{ localeStore.t('statistics.controls.retry') }}
        </BaseButton>
      </div>

      <LoadingSpinner
        v-else-if="insightsStore.loading && !insightsStore.hasFetched"
        :message="localeStore.t('statistics.loading')"
      />

      <div v-else-if="showPromptState" class="empty-state">
        <p>{{ localeStore.t('statistics.prompt') }}</p>
      </div>

      <div v-else-if="showEmptyState" class="empty-state">
        <p>{{ localeStore.t('statistics.empty') }}</p>
      </div>

      <BaseCard v-else class="stats-card">
        <div class="stats-table-wrapper">
          <table class="stats-table">
            <thead>
              <tr>
                <th>{{ localeStore.t('statistics.table.metric') }}</th>
                <th v-for="column in monthColumns" :key="column.id">
                  {{ column.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in metricRows" :key="row.key">
                <th>{{ row.label }}</th>
                <td
                  v-for="column in monthColumns"
                  :key="`${row.key}-${column.id}`"
                >
                  <span class="value">
                    {{ row.values[column.id] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <BaseCard v-if="followerTrend.length" class="followers-card">
        <div class="followers-header">
          <div>
            <p class="followers-subtitle">{{ localeStore.t('statistics.followers.current') }}</p>
            <h2>{{ formattedFollowerCount }}</h2>
            <p class="section-description">{{ localeStore.t('statistics.followers.description') }}</p>
          </div>
          <span class="followers-period">{{ localeStore.t('statistics.followers.periodLabel', { period: periodLabel }) }}</span>
        </div>

        <div class="followers-chart">
          <div v-for="item in followerTrend" :key="item.id" class="followers-row">
            <span class="followers-row__month">{{ item.label }}</span>
            <div class="followers-row__track" :class="{ 'is-empty': item.count === 0 }">
              <div
                v-if="item.count > 0"
                class="followers-row__pill"
                :style="{ width: item.barWidth }"
              >
                <span>{{ item.countFormatted }}</span>
              </div>
              <div v-else class="followers-row__pill followers-row__pill--empty">
                <span>{{ item.countFormatted }}</span>
              </div>
            </div>
            <div class="followers-row__delta" :class="{ negative: item.delta < 0 }">
              <span>{{ item.deltaFormatted }}</span>
              <small v-if="item.percentFormatted">({{ item.percentFormatted }})</small>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard v-if="moderationSummaryRows.length" class="moderation-card">
        <div class="moderation-header">
          <div>
            <h3 class="moderation-title">{{ localeStore.t('statistics.moderation.title') }}</h3>
          </div>
          <span class="followers-period">{{ localeStore.t('statistics.followers.periodLabel', { period: periodLabel }) }}</span>
        </div>

        <div class="moderation-section moderation-section--summary">
          <div class="section-heading">
            <div>
              <h3>{{ localeStore.t('statistics.moderation.section.summaryTitle') }}</h3>
              <p class="section-description">{{ localeStore.t('statistics.moderation.section.summaryDescription') }}</p>
            </div>
          </div>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>{{ localeStore.t('statistics.table.metric') }}</th>
                  <th v-for="column in monthColumns" :key="`moderation-summary-${column.id}`">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in moderationSummaryRows" :key="row.key">
                  <th>{{ row.label }}</th>
                  <td v-for="column in monthColumns" :key="`${row.key}-${column.id}`">
                    <div class="summary-value">{{ (row.values[column.id]?.display ?? row.values[column.id]) || '—' }}</div>
                    <details
                      v-if="row.key === 'total_verified_content' && row.values[column.id]?.breakdown?.length"
                      class="classification-details"
                    >
                      <summary>{{ localeStore.t('statistics.moderation.classificationsTitle') }}</summary>
                      <div class="classification-chips">
                        <span v-for="chip in row.values[column.id]?.breakdown ?? []" :key="chip.label">
                          {{ chip.label }} {{ chip.value }}
                        </span>
                      </div>
                    </details>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="moderation-section">
          <div class="section-heading">
            <div>
              <h3>{{ localeStore.t('statistics.moderation.section.violationsTitle') }}</h3>
              <p class="section-description">{{ localeStore.t('statistics.moderation.section.violationsDescription') }}</p>
            </div>
          </div>
          <div class="stats-table-wrapper">
            <table class="stats-table">
              <thead>
                <tr>
                  <th>{{ localeStore.t('statistics.table.metric') }}</th>
                  <th v-for="column in monthColumns" :key="`moderation-violations-${column.id}`">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in moderationViolationRows" :key="row.key">
                  <th>{{ row.label }}</th>
                  <td v-for="column in monthColumns" :key="`${row.key}-${column.id}`">
                    {{ row.values[column.id] ?? '—' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { parse, format } from 'date-fns'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useInsightsStore } from '@/stores/insights'
import { useLocaleStore } from '@/stores/locale'
import type { InsightsMonth } from '@/types/api'

const insightsStore = useInsightsStore()
const localeStore = useLocaleStore()

type MetricConfig = {
  key: string
  label: string
  formatter: (value: number) => string
  getter: (month: InsightsMonth) => number | null
}

type FollowerTrendRow = {
  id: string
  label: string
  count: number
  countFormatted: string
  delta: number
  deltaFormatted: string
  percentFormatted: string | null
  barWidth: string
}

const selectedPeriod = computed({
  get: () => insightsStore.selectedPeriod,
  set: (value) => insightsStore.setPeriod(value)
})

const periodOptions = computed(() => ([
  { value: 'last_week', label: localeStore.t('statistics.periods.lastWeek') },
  { value: 'last_month', label: localeStore.t('statistics.periods.lastMonth') },
  { value: 'last_3_months', label: localeStore.t('statistics.periods.last3Months') },
  { value: 'last_6_months', label: localeStore.t('statistics.periods.last6Months') }
]))

const monthColumns = computed(() => {
  return insightsStore.months.map(month => {
    const parsed = parse(month.month, 'yyyy-MM', new Date())
    const fallback = month.month
    const label = Number.isNaN(parsed.getTime())
      ? fallback
      : format(parsed, 'LLLL yyyy', { locale: localeStore.dateLocale })
    return {
      id: month.month,
      label
    }
  })
})

const numberFormatter = computed(() => {
  return new Intl.NumberFormat(localeStore.currentLocale, {
    maximumFractionDigits: 0
  })
})

function formatNumber(value: number): string {
  return numberFormatter.value.format(value)
}

function formatReactionTime(seconds: number | null): string {
  if (seconds === null || Number.isNaN(seconds)) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = seconds / 60
  if (minutes < 60) return `${minutes.toFixed(1)}m`
  const hours = minutes / 60
  return `${hours.toFixed(1)}h`
}

const metricsConfig = computed<MetricConfig[]>(() => ([
  {
    key: 'erReach',
    label: localeStore.t('statistics.metrics.erReach'),
    formatter: (value: number) => `${value.toFixed(1)}%`,
    getter: (month: InsightsMonth) => insightsStore.getEngagementRate(month)
  },
  {
    key: 'likes',
    label: localeStore.t('statistics.metrics.likes'),
    formatter: (value: number) => formatNumber(value),
    getter: (month: InsightsMonth) => insightsStore.getMetricValue(month, 'likes')
  },
  {
    key: 'comments',
    label: localeStore.t('statistics.metrics.comments'),
    formatter: (value: number) => formatNumber(value),
    getter: (month: InsightsMonth) => insightsStore.getMetricValue(month, 'comments')
  },
  {
    key: 'saves',
    label: localeStore.t('statistics.metrics.saves'),
    formatter: (value: number) => formatNumber(value),
    getter: (month: InsightsMonth) => insightsStore.getMetricValue(month, 'saves')
  },
  {
    key: 'shares',
    label: localeStore.t('statistics.metrics.shares'),
    formatter: (value: number) => formatNumber(value),
    getter: (month: InsightsMonth) => insightsStore.getMetricValue(month, 'shares')
  },
  {
    key: 'reach',
    label: localeStore.t('statistics.metrics.reach'),
    formatter: (value: number) => formatNumber(value),
    getter: (month: InsightsMonth) => insightsStore.getMetricValue(month, 'reach')
  }
]))

const metricRows = computed(() => {
  return metricsConfig.value.map((config) => {
    const values: Record<string, string> = {}

    insightsStore.months.forEach((month) => {
      const raw = config.getter(month)
      if (raw === null) {
        values[month.month] = '—'
      } else {
        values[month.month] = config.formatter(raw)
      }
    })

    return {
      key: config.key,
      label: config.label,
      values
    }
  })
})

const lastUpdated = computed(() => {
  if (!insightsStore.insights?.generated_at) return ''
  try {
    const parsed = new Date(insightsStore.insights.generated_at)
    const pattern = localeStore.t('formats.date.withTime')
    return format(parsed, pattern, { locale: localeStore.dateLocale })
  } catch (error) {
    return ''
  }
})

const showPromptState = computed(() => !insightsStore.hasFetched && !insightsStore.loading)
const showEmptyState = computed(() => insightsStore.hasFetched && !monthColumns.value.length && !insightsStore.loading)

const periodLabelKey = computed(() => {
  const map: Record<string, string> = {
    last_week: 'statistics.periods.lastWeek',
    last_month: 'statistics.periods.lastMonth',
    last_3_months: 'statistics.periods.last3Months',
    last_6_months: 'statistics.periods.last6Months'
  }
  return map[insightsStore.selectedPeriod] || 'statistics.periods.lastMonth'
})

const periodLabel = computed(() => localeStore.t(periodLabelKey.value))

const moderationClassificationMap = computed(() => {
  const map: Record<string, Array<{ label: string; value: string }>> = {}
  const order = [
    { key: 'positive', label: localeStore.t('statistics.moderation.classifications.positive') },
    { key: 'critical', label: localeStore.t('statistics.moderation.classifications.critical') },
    { key: 'urgent', label: localeStore.t('statistics.moderation.classifications.urgent') },
    { key: 'question', label: localeStore.t('statistics.moderation.classifications.question') },
    { key: 'partnership', label: localeStore.t('statistics.moderation.classifications.partnership') },
    { key: 'toxic', label: localeStore.t('statistics.moderation.classifications.toxic') },
    { key: 'spam', label: localeStore.t('statistics.moderation.classifications.spam') }
  ]

  insightsStore.moderationMonths.forEach((month) => {
    const breakdown = month.summary.classification_breakdown
    if (!breakdown) return
    map[month.month] = order
      .map((item) => {
        const raw = Number(breakdown[item.key as keyof typeof breakdown] ?? 0)
        return { label: item.label, value: raw }
      })
      .filter((entry) => entry.value > 0)
      .map((entry) => ({ label: entry.label, value: formatNumber(entry.value) }))
  })
  return map
})

const moderationSummaryRows = computed(() => {
  if (!insightsStore.moderationMonths.length) return []
  const fields = [
    { key: 'total_verified_content', label: localeStore.t('statistics.moderation.metrics.verified'), formatter: (val: number) => formatNumber(val ?? 0) },
    { key: 'complaints_total', label: localeStore.t('statistics.moderation.metrics.complaints'), formatter: (val: number) => formatNumber(val ?? 0) },
    { key: 'complaints_processed', label: localeStore.t('statistics.moderation.metrics.complaintsProcessed'), formatter: (val: number) => formatNumber(val ?? 0) },
    { key: 'average_reaction_time_seconds', label: localeStore.t('statistics.moderation.metrics.reactionTime'), formatter: (val: number | null) => formatReactionTime(val) }
  ]

  return fields.map((field) => {
    const values: Record<string, { display: string; breakdown?: Array<{ label: string; value: string }> }> = {}
    insightsStore.moderationMonths.forEach((month) => {
      const raw = (month.summary as any)?.[field.key]
      const coerced = typeof raw === 'number' ? raw : Number(raw ?? 0)
      const cell: { display: string; breakdown?: Array<{ label: string; value: string }> } = {
        display: field.formatter(coerced)
      }
      if (field.key === 'total_verified_content') {
        cell.breakdown = moderationClassificationMap.value[month.month] ?? []
      }
      values[month.month] = cell
    })
    return { key: field.key, label: field.label, values }
  })
})

const moderationViolationRows = computed(() => {
  if (!insightsStore.moderationMonths.length) return []
  const fields = [
    { key: 'spam_advertising', label: localeStore.t('statistics.moderation.violations.spam') },
    { key: 'adult_content', label: localeStore.t('statistics.moderation.violations.adult') },
    { key: 'insults_toxicity', label: localeStore.t('statistics.moderation.violations.toxic') }
  ]

  return fields.map((field) => {
    const values: Record<string, string> = {}
    insightsStore.moderationMonths.forEach((month) => {
      const raw = month.violations[field.key as keyof typeof month.violations] as number
      const coerced = typeof raw === 'number' ? raw : Number(raw ?? 0)
      values[month.month] = formatNumber(coerced)
    })
    return { key: field.key, label: field.label, values }
  })
})

const followerTrend = computed<FollowerTrendRow[]>(() => {
  if (!insightsStore.months.length) return []

  const months = insightsStore.months
  const deltas = months.map((month) => insightsStore.getFollowerDelta(month))
  const currentFollowersValue =
    typeof insightsStore.currentFollowers === 'number' ? insightsStore.currentFollowers : null

  const followerCounts: number[] = []
  const effectiveDeltas: number[] = []
  let running = 0

  for (let i = 0; i < months.length; i++) {
    const delta = deltas[i] ?? 0
    const isLast = i === months.length - 1
    const isFirst = i === 0

    if (isLast && currentFollowersValue !== null && Number.isFinite(currentFollowersValue)) {
      const safeCurrentFollowers = Math.max(currentFollowersValue, 0)
      if (isFirst) {
        const followerCount = safeCurrentFollowers
        followerCounts[i] = followerCount
        effectiveDeltas[i] = delta
        running = followerCount
      } else {
        const previousTotal = followerCounts[i - 1] ?? running
        const adjustedDelta = safeCurrentFollowers - previousTotal
        const followerCount = safeCurrentFollowers
        followerCounts[i] = followerCount
        effectiveDeltas[i] = adjustedDelta
        running = followerCount
      }
    } else {
      running += delta
      const followerCount = Math.max(running, 0)
      followerCounts[i] = followerCount
      effectiveDeltas[i] = delta
    }
  }

  const rows: FollowerTrendRow[] = months.map((month, index) => {
    const followerCount = followerCounts[index] ?? 0
    const previousCount = index > 0 ? followerCounts[index - 1] ?? 0 : 0
    const delta = effectiveDeltas[index] ?? 0
    const percent =
      previousCount > 0 ? (delta / previousCount) * 100 : delta > 0 ? 100 : delta < 0 ? -100 : null

    return {
      id: month.month,
      label: monthColumns.value.find((col) => col.id === month.month)?.label ?? month.month,
      count: followerCount,
      countFormatted: formatNumber(Math.round(followerCount)),
      delta,
      deltaFormatted: delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${formatNumber(delta)}`,
      percentFormatted: percent === null ? null : `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
      barWidth: '0%'
    }
  })

  const maxCount = Math.max(...rows.map((row) => row.count), 0)
  rows.forEach((row) => {
    if (row.count <= 0 || maxCount === 0) {
      row.barWidth = '0%'
    } else {
      const ratio = row.count / maxCount
      row.barWidth = `${Math.max(ratio * 100, 12)}%`
    }
  })

  return rows
})

const formattedFollowerCount = computed(() => {
  const current = typeof insightsStore.currentFollowers === 'number' ? insightsStore.currentFollowers : null
  const lastTrend = followerTrend.value[followerTrend.value.length - 1]
  const fallback = lastTrend?.count ?? null
  const count = typeof current === 'number' && !Number.isNaN(current) ? current : fallback
  if (count === null || Number.isNaN(count)) return '—'
  return formatNumber(Math.round(count))
})

function handleGenerate() {
  return insightsStore.fetchInsights().catch(() => {
    // Error already handled in store
  })
}

onMounted(() => {
  // Wait for user action to fetch statistics
})
</script>

<style scoped>
.statistics-page {
  min-height: calc(100vh - 4rem);
}

.page-header {
  margin-bottom: var(--spacing-xl);
}

.page-subtitle {
  color: var(--navy-600);
  font-size: 1rem;
  margin: 0;
}

.section-description {
  margin: var(--spacing-xs) 0 0;
  color: var(--slate-500);
  font-size: 0.875rem;
}

.controls-card {
  margin-bottom: var(--spacing-xl);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: flex-end;
  justify-content: space-between;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 220px;
}

.control-group label {
  font-size: 0.875rem;
  color: var(--navy-600);
  font-weight: 500;
}

.period-select {
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--slate-300);
  font-size: 0.9375rem;
  background-color: white;
  color: var(--navy-800);
}

.hint {
  margin-top: var(--spacing-sm);
  font-size: 0.825rem;
  color: var(--slate-500);
}

.stats-card {
  padding: 0;
}

.stats-table-wrapper {
  overflow-x: auto;
}

.followers-card {
  margin-top: var(--spacing-xl);
}

.followers-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.followers-subtitle {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--slate-500);
  margin: 0 0 var(--spacing-xs) 0;
}

.followers-period {
  font-size: 0.85rem;
  color: var(--slate-500);
}

.followers-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.followers-row {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  align-items: center;
  gap: var(--spacing-md);
}

.followers-row__month {
  font-weight: 600;
  color: var(--navy-700);
}

.followers-row__track {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 999px;
  overflow: hidden;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 4px;
}

.followers-row__track.is-empty {
  background: var(--slate-200);
}

.followers-row__pill {
  background: linear-gradient(135deg, var(--blue-400), var(--blue-500));
  color: white;
  border-radius: 999px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  transition: width var(--transition-base);
}

.followers-row__pill--empty {
  background: var(--slate-300);
  color: var(--slate-600);
}

.moderation-card {
  margin-top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  border: 1px solid var(--slate-200);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
}

.moderation-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.moderation-header h3 {
  color: var(--navy-900);
  letter-spacing: 0.03em;
}

.moderation-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--navy-900);
}

.moderation-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xl);
}

.moderation-section--summary {
  gap: 0;
  margin-top: 0;
}

.moderation-classifications {
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
}

.moderation-classifications summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--blue-500);
  margin-bottom: var(--spacing-sm);
}

.moderation-classifications summary::-webkit-details-marker {
  display: none;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: var(--spacing-sm);
}

.section-heading h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--navy-900);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.followers-row__pill span {
  font-weight: 600;
}

.followers-row__delta {
  min-width: 90px;
  text-align: right;
  font-weight: 600;
  color: var(--success);
}

.followers-row__delta.negative {
  color: var(--error);
}

.followers-row__delta small {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.stats-table th {
  text-align: left;
  padding: var(--spacing-md);
  font-weight: 600;
  color: var(--navy-700);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--slate-200);
}

.stats-table tbody th {
  width: 180px;
  background-color: var(--slate-50);
  position: sticky;
  left: 0;
  z-index: 1;
}

.stats-table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--slate-100);
  font-weight: 600;
  color: var(--navy-900);
}

.stats-table tr:last-child td,
.stats-table tr:last-child th {
  border-bottom: none;
}

.summary-value {
  font-weight: 600;
  color: var(--navy-900);
}

.classification-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.classification-chips span {
  background: var(--slate-100);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  color: var(--navy-700);
}

.classification-details summary {
  cursor: pointer;
  color: var(--blue-500);
  font-size: 0.85rem;
}

.classification-details summary::-webkit-details-marker {
  display: none;
}

.value {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.error-state,
.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.error-state p {
  color: var(--error);
  margin-bottom: var(--spacing-md);
}

@media (max-width: 768px) {
  .control-group {
    width: 100%;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-table {
    min-width: unset;
  }
}
.moderation-card h3 {
  font-size: 1.1rem;
  color: var(--navy-900);
  margin: 0;
}
</style>
