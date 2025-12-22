import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/locale'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} })
}))

vi.mock('@/services/api', () => ({
  apiService: {
    getGoogleAccountStatus: vi.fn(),
    disconnectGoogleAccount: vi.fn()
  }
}))

import { apiService } from '@/services/api'
import YouTubeAuthPanel from '@/components/settings/YouTubeAuthPanel.vue'

function findButton(wrapper: ReturnType<typeof mount>, label: string) {
  return wrapper.findAll('button').find((btn) => btn.text().trim() === label)
}

describe('YouTubeAuthPanel - Disconnect', () => {
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    useLocaleStore()
    const authStore = useAuthStore()
    authStore.accessToken = 'jwt'
  })

  it('successful disconnect updates UI and calls endpoint', async () => {
    ;(apiService.getGoogleAccountStatus as any)
      .mockResolvedValueOnce({
        connected: true,
        needs_refresh: false,
        channel_title: 'My Channel',
        account_id: 'acc1'
      })
      .mockResolvedValueOnce({ connected: false })

    ;(apiService.disconnectGoogleAccount as any).mockResolvedValueOnce({
      status: 'disconnected',
      account_id: 'acc1',
      worker_synced: true
    })

    const wrapper = mount(YouTubeAuthPanel, {
      global: {
        plugins: [pinia],
        stubs: { Teleport: true }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('YouTube connected')

    const disconnectBtn = findButton(wrapper, 'Logout from YouTube')
    expect(disconnectBtn).toBeTruthy()
    await disconnectBtn!.trigger('click')

    const confirmBtn = findButton(wrapper, 'Logout')
    expect(confirmBtn).toBeTruthy()
    await confirmBtn!.trigger('click')

    await flushPromises()

    expect(apiService.disconnectGoogleAccount).toHaveBeenCalledWith('acc1')
    expect(wrapper.text()).toContain('YouTube disconnected.')
    expect(findButton(wrapper, 'Logout from YouTube')).toBeUndefined()
  })

  it('404 shows friendly already disconnected message', async () => {
    ;(apiService.getGoogleAccountStatus as any)
      .mockResolvedValueOnce({
        connected: true,
        needs_refresh: false,
        channel_title: 'My Channel',
        account_id: 'acc1'
      })
      .mockResolvedValueOnce({ connected: false })

    const err: any = new Error('Not found')
    err.response = { status: 404, data: { detail: 'No YouTube tokens found' } }
    ;(apiService.disconnectGoogleAccount as any).mockRejectedValueOnce(err)

    const wrapper = mount(YouTubeAuthPanel, {
      global: {
        plugins: [pinia],
        stubs: { Teleport: true }
      }
    })

    await flushPromises()

    const disconnectBtn = findButton(wrapper, 'Logout from YouTube')
    expect(disconnectBtn).toBeTruthy()
    await disconnectBtn!.trigger('click')

    const confirmBtn = findButton(wrapper, 'Logout')
    expect(confirmBtn).toBeTruthy()
    await confirmBtn!.trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain('Already disconnected.')
    expect(findButton(wrapper, 'Logout from YouTube')).toBeUndefined()
  })

  it('worker_synced=false shows warning state', async () => {
    ;(apiService.getGoogleAccountStatus as any)
      .mockResolvedValueOnce({
        connected: true,
        needs_refresh: false,
        channel_title: 'My Channel',
        account_id: 'acc1'
      })
      .mockResolvedValueOnce({ connected: false })

    ;(apiService.disconnectGoogleAccount as any).mockResolvedValueOnce({
      status: 'disconnected',
      account_id: 'acc1',
      worker_synced: false
    })

    const wrapper = mount(YouTubeAuthPanel, {
      global: {
        plugins: [pinia],
        stubs: { Teleport: true }
      }
    })

    await flushPromises()

    const disconnectBtn = findButton(wrapper, 'Logout from YouTube')
    expect(disconnectBtn).toBeTruthy()
    await disconnectBtn!.trigger('click')

    const confirmBtn = findButton(wrapper, 'Logout')
    expect(confirmBtn).toBeTruthy()
    await confirmBtn!.trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain('Disconnected locally; worker sync failed.')
  })

  it('does not hide refresh error after disconnect', async () => {
    ;(apiService.getGoogleAccountStatus as any)
      .mockResolvedValueOnce({
        connected: true,
        needs_refresh: false,
        channel_title: 'My Channel',
        account_id: 'acc1'
      })
      .mockRejectedValueOnce(new Error('Refresh failed'))

    ;(apiService.disconnectGoogleAccount as any).mockResolvedValueOnce({
      status: 'disconnected',
      account_id: 'acc1',
      worker_synced: true
    })

    const wrapper = mount(YouTubeAuthPanel, {
      global: {
        plugins: [pinia],
        stubs: { Teleport: true }
      }
    })

    await flushPromises()

    const disconnectBtn = findButton(wrapper, 'Logout from YouTube')
    expect(disconnectBtn).toBeTruthy()
    await disconnectBtn!.trigger('click')

    const confirmBtn = findButton(wrapper, 'Logout')
    expect(confirmBtn).toBeTruthy()
    await confirmBtn!.trigger('click')

    await flushPromises()

    expect(wrapper.text()).toContain('Refresh failed')
  })
})
