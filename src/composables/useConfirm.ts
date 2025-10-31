import { reactive, readonly } from 'vue'
import { useLocaleStore } from '@/stores/locale'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'warning' | 'danger' | 'info'
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'warning' | 'danger' | 'info'
  loading: boolean
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  variant: 'warning',
  loading: false,
  resolve: null
})

/**
 * Composable for showing confirmation dialogs
 *
 * @example
 * ```ts
 * const { confirm } = useConfirm()
 *
 * const confirmed = await confirm({
 *   title: 'Delete Item',
 *   message: 'Are you sure you want to delete this item?',
 *   variant: 'danger'
 * })
 *
 * if (confirmed) {
 *   // User clicked confirm
 * }
 * ```
 */
export function useConfirm() {
  const localeStore = useLocaleStore()

  /**
   * Show a confirmation dialog
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      state.isOpen = true
      state.title = options.title || ''
      state.message = options.message
      state.confirmText = options.confirmText || localeStore.t('common.actions.confirm')
      state.cancelText = options.cancelText || localeStore.t('common.actions.cancel')
      state.variant = options.variant || 'warning'
      state.loading = false
      state.resolve = resolve
    })
  }

  function handleConfirm() {
    if (state.resolve) {
      state.resolve(true)
    }
    state.isOpen = false
    state.resolve = null
  }

  function handleCancel() {
    if (state.resolve) {
      state.resolve(false)
    }
    state.isOpen = false
    state.resolve = null
  }

  function setLoading(loading: boolean) {
    state.loading = loading
  }

  return {
    // State (readonly for external use)
    state: readonly(state),

    // Methods
    confirm,
    handleConfirm,
    handleCancel,
    setLoading
  }
}
