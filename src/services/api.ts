import axios from 'axios'
import type { AxiosInstance, AxiosError } from 'axios'
import type {
  ApiResponse,
  Media,
  Comment,
  Answer,
  PaginationQuery,
  CommentsQuery,
  UpdateMediaRequest,
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest
} from '@/types/api'

class ApiService {
  private client: AxiosInstance
  private bearerToken: string = ''

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
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
        if (error.response?.data?.meta?.error) {
          const apiError = error.response.data.meta.error
          throw new Error(`API Error ${apiError.code}: ${apiError.message}`)
        }
        throw error
      }
    )

    const bootstrapToken = import.meta.env.VITE_BEARER_TOKEN
    if (bootstrapToken) {
      this.setAuthToken(bootstrapToken)
    }
  }

  setAuthToken(token: string) {
    this.bearerToken = token
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common.Authorization
    }
  }

  getAuthToken(): string {
    return this.bearerToken
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

  // Comments endpoints
  async getComments(mediaId: string, query?: CommentsQuery): Promise<ApiResponse<Comment[]>> {
    const params: any = { ...query }

    // Convert status array to multiple status query params (no brackets)
    if (query?.status && query.status.length > 0) {
      delete params.status
      // Backend expects comma-delimited values rather than repeated query keys
      params.status = query.status.join(',')
    }

    const classificationFilter =
      (query as any)?.classification_type ?? (query as any)?.classification

    if (classificationFilter && classificationFilter.length > 0) {
      delete params.classification_type
      delete params.classification
      params.classification_type = classificationFilter.join(',')
    }

    const response = await this.client.get<ApiResponse<Comment[]>>(
      `/media/${mediaId}/comments`,
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

  // Image proxy endpoint - fetch as blob with auth header
  async fetchMediaImage(mediaId: string, childIndex?: number): Promise<string> {
    const endpoint = `/media/${mediaId}/image`
    const params = childIndex !== undefined ? { child_index: childIndex } : {}

    const response = await this.client.get(endpoint, {
      params,
      responseType: 'blob'
    })

    // Create object URL from blob
    return URL.createObjectURL(response.data)
  }
}

export const apiService = new ApiService()
