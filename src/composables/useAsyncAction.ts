import { ref } from 'vue'

/**
 * Composable for handling async actions with loading states and duplicate prevention
 *
 * @example
 * const { execute: deleteComment, loading: deleteLoading } = useAsyncAction(
 *   async (id: string) => {
 *     await apiService.deleteComment(id)
 *   },
 *   {
 *     onSuccess: () => console.log('Comment deleted'),
 *     onError: (error) => console.error('Failed to delete:', error)
 *   }
 * )
 */
export function useAsyncAction<TArgs extends any[], TResult = void>(
  action: (...args: TArgs) => Promise<TResult>,
  options?: {
    onSuccess?: (result: TResult) => void
    onError?: (error: Error) => void
    confirmMessage?: string
  }
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (...args: TArgs): Promise<TResult | undefined> => {
    // Prevent duplicate calls while loading
    if (loading.value) {
      console.warn('[useAsyncAction] Action already in progress, ignoring duplicate call')
      return
    }

    // Optional confirmation dialog
    if (options?.confirmMessage) {
      const confirmed = window.confirm(options.confirmMessage)
      if (!confirmed) {
        return
      }
    }

    loading.value = true
    error.value = null

    try {
      const result = await action(...args)

      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj

      // Call error callback if provided
      if (options?.onError) {
        options.onError(errorObj)
      } else {
        // Default error handling
        console.error('[useAsyncAction] Error:', errorObj)
      }

      throw errorObj
    } finally {
      loading.value = false
    }
  }

  return {
    execute,
    loading,
    error
  }
}

/**
 * Composable for handling multiple async actions with individual loading states
 * Useful when a component has multiple buttons/actions
 *
 * @example
 * const actions = useAsyncActions({
 *   delete: async (id: string) => await apiService.deleteComment(id),
 *   hide: async (id: string) => await apiService.hideComment(id)
 * })
 *
 * // Usage:
 * actions.delete.execute(commentId)
 * actions.delete.loading // true/false
 */
export function useAsyncActions<
  TActions extends Record<string, (...args: any[]) => Promise<any>>
>(
  actions: TActions,
  options?: {
    [K in keyof TActions]?: {
      onSuccess?: (result: Awaited<ReturnType<TActions[K]>>) => void
      onError?: (error: Error) => void
      confirmMessage?: string
    }
  }
) {
  const result = {} as {
    [K in keyof TActions]: {
      execute: (...args: Parameters<TActions[K]>) => Promise<Awaited<ReturnType<TActions[K]>> | undefined>
      loading: ReturnType<typeof ref<boolean>>
      error: ReturnType<typeof ref<Error | null>>
    }
  }

  for (const key in actions) {
    const actionOptions = options?.[key]
    result[key] = useAsyncAction(actions[key], actionOptions as any)
  }

  return result
}