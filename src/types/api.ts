// API Response Envelope Types
export interface ApiMeta {
  page?: number
  per_page?: number
  total?: number
  error: ApiError | null
}

export interface ApiError {
  code: number
  message: string
}

export interface ApiResponse<T> {
  meta: ApiMeta
  payload: T
}

// Processing Status Type
export type ProcessingStatus = 0 | 1 | 2 | 3

export const ProcessingStatus = {
  PENDING: 0 as ProcessingStatus,
  PROCESSING: 1 as ProcessingStatus,
  COMPLETED: 2 as ProcessingStatus,
  FAILED: 3 as ProcessingStatus
}

// Classification Type
export type ClassificationType = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const ClassificationType = {
  POSITIVE_FEEDBACK: 1 as ClassificationType,
  CRITICAL_FEEDBACK: 2 as ClassificationType,
  URGENT_ISSUE: 3 as ClassificationType,
  QUESTION_INQUIRY: 4 as ClassificationType,
  PARTNERSHIP_PROPOSAL: 5 as ClassificationType,
  TOXIC_ABUSIVE: 6 as ClassificationType,
  SPAM_IRRELEVANT: 7 as ClassificationType
}

// Classification Type Labels
export const ClassificationTypeLabels: Record<number, string> = {
  [ClassificationType.POSITIVE_FEEDBACK]: 'Positive Feedback',
  [ClassificationType.CRITICAL_FEEDBACK]: 'Critical Feedback',
  [ClassificationType.URGENT_ISSUE]: 'Urgent Issue / Complaint',
  [ClassificationType.QUESTION_INQUIRY]: 'Question / Inquiry',
  [ClassificationType.PARTNERSHIP_PROPOSAL]: 'Partnership Proposal',
  [ClassificationType.TOXIC_ABUSIVE]: 'Toxic / Abusive',
  [ClassificationType.SPAM_IRRELEVANT]: 'Spam / Irrelevant'
}

// Media Type
export type MediaType = 1 | 2 | 3

export const MediaType = {
  IMAGE: 1 as MediaType,
  VIDEO: 2 as MediaType,
  CAROUSEL: 3 as MediaType
}

// DTOs
export interface Media {
  id: number
  permalink: string
  caption: string
  url: string
  type: MediaType
  context: string
  children_urls: string[]
  comments_count: number
  like_count: number
  shortcode: string
  is_comment_enabled: boolean
  is_processing_enabled: boolean
}

export interface Classification {
  id: number
  processing_status: ProcessingStatus
  processing_completed_at: string
  last_error: string | null
  confidence: number | null
  type: ClassificationType
  reasoning: string
}

export interface Answer {
  id: number
  processing_status: ProcessingStatus
  processing_completed_at: string
  last_error: string | null
  answer: string
  confidence: number
  quality_score: number
  reply_sent: boolean
  reply_status: string
  reply_error: string | null
  author: number
}

export interface Comment {
  id: number
  parent_id: number | null
  username: string
  text: string
  is_hidden: boolean
  last_error: string | null
  classification: Classification
  answers: Answer[]
}

// Request Types
export interface UpdateMediaRequest {
  context?: string
  is_comment_enabled?: boolean
  is_processing_enabled?: boolean
}

export interface UpdateCommentRequest {
  is_hidden: boolean
}

export interface UpdateClassificationRequest {
  type: string
  reasoning: string
}

export interface UpdateAnswerRequest {
  answer: string
  confidence?: number
  quality_score?: number
}

// Pagination Query
export interface PaginationQuery {
  page?: number
  per_page?: number
}

export interface CommentsQuery extends PaginationQuery {
  status?: ProcessingStatus[]
}
