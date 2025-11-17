import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'
import type {
  InstagramInsightsPayload,
  InsightsMonth,
  InsightsPeriod
} from '@/types/api'

const DEFAULT_PERIOD: InsightsPeriod = 'last_3_months'

function extractMetricValue(month: InsightsMonth, metricName: string): number | null {
  const sections = month?.insights ?? {}
  for (const section of Object.values(sections)) {
    const metric = section?.data?.find(entry => entry.name === metricName)
    if (metric) {
      const raw = metric.total_value?.value
      if (raw !== undefined && raw !== null) {
        const resolved = Number(raw)
        if (Number.isFinite(resolved)) {
          return resolved
        }
      }

      const breakdownValue = metric.total_value?.breakdowns?.reduce<number | null>((sum, breakdown) => {
        if (!breakdown?.results) {
          return sum
        }

        const resultTotal = breakdown.results.reduce((resultSum, result) => {
          const value = Number(result?.value)
          return Number.isFinite(value) ? resultSum + value : resultSum
        }, 0)

        if (resultTotal === 0) {
          return sum
        }

        return (sum ?? 0) + resultTotal
      }, null)

      if (breakdownValue !== null) {
        return breakdownValue
      }

      return 0
    }
  }
  return null
}

function getAverageEngagementsPerPost(month: InsightsMonth): number {
  const likes = extractMetricValue(month, 'likes') ?? 0
  const comments = extractMetricValue(month, 'comments') ?? 0
  const interactions = likes + comments
  const posts = month.post_count ?? 0

  if (posts <= 0) {
    return interactions
  }

  return interactions / posts
}

function computeEngagementRate(month: InsightsMonth): number | null {
  const followersMetric =
    extractMetricValue(month, 'followers_total') ??
    extractMetricValue(month, 'followers') ??
    null

  const followers = followersMetric ?? month.follower_count ?? 0
  if (!followers || followers <= 0) {
    return null
  }

  const avgPerPost = getAverageEngagementsPerPost(month)
  if (avgPerPost < 0) {
    return null
  }

  return (avgPerPost / followers) * 100
}

export const useInsightsStore = defineStore('insights', () => {
  const selectedPeriod = ref<InsightsPeriod>(DEFAULT_PERIOD)
  const insights = ref<InstagramInsightsPayload | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasFetched = ref(false)

  const months = computed<InsightsMonth[]>(() => insights.value?.months ?? [])

  async function fetchInsights() {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.getInstagramInsights(selectedPeriod.value)
      insights.value = response.payload
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load statistics'
      throw err
    } finally {
      loading.value = false
      hasFetched.value = true
    }
  }

  function setPeriod(period: InsightsPeriod) {
    selectedPeriod.value = period
  }

  function getMetricValue(month: InsightsMonth, metricName: string): number {
    return extractMetricValue(month, metricName) ?? 0
  }

  function getEngagementRate(month: InsightsMonth): number | null {
    return computeEngagementRate(month)
  }

  return {
    selectedPeriod,
    insights,
    months,
    loading,
    error,
    hasFetched,
    fetchInsights,
    setPeriod,
    getMetricValue,
    getEngagementRate
  }
})
