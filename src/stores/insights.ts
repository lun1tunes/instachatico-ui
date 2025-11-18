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

function resolveFollowers(month: InsightsMonth): number | null {
  const followerMetricNames = [
    'followers_total',
    'followers',
    'total_followers',
    'followers_count'
  ]

  for (const name of followerMetricNames) {
    const value = extractMetricValue(month, name)
    if (value !== null) {
      return value
    }
  }

  if (month.follower_count !== undefined && month.follower_count !== null) {
    return month.follower_count
  }

  return null
}

function computeEngagementRate(month: InsightsMonth): number | null {
  const followers = resolveFollowers(month)

  if (!followers || followers <= 0) {
    return null
  }

  const avgPerPost = getAverageEngagementsPerPost(month)
  if (avgPerPost < 0) {
    return null
  }

  return (avgPerPost / followers) * 100
}

function determineFallbackFollowers(payload: InstagramInsightsPayload | null): number | null {
  const months = payload?.months ?? []
  for (let i = months.length - 1; i >= 0; i--) {
    const resolved = resolveFollowers(months[i])
    if (resolved !== null) {
      return resolved
    }
  }
  return null
}

export const useInsightsStore = defineStore('insights', () => {
  const selectedPeriod = ref<InsightsPeriod>(DEFAULT_PERIOD)
  const insights = ref<InstagramInsightsPayload | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasFetched = ref(false)
  const accountFollowers = ref<number | null>(null)

  const months = computed<InsightsMonth[]>(() => insights.value?.months ?? [])
  const currentFollowers = computed(() => accountFollowers.value)

  async function fetchInsights() {
    loading.value = true
    error.value = null

    try {
      const [insightsResponse, accountResponse] = await Promise.all([
        apiService.getInstagramInsights(selectedPeriod.value),
        apiService.getAccountStats().catch(() => null)
      ])

      insights.value = insightsResponse.payload
      const payloadFollowers = accountResponse?.payload
      const followerValue =
        payloadFollowers?.follower_count ??
        payloadFollowers?.followers_count ??
        determineFallbackFollowers(insightsResponse.payload)
      accountFollowers.value = followerValue ?? accountFollowers.value
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

  function getFollowersForMonth(month: InsightsMonth): number | null {
    return resolveFollowers(month)
  }

  function getFollowerDelta(month: InsightsMonth): number {
    return extractMetricValue(month, 'follows_and_unfollows') ?? 0
  }

  function getFollowerDeltaPercent(month: InsightsMonth): number | null {
    const delta = getFollowerDelta(month)
    if (!delta) return 0
    const followers = currentFollowers.value
    if (!followers || followers <= 0) return null
    return (delta / followers) * 100
  }

  return {
    selectedPeriod,
    insights,
    months,
    loading,
    error,
    hasFetched,
    currentFollowers,
    fetchInsights,
    setPeriod,
    getMetricValue,
    getEngagementRate,
    getFollowerDelta,
    getFollowerDeltaPercent,
    getFollowersForMonth
  }
})
