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

export type ApiResponseWithStats<T, S> = ApiResponse<T> & {
  stats?: S | null
}

// Processing Status Type
export type ProcessingStatus = 1 | 2 | 3 | 4 | 5

export const ProcessingStatus = {
  PENDING: 1 as ProcessingStatus,
  PROCESSING: 2 as ProcessingStatus,
  COMPLETED: 3 as ProcessingStatus,
  FAILED: 4 as ProcessingStatus,
  RETRY: 5 as ProcessingStatus
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

export interface ClassificationStatsBreakdown {
  positive_feedback_total?: number
  positive_feedback_increment?: number

  questions_total?: number
  questions_increment?: number

  negative_feedback_total?: number
  negative_feedback_increment?: number

  urgent_issues_total?: number
  urgent_issues_increment?: number

  partnership_proposals_total?: number
  partnership_proposals_increment?: number

  toxic_abusive_total?: number
  toxic_abusive_increment?: number

  spam_irrelevant_total?: number
  spam_irrelevant_increment?: number
}

export type MediaClassificationStats = ClassificationStatsBreakdown
export type CommentsClassificationStats = ClassificationStatsBreakdown

// Media Type
export type MediaType = 1 | 2 | 3

export const MediaType = {
  IMAGE: 1 as MediaType,
  VIDEO: 2 as MediaType,
  CAROUSEL: 3 as MediaType
}

// DTOs
export interface Media {
  id: string
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
  posted_at?: string
  stats?: MediaClassificationStats | null
}

export interface Classification {
  id: string
  processing_status: ProcessingStatus
  processing_completed_at: string
  last_error: string | null
  confidence: number | null
  classification_type: ClassificationType | null
  reasoning: string
}

export interface Answer {
  id: string
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

export interface CommentMediaSummary {
  id: string
  caption?: string
  url?: string
  thumbnail_url?: string
  preview_url?: string
  children_urls?: string[]
  type?: MediaType
  shortcode?: string
  posted_at?: string
}

export interface Comment {
  id: string
  parent_id: string | null
  username: string
  text: string
  is_hidden: boolean
  is_deleted: boolean
  last_error: string | null
  created_at?: string
  classification: Classification
  answers: Answer[]
  media?: CommentMediaSummary
  media_id?: string
  // Client-side only property for entrance animation
  isNew?: boolean
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
  classification_type: string
  reasoning: string
}

export interface UpdateAnswerRequest {
  answer: string
  confidence?: number
  quality_score?: number
}

export interface CreateAnswerRequest {
  answer: string
}

// Pagination Query
export interface PaginationQuery {
  page?: number
  per_page?: number
}

export interface CommentsQuery extends PaginationQuery {
  status?: ProcessingStatus[]
  classification_type?: ClassificationType[]
  classification?: ClassificationType[] // legacy fallback
}

// Instagram Insights
export type InsightsPeriod = 'last_week' | 'last_month' | 'last_3_months' | 'last_6_months'

export interface InsightMetricValueBreakdownResult {
  dimension_values: string[]
  value: number
}

export interface InsightMetricValueBreakdown {
  dimension_keys: string[]
  results?: InsightMetricValueBreakdownResult[]
}

export interface InsightMetricValue {
  value: number
  breakdowns?: InsightMetricValueBreakdown[]
}

export interface InsightMetric {
  name: string
  period: string
  title: string
  description?: string
  total_value?: InsightMetricValue | null
  id: string
}

export interface InsightSection {
  data: InsightMetric[]
}

export interface InsightsMonth {
  month: string
  range: {
    since: number
    until: number
  }
  insights: Record<string, InsightSection>
  follower_count?: number | null
  post_count?: number | null
}

export interface InstagramInsightsPayload {
  period: InsightsPeriod
  generated_at: string
  months: InsightsMonth[]
}

export interface AccountStatsPayload {
  username?: string | null
  follower_count?: number | null
  followers_count?: number | null
}
