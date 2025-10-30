import { ref, onUnmounted } from 'vue'

export interface UsePollingOptions {
  /**
   * Polling interval in milliseconds
   * @default 10000
   */
  interval?: number

  /**
   * Whether to start polling immediately
   * @default true
   */
  immediate?: boolean

  /**
   * Error handler for polling failures
   */
  onError?: (error: Error) => void
}

/**
 * Composable for polling data at regular intervals
 *
 * @example
 * ```ts
 * const { start, stop, pause, resume, isPolling } = usePolling(
 *   async () => await fetchData(),
 *   { interval: 10000 }
 * )
 * ```
 */
export function usePolling<T>(
  callback: () => Promise<T>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 10000,
    immediate = true,
    onError
  } = options

  const isPolling = ref(false)
  const isPaused = ref(false)
  let intervalId: ReturnType<typeof setInterval> | null = null

  async function poll() {
    if (isPaused.value) return

    try {
      await callback()
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)))
      } else {
        console.error('[usePolling] Polling error:', error)
      }
    }
  }

  function start() {
    if (isPolling.value) return

    isPolling.value = true
    isPaused.value = false

    // Execute immediately if requested
    if (immediate) {
      poll()
    }

    // Set up interval
    intervalId = setInterval(poll, interval)
  }

  function stop() {
    if (!isPolling.value) return

    isPolling.value = false
    isPaused.value = false

    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function pause() {
    isPaused.value = true
  }

  function resume() {
    if (!isPolling.value) {
      start()
    } else {
      isPaused.value = false
    }
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  // Auto-start if immediate is true
  if (immediate) {
    start()
  }

  return {
    isPolling,
    isPaused,
    start,
    stop,
    pause,
    resume
  }
}
