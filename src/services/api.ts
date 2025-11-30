import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import type {
  ApiResponse,
  ApiResponseWithStats,
  Media,
  Comment,
  Answer,
  PaginationQuery,
  CommentsQuery,
  UpdateMediaRequest,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  CreateAnswerRequest,
  ClassificationType,
  CommentsClassificationStats,
  InstagramInsightsPayload,
  InsightsPeriod,
  AccountStatsPayload,
  ModerationStatsPayload,
  GoogleAuthorizeResponse,
  GoogleAuthCallbackResponse
} from '@/types/api'

const AUTH_FAILURE_CODES = new Set([4003, 4004, 4005])

class ApiService {
  private client: AxiosInstance
  private bearerToken: string = ''
  private bearerType: string = 'Bearer'
  private baseUrl: string
  private readonly defaultBaseUrl: string
  private tokenExpiredHandler?: (error: { code: number; message: string }) => void

  constructor() {
    this.defaultBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '') || '/api'
    this.baseUrl = this.defaultBaseUrl
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.bearerToken) {
          config.headers.Authorization = `Bearer ${this.bearerToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<null>>) => {
        const apiError = error.response?.data?.meta?.error
        if (apiError) {
          if (AUTH_FAILURE_CODES.has(apiError.code)) {
            try {
              this.tokenExpiredHandler?.({
                code: apiError.code,
                message: apiError.message
              })
            } catch (_handlerError) {
              // swallow handler errors to avoid masking original error
            }
          }
          throw new Error(`API Error ${apiError.code}: ${apiError.message}`)
        }
        throw error
      }
    )
  }

  setAuthToken(token: string, type?: string) {
    this.bearerToken = token
    const normalizedType = (type ?? 'Bearer').trim()
    this.bearerType = normalizedType
      ? normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1).toLowerCase()
      : 'Bearer'
    if (token) {
      this.client.defaults.headers.common.Authorization = `${this.bearerType} ${token}`
    } else {
      delete this.client.defaults.headers.common.Authorization
    }
  }

  setBaseUrl(url?: string | null) {
    const candidate = (url ?? '').toString().trim()
    const resolved =
      candidate.length > 0 ? candidate.replace(/\/+$/, '') : this.defaultBaseUrl

    this.baseUrl = resolved || this.defaultBaseUrl
    this.client.defaults.baseURL = this.baseUrl
  }

  setTokenExpiredHandler(handler?: (error: { code: number; message: string }) => void) {
    this.tokenExpiredHandler = handler
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  getAuthToken(): string {
    return this.bearerToken
  }

  getAuthTokenType(): string {
    return this.bearerType
  }

  // Authentication endpoints
  async login(credentials: { username: string; password: string }) {
    const response = await this.client.post('/auth/login', credentials)
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  // Media endpoints
  async getMedia(query?: PaginationQuery): Promise<ApiResponse<Media[]>> {
    const response = await this.client.get<ApiResponse<Media[]>>('/media', {
      params: query
    })
    return response.data
  }

  async getMediaById(id: string): Promise<ApiResponse<Media>> {
    const response = await this.client.get<ApiResponse<Media>>(`/media/${id}`)
    return response.data
  }

  async updateMedia(id: string, data: UpdateMediaRequest): Promise<ApiResponse<Media>> {
    const response = await this.client.patch<ApiResponse<Media>>(`/media/${id}`, data)
    return response.data
  }

  private formatCommentsQuery(query?: CommentsQuery) {
    if (!query) return undefined

    const params: Record<string, unknown> = { ...query }

    if (query.status && query.status.length > 0) {
      delete params.status
      params.status = query.status.join(',')
    }

    const classificationFilter =
      (query as Record<string, ClassificationType[] | undefined>)?.classification_type ??
      (query as Record<string, ClassificationType[] | undefined>)?.classification

    if (classificationFilter && classificationFilter.length > 0) {
      delete params.classification_type
      delete params.classification
      params.classification_type = classificationFilter.join(',')
    }

    return params
  }

  // Comments endpoints
  async getComments(mediaId: string, query?: CommentsQuery): Promise<ApiResponse<Comment[]>> {
    const params = this.formatCommentsQuery(query)

    const response = await this.client.get<ApiResponse<Comment[]>>(
      `/media/${mediaId}/comments`,
      { params }
    )
    return response.data
  }

  async getAllComments(query?: CommentsQuery): Promise<ApiResponseWithStats<Comment[], CommentsClassificationStats>> {
    const params = this.formatCommentsQuery(query)

    const response = await this.client.get<ApiResponseWithStats<Comment[], CommentsClassificationStats>>(
      '/comments',
      { params }
    )
    return response.data
  }

  async deleteComment(id: string): Promise<ApiResponse<null>> {
    const response = await this.client.delete<ApiResponse<null>>(`/comments/${id}`)
    return response.data
  }

  async updateComment(id: string, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await this.client.patch<ApiResponse<Comment>>(`/comments/${id}`, null, {
      params: {
        is_hidden: data.is_hidden
      }
    })
    return response.data
  }

  async updateCommentClassification(
    id: string,
    data: UpdateClassificationRequest
  ): Promise<ApiResponse<Comment>> {
    const response = await this.client.patch<ApiResponse<Comment>>(
      `/comments/${id}/classification`,
      data
    )
    return response.data
  }

  // Answers endpoints
  async getAnswers(commentId: string): Promise<ApiResponse<Answer[]>> {
    const response = await this.client.get<ApiResponse<Answer[]>>(
      `/comments/${commentId}/answers`
    )
    return response.data
  }

  async deleteAnswer(id: string): Promise<ApiResponse<null>> {
    const response = await this.client.delete<ApiResponse<null>>(`/answers/${id}`)
    return response.data
  }

  async updateAnswer(id: string, data: UpdateAnswerRequest): Promise<ApiResponse<Answer>> {
    const response = await this.client.patch<ApiResponse<Answer>>(`/answers/${id}`, data)
    return response.data
  }

  async createAnswer(commentId: string, data: CreateAnswerRequest): Promise<ApiResponse<Answer>> {
    const response = await this.client.put<ApiResponse<Answer>>(
      `/comments/${commentId}/answers`,
      data
    )
    return response.data
  }

  // Image proxy endpoint - resolves a CDN URL via backend (used when direct URL fails)
  async fetchMediaImage(
    mediaId: string,
    childIndex?: number,
    options?: { signal?: AbortSignal }
  ): Promise<string> {
    const endpoint = `/media/${mediaId}/image`
    const params = childIndex !== undefined ? { child_index: childIndex } : {}

    const response = await this.client.get<ApiResponse<{ url?: string | null }>>(endpoint, {
      params,
      signal: options?.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    const resolvedUrl = response.data?.payload?.url

    if (typeof resolvedUrl !== 'string' || resolvedUrl.trim().length === 0) {
      throw new Error('Media image URL unavailable')
    }

    return resolvedUrl
  }

  async getInstagramInsights(period: InsightsPeriod): Promise<ApiResponse<InstagramInsightsPayload>> {
    const response = await this.client.get<ApiResponse<InstagramInsightsPayload>>('/stats/instagram_insights', {
      params: { period }
    })
    return response.data
  }

  async getAccountStats(): Promise<ApiResponse<AccountStatsPayload>> {
    const response = await this.client.get<ApiResponse<AccountStatsPayload>>('/stats/account')
    return response.data
  }

  async getModerationStats(period: InsightsPeriod): Promise<ApiResponse<ModerationStatsPayload>> {
    const response = await this.client.get<ApiResponse<ModerationStatsPayload>>('/stats/moderation', {
      params: { period }
    })
    return response.data
  }

  // Google / YouTube OAuth
  async getGoogleAuthRequest(): Promise<GoogleAuthorizeResponse> {
    const base = this.client.defaults.baseURL ?? ''
    const endpoint = /\/v1\/?$/.test(base) ? '/auth/google/authorize' : '/v1/auth/google/authorize'
    const response = await this.client.get<GoogleAuthorizeResponse>(endpoint)
    return response.data
  }

  async completeGoogleAuth(params: { code: string; state: string }): Promise<GoogleAuthCallbackResponse> {
    const base = this.client.defaults.baseURL ?? ''
    const endpoint = /\/v1\/?$/.test(base) ? '/auth/google/callback' : '/v1/auth/google/callback'
    const response = await this.client.get<GoogleAuthCallbackResponse>(endpoint, {
      params
    })
    return response.data
  }
}

export const apiService = new ApiService()
