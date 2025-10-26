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
  }

  setAuthToken(token: string) {
    this.bearerToken = token
  }

  getAuthToken(): string {
    return this.bearerToken
  }

  // Media endpoints
  async getMedia(query?: PaginationQuery): Promise<ApiResponse<Media[]>> {
    const response = await this.client.get<ApiResponse<Media[]>>('/media', {
      params: query
    })
    return response.data
  }

  async getMediaById(id: number): Promise<ApiResponse<Media>> {
    const response = await this.client.get<ApiResponse<Media>>(`/media/${id}`)
    return response.data
  }

  async updateMedia(id: number, data: UpdateMediaRequest): Promise<ApiResponse<Media>> {
    const response = await this.client.patch<ApiResponse<Media>>(`/media/${id}`, data)
    return response.data
  }

  // Comments endpoints
  async getComments(mediaId: number, query?: CommentsQuery): Promise<ApiResponse<Comment[]>> {
    const params: any = { ...query }

    // Convert status array to multiple status[] query params
    if (query?.status && query.status.length > 0) {
      delete params.status
      params['status[]'] = query.status
    }

    const response = await this.client.get<ApiResponse<Comment[]>>(
      `/media/${mediaId}/comments`,
      { params }
    )
    return response.data
  }

  async deleteComment(id: number): Promise<ApiResponse<null>> {
    const response = await this.client.delete<ApiResponse<null>>(`/comments/${id}`)
    return response.data
  }

  async updateComment(id: number, data: UpdateCommentRequest): Promise<ApiResponse<Comment>> {
    const response = await this.client.patch<ApiResponse<Comment>>(`/comments/${id}`, data)
    return response.data
  }

  async updateCommentClassification(
    id: number,
    data: UpdateClassificationRequest
  ): Promise<ApiResponse<Comment>> {
    const response = await this.client.patch<ApiResponse<Comment>>(
      `/comments/${id}/classification`,
      data
    )
    return response.data
  }

  // Answers endpoints
  async getAnswers(commentId: number): Promise<ApiResponse<Answer[]>> {
    const response = await this.client.get<ApiResponse<Answer[]>>(
      `/comments/${commentId}/answers`
    )
    return response.data
  }

  async deleteAnswer(id: number): Promise<ApiResponse<null>> {
    const response = await this.client.delete<ApiResponse<null>>(`/answers/${id}`)
    return response.data
  }

  async updateAnswer(id: number, data: UpdateAnswerRequest): Promise<ApiResponse<Answer>> {
    const response = await this.client.patch<ApiResponse<Answer>>(`/answers/${id}`, data)
    return response.data
  }
}

export const apiService = new ApiService()
