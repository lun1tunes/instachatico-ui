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

const insightsStore = useInsightsStore()
const localeStore = useLocaleStore()

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

const metricsConfig = computed(() => ([
  {
    key: 'erReach',
    label: localeStore.t('statistics.metrics.erReach'),
    formatter: (value: number | null) => {
      if (value === null) return '—'
      return `${value.toFixed(1)}%`
    },
    getter: (month) => insightsStore.getEngagementRate(month)
  },
  {
    key: 'likes',
    label: localeStore.t('statistics.metrics.likes'),
    formatter: (value: number) => formatNumber(value),
    getter: (month) => insightsStore.getMetricValue(month, 'likes')
  },
  {
    key: 'comments',
    label: localeStore.t('statistics.metrics.comments'),
    formatter: (value: number) => formatNumber(value),
    getter: (month) => insightsStore.getMetricValue(month, 'comments')
  },
  {
    key: 'saves',
    label: localeStore.t('statistics.metrics.saves'),
    formatter: (value: number) => formatNumber(value),
    getter: (month) => insightsStore.getMetricValue(month, 'saves')
  },
  {
    key: 'shares',
    label: localeStore.t('statistics.metrics.shares'),
    formatter: (value: number) => formatNumber(value),
    getter: (month) => insightsStore.getMetricValue(month, 'shares')
  },
  {
    key: 'reach',
    label: localeStore.t('statistics.metrics.reach'),
    formatter: (value: number) => formatNumber(value),
    getter: (month) => insightsStore.getMetricValue(month, 'reach')
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

const followerTrend = computed(() => {
  if (!insightsStore.months.length) return []

  const months = insightsStore.months
  const deltas = months.map((month) => insightsStore.getFollowerDelta(month))

  const hasCurrentFollowers =
    typeof insightsStore.currentFollowers === 'number' && Number.isFinite(insightsStore.currentFollowers)

  const followerCounts: number[] = []
  const effectiveDeltas: number[] = []
  let running = 0

  for (let i = 0; i < months.length; i++) {
    const isLast = i === months.length - 1
    const isFirst = i === 0

    if (isLast && hasCurrentFollowers) {
      // For the first (and only) month, use the delta from data instead of calculating from currentFollowers
      if (isFirst) {
        followerCounts[i] = Math.max(insightsStore.currentFollowers as number, 0)
        effectiveDeltas[i] = deltas[i]
        running = followerCounts[i]
      } else {
        const previousTotal = followerCounts[i - 1] ?? running
        const adjustedDelta = (insightsStore.currentFollowers as number) - previousTotal
        followerCounts[i] = Math.max(insightsStore.currentFollowers as number, 0)
        effectiveDeltas[i] = adjustedDelta
        running = followerCounts[i]
      }
    } else {
      running += deltas[i]
      followerCounts[i] = Math.max(running, 0)
      effectiveDeltas[i] = deltas[i]
    }
  }

  const rows = months.map((month, index) => {
    const followerCount = followerCounts[index]
    const previousCount = index > 0 ? followerCounts[index - 1] : 0
    const delta = effectiveDeltas[index]
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
    if (row.count <= 0) {
      row.barWidth = '0%'
    } else {
      const ratio = maxCount > 0 ? row.count / maxCount : 0
      row.barWidth = `${Math.max(ratio * 100, 12)}%`
    }
  })

  return rows
})

const formattedFollowerCount = computed(() => {
  const current = insightsStore.currentFollowers
  const fallback = followerTrend.value.length
    ? followerTrend.value[followerTrend.value.length - 1].count
    : null
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
</style>
