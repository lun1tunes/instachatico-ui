<template>
  <div class="comments-section">
    <CommentFilters
      :status-filters="commentsStore.statusFilter"
      :classification-filters="commentsStore.classificationFilter"
      :visibility-filter="commentsStore.visibilityFilter"
      :deleted-filter="commentsStore.deletedFilter"
      @update="handleFilterUpdate"
    />

    <LoadingSpinner
      v-if="commentsStore.loading && !commentsStore.comments.length"
      :message="localeStore.t('comments.loading')"
    />

    <div v-else-if="commentsStore.error" class="error-state">
      <p>{{ commentsStore.error }}</p>
      <BaseButton @click="loadComments">
        {{ localeStore.t('common.actions.retry') }}
      </BaseButton>
    </div>

    <div v-else-if="!commentsStore.comments.length" class="empty-state">
      <p>{{ localeStore.t('comments.empty') }}</p>
    </div>

    <TransitionGroup
      v-else
      name="comment-list"
      tag="div"
      class="comments-list"
    >
      <CommentCard
        v-for="comment in commentsStore.comments"
        :key="comment.id"
        :comment="comment"
        :updating-answer-id="updatingAnswerId"
        :is-creating-answer="creatingAnswerForCommentId === comment.id"
        :show-media-info="isGlobalScope"
        @delete="handleDelete"
        @update="handleUpdate"
        @update-classification="handleUpdateClassification"
        @delete-answer="handleDeleteAnswer"
        @update-answer="handleUpdateAnswer"
        @create-answer="handleCreateAnswer"
      />
    </TransitionGroup>

    <div v-if="commentsStore.totalPages > 1" class="pagination-wrapper">
      <BasePagination
        :current-page="commentsStore.currentPage"
        :total-pages="commentsStore.totalPages"
        @prev="handlePrevPage"
        @next="handleNextPage"
        @goto="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, computed, ref } from 'vue'
