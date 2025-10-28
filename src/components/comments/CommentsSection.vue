<template>
  <div class="comments-section">
    <CommentFilters
      :status-filters="commentsStore.statusFilter"
      :classification-filters="commentsStore.classificationFilter"
      :visibility-filter="commentsStore.visibilityFilter"
      :deleted-filter="commentsStore.deletedFilter"
      @update="handleFilterUpdate"
    />

    <LoadingSpinner v-if="commentsStore.loading && !commentsStore.comments.length" message="Loading comments..." />

    <div v-else-if="commentsStore.error" class="error-state">
      <p>{{ commentsStore.error }}</p>
      <BaseButton @click="loadComments">Retry</BaseButton>
    </div>

    <div v-else-if="!commentsStore.comments.length" class="empty-state">
      <p>No comments found</p>
    </div>

    <div v-else class="comments-list">
      <CommentCard
        v-for="comment in commentsStore.comments"
        :key="comment.id"
        :comment="comment"
        @delete="handleDelete"
        @update="handleUpdate"
        @update-classification="handleUpdateClassification"
        @delete-answer="handleDeleteAnswer"
        @update-answer="handleUpdateAnswer"
      />
    </div>

    <div v-if="commentsStore.totalPages > 1" class="pagination-wrapper">
      <BasePagination
        :current-page="commentsStore.currentPage"
        :total-pages="commentsStore.totalPages"
        @prev="commentsStore.prevPage(mediaId)"
        @next="commentsStore.nextPage(mediaId)"
        @goto="(page) => handlePageChange(page)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useCommentsStore } from '@/stores/comments'
import { useAsyncActions } from '@/composables/useAsyncAction'
import type {
  UpdateCommentRequest,
  UpdateClassificationRequest,
  UpdateAnswerRequest,
  ProcessingStatus,
  ClassificationType
} from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import CommentFilters from './CommentFilters.vue'
import CommentCard from './CommentCard.vue'

interface Props {
  mediaId: string
}

const props = defineProps<Props>()

const commentsStore = useCommentsStore()

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
    }
  },
  {
    deleteComment: {
      confirmMessage: 'Are you sure? Comment will be deleted permanently. This action cannot be undone. Do you want to continue?',
      onError: (error) => console.error('Failed to delete comment:', error)
    },
    updateComment: {
      onError: (error) => console.error('Failed to update comment:', error)
    },
    updateClassification: {
      onError: (error) => console.error('Failed to update classification:', error)
    },
    deleteAnswer: {
      confirmMessage: 'Are you sure you want to delete this answer?',
      onError: (error) => console.error('Failed to delete answer:', error)
    },
    updateAnswer: {
      onError: (error) => console.error('Failed to update answer:', error)
    }
  }
)

onMounted(() => {
  loadComments()
})

// Reset filters when leaving the media detail page
onUnmounted(() => {
  commentsStore.clearComments()
  commentsStore.clearFilters()
})

watch(() => props.mediaId, () => {
  commentsStore.clearComments()
  commentsStore.clearFilters()
  loadComments()
})

async function loadComments() {
  try {
    await commentsStore.fetchComments(props.mediaId)
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
  actions.updateAnswer.execute(commentId, answerId, data)
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
