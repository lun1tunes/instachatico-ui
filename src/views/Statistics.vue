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