import { useCommentsStore } from '@/stores/comments'
import { useAsyncActions } from '@/composables/useAsyncAction'
import { usePolling } from '@/composables/usePolling'
import { useLocaleStore } from '@/stores/locale'
import type {
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  CreateAnswerRequest,
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import CommentFilters from './CommentFilters.vue'
import CommentCard from './CommentCard.vue'

interface Props {
  mediaId?: string
  scope?: 'media' | 'global'
}

const props = defineProps<Props>()

const commentsStore = useCommentsStore()
const localeStore = useLocaleStore()

const scope = computed(() => props.scope ?? (props.mediaId ? 'media' : 'global'))
const isMediaScope = computed(() => scope.value === 'media')
const isGlobalScope = computed(() => scope.value === 'global')
const targetMediaId = computed(() => (isMediaScope.value ? props.mediaId : undefined))

// Track which answer is currently being updated
const updatingAnswerId = ref<string | null>(null)

// Track which comment is currently having an answer created
const creatingAnswerForCommentId = ref<string | null>(null)

// Determine if polling should be active
// Only poll when on first page (regardless of filters)
// Backend will handle filter matching automatically
const shouldPoll = computed(() => {
  return commentsStore.currentPage === 1
})

// Set up polling for new comments (10 second interval)
const { pause: pausePolling, resume: resumePolling } = usePolling(
  async () => {
    if (shouldPoll.value) {
      await commentsStore.fetchCommentsInBackground(targetMediaId.value)
    }
  },
  {
    interval: 10000, // 10 seconds
    immediate: false // Don't start immediately, wait for first manual load
  }
)

// Watch shouldPoll to pause/resume polling based on user interaction
watch(shouldPoll, (newValue) => {
  if (newValue) {
    resumePolling()
  } else {
    pausePolling()
  }
})

// Setup async actions with loading states and duplicate prevention
const actions = useAsyncActions(
  {
    deleteComment: async (id: string) => {
      await commentsStore.deleteComment(id)
    },
    updateComment: async (id: string, data: UpdateCommentRequest) => {
      await commentsStore.updateComment(id, data)
    },
    updateClassification: async (id: string, data: UpdateClassificationRequest) => {
      await commentsStore.updateClassification(id, data)
    },
    deleteAnswer: async (commentId: string, answerId: string) => {
      await commentsStore.deleteAnswer(commentId, answerId)
    },
    updateAnswer: async (commentId: string, answerId: string, data: UpdateAnswerRequest) => {
      await commentsStore.updateAnswer(commentId, answerId, data)
    },
    createAnswer: async (commentId: string, data: CreateAnswerRequest) => {
      await commentsStore.createAnswer(commentId, data)
    }
  },
  {
    deleteComment: {
      confirm: {
        title: localeStore.t('comments.confirmations.deleteComment.title'),
        message: localeStore.t('comments.confirmations.deleteComment.message'),
        variant: 'danger',
        confirmText: localeStore.t('comments.confirmations.deleteComment.confirm'),
        cancelText: localeStore.t('comments.confirmations.deleteComment.cancel')
      },
      onError: (error) => console.error('Failed to delete comment:', error)
    },
    updateComment: {
      onError: (error) => console.error('Failed to update comment:', error)
    },
    updateClassification: {
      onError: (error) => console.error('Failed to update classification:', error)
    },
    deleteAnswer: {
      confirm: {
        title: localeStore.t('comments.confirmations.deleteAnswer.title'),
        message: localeStore.t('comments.confirmations.deleteAnswer.message'),
        variant: 'danger',
        confirmText: localeStore.t('comments.confirmations.deleteAnswer.confirm'),
        cancelText: localeStore.t('comments.confirmations.deleteAnswer.cancel')
      },
      onError: (error) => console.error('Failed to delete answer:', error)
    },
    updateAnswer: {
      onSuccess: () => {
        updatingAnswerId.value = null
      },
      onError: (error) => {
        updatingAnswerId.value = null
        console.error('Failed to update answer:', error)
      }
    },
    createAnswer: {
      onSuccess: () => {
        creatingAnswerForCommentId.value = null
      },
      onError: (error) => {
        creatingAnswerForCommentId.value = null
        console.error('Failed to create answer:', error)
      }
    }
  }
)

onMounted(() => {
  loadComments()
})

// Reset filters when leaving the media detail page
onUnmounted(() => {
  pausePolling()
  commentsStore.clearComments()
  commentsStore.clearFilters()
})

watch([targetMediaId, scope], () => {
  pausePolling()
  commentsStore.clearComments()
  commentsStore.clearFilters()
  loadComments()
}, { immediate: false })

async function loadComments() {
  if (isMediaScope.value && !targetMediaId.value) {
    return
  }

  try {
    await commentsStore.fetchComments(targetMediaId.value)
    // Start polling after successful initial load
    if (shouldPoll.value) {
      resumePolling()
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
  }
}

type VisibilityFilter = 'all' | 'visible' | 'hidden'
type DeletedFilter = 'all' | 'active' | 'deleted'

interface FilterUpdatePayload {
  statuses: ProcessingStatus[]
  classifications: ClassificationType[]
  visibility: VisibilityFilter
  deleted: DeletedFilter
}

function handleFilterUpdate(filters: FilterUpdatePayload) {
  commentsStore.setStatusFilter(filters.statuses)
  commentsStore.setClassificationFilter(filters.classifications)
  commentsStore.setVisibilityFilter(filters.visibility)
  commentsStore.setDeletedFilter(filters.deleted)
  loadComments()
}

function handlePageChange(page: number) {
  commentsStore.currentPage = page
  loadComments()
}

function handlePrevPage() {
  commentsStore.prevPage(targetMediaId.value)
}

function handleNextPage() {
  commentsStore.nextPage(targetMediaId.value)
}

// All handlers now use the actions composable which prevents duplicate calls
function handleDelete(id: string) {
  actions.deleteComment.execute(id)
}

function handleUpdate(id: string, data: UpdateCommentRequest) {
  actions.updateComment.execute(id, data)
}

function handleUpdateClassification(id: string, data: UpdateClassificationRequest) {
  actions.updateClassification.execute(id, data)
}

function handleDeleteAnswer(commentId: string, answerId: string) {
  actions.deleteAnswer.execute(commentId, answerId)
}

function handleUpdateAnswer(commentId: string, answerId: string, data: UpdateAnswerRequest) {
  updatingAnswerId.value = answerId
  actions.updateAnswer.execute(commentId, answerId, data)
}

function handleCreateAnswer(commentId: string, data: CreateAnswerRequest) {
  creatingAnswerForCommentId.value = commentId
  actions.createAnswer.execute(commentId, data)
}
</script>

<style scoped>
.comments-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* TransitionGroup animations for entering comments */
.comment-list-enter-active {
  animation: slide-fade-in 0.6s ease-out;
}

.comment-list-leave-active {
  animation: slide-fade-out 0.4s ease-in;
}

.comment-list-move {
  transition: transform 0.5s ease;
}

/* Keyframe animations for new comments */
@keyframes slide-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes slide-fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

/* Removed old highlight-pulse animation - now handled in CommentCard.vue */

.error-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
}

.error-state p {
  color: var(--error);
  margin-bottom: var(--spacing-lg);
}

.empty-state p {
  color: var(--navy-600);
  margin: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg) 0;
}
</style>
