<template>
  <div class="comments-section">
    <div class="comments-header">
      <h2>Comments</h2>
      <CommentFilters
        :current-filters="commentsStore.statusFilter"
        @update="handleFilterUpdate"
      />
    </div>

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
import { onMounted, watch } from 'vue'
import { useCommentsStore } from '@/stores/comments'
import type {
  UpdateCommentRequest,
  UpdateClassificationRequest,
  ProcessingStatus
} from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import CommentFilters from './CommentFilters.vue'
import CommentCard from './CommentCard.vue'

interface Props {
  mediaId: number
}

const props = defineProps<Props>()

const commentsStore = useCommentsStore()

onMounted(() => {
  loadComments()
})

watch(() => props.mediaId, () => {
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

function handleFilterUpdate(statuses: ProcessingStatus[]) {
  commentsStore.setStatusFilter(statuses)
  loadComments()
}

function handlePageChange(page: number) {
  commentsStore.currentPage = page
  loadComments()
}

async function handleDelete(id: number) {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      await commentsStore.deleteComment(id)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }
}

async function handleUpdate(id: number, data: UpdateCommentRequest) {
  try {
    await commentsStore.updateComment(id, data)
  } catch (error) {
    console.error('Failed to update comment:', error)
  }
}

async function handleUpdateClassification(id: number, data: UpdateClassificationRequest) {
  try {
    await commentsStore.updateClassification(id, data)
  } catch (error) {
    console.error('Failed to update classification:', error)
  }
}
</script>

<style scoped>
.comments-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.comments-header h2 {
  margin: 0;
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
