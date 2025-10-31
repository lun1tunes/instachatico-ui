<template>
  <form @submit.prevent="handleSubmit" class="classification-form">
    <div class="form-group">
      <label for="type" class="form-label">{{ localeStore.t('comments.form.classificationType') }}</label>
      <select
        id="type"
        v-model="selectedType"
        class="form-select"
        required
      >
        <option
          v-for="option in classificationTypeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="reasoning" class="form-label">{{ localeStore.t('comments.form.reasoning') }}</label>

      <!-- Markdown Toolbar -->
      <div class="markdown-toolbar">
        <button type="button" @click="insertMarkdown('**', '**')" :title="localeStore.t('editor.toolbar.bold')" class="toolbar-btn">
          <strong>B</strong>
        </button>
        <button type="button" @click="insertMarkdown('*', '*')" :title="localeStore.t('editor.toolbar.italic')" class="toolbar-btn">
          <em>I</em>
        </button>
        <button type="button" @click="insertMarkdown('`', '`')" :title="localeStore.t('editor.toolbar.code')" class="toolbar-btn">
          <code>&lt;/&gt;</code>
        </button>
        <div class="toolbar-divider"></div>
        <button type="button" @click="insertMarkdown('# ', '')" :title="localeStore.t('editor.toolbar.heading1')" class="toolbar-btn">H1</button>
        <button type="button" @click="insertMarkdown('## ', '')" :title="localeStore.t('editor.toolbar.heading2')" class="toolbar-btn">H2</button>
        <button type="button" @click="insertMarkdown('### ', '')" :title="localeStore.t('editor.toolbar.heading3')" class="toolbar-btn">H3</button>
        <div class="toolbar-divider"></div>
        <button type="button" @click="insertMarkdown('- ', '')" :title="localeStore.t('editor.toolbar.unorderedList')" class="toolbar-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
        <button type="button" @click="insertMarkdown('1. ', '')" :title="localeStore.t('editor.toolbar.orderedList')" class="toolbar-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1v4" />
            <path d="M4 10h2" />
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
          </svg>
        </button>
        <button type="button" @click="insertMarkdown('[', '](url)')" :title="localeStore.t('editor.toolbar.link')" class="toolbar-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
        <div class="toolbar-spacer"></div>
        <span class="char-count">{{ localeStore.t('comments.form.characters', { count: reasoning.length }) }}</span>
      </div>

      <textarea
        id="reasoning"
        ref="textareaRef"
        v-model="reasoning"
        class="form-textarea"
        rows="6"
        :placeholder="localeStore.t('comments.form.placeholder')"
        required
        @keydown="handleKeydown"
      ></textarea>
    </div>

    <div class="form-actions">
      <BaseButton type="button" variant="ghost" @click="handleCancel">
        {{ localeStore.t('common.actions.cancel') }}
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        {{ localeStore.t('comments.form.submit') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ClassificationType } from '@/types/api'
import type { UpdateClassificationRequest } from '@/types/api'
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useLocaleStore } from '@/stores/locale'

interface Props {
  currentType: ClassificationType | null
  currentReasoning: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: UpdateClassificationRequest]
  cancel: []
}>()

const { confirm } = useConfirm()
const localeStore = useLocaleStore()

const textareaRef = ref<HTMLTextAreaElement>()
const selectedType = ref(String(props.currentType ?? ClassificationType.POSITIVE_FEEDBACK))
const reasoning = ref(props.currentReasoning)

// Store initial values for change detection
const initialType = String(props.currentType ?? ClassificationType.POSITIVE_FEEDBACK)
const initialReasoning = props.currentReasoning

const classificationTypeOptions = computed(() => [
  {
    value: String(ClassificationType.POSITIVE_FEEDBACK),
    label: localeStore.t('comments.classificationLabels.positive')
  },
  {
    value: String(ClassificationType.CRITICAL_FEEDBACK),
    label: localeStore.t('comments.classificationLabels.critical')
  },
  {
    value: String(ClassificationType.URGENT_ISSUE),
    label: localeStore.t('comments.classificationLabels.urgent')
  },
  {
    value: String(ClassificationType.QUESTION_INQUIRY),
    label: localeStore.t('comments.classificationLabels.question')
  },
  {
    value: String(ClassificationType.PARTNERSHIP_PROPOSAL),
    label: localeStore.t('comments.classificationLabels.partnership')
  },
  {
    value: String(ClassificationType.TOXIC_ABUSIVE),
    label: localeStore.t('comments.classificationLabels.toxic')
  },
  {
    value: String(ClassificationType.SPAM_IRRELEVANT),
    label: localeStore.t('comments.classificationLabels.spam')
  }
])

function insertMarkdown(before: string, after: string) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = reasoning.value.substring(start, end)
  const beforeText = reasoning.value.substring(0, start)
  const afterText = reasoning.value.substring(end)

  // Insert markdown syntax
  reasoning.value = beforeText + before + selectedText + after + afterText

  // Restore cursor position
  setTimeout(() => {
    textarea.focus()
    const newPosition = start + before.length + selectedText.length
    textarea.setSelectionRange(newPosition, newPosition)
  }, 0)
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl/Cmd + B for bold
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault()
    insertMarkdown('**', '**')
  }
  // Ctrl/Cmd + I for italic
  if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
    event.preventDefault()
    insertMarkdown('*', '*')
  }
  // Tab to insert spaces
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = textareaRef.value!
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    reasoning.value = reasoning.value.substring(0, start) + '  ' + reasoning.value.substring(end)
    setTimeout(() => {
      textarea.setSelectionRange(start + 2, start + 2)
    }, 0)
  }
}

async function handleCancel() {
  // Check if content has been modified
  const hasChanges =
    selectedType.value !== initialType ||
    reasoning.value !== initialReasoning

  if (hasChanges) {
    const confirmed = await confirm({
      title: localeStore.t('comments.form.unsaved.title'),
      message: localeStore.t('comments.form.unsaved.message'),
      variant: 'warning',
      confirmText: localeStore.t('comments.form.unsaved.confirm'),
      cancelText: localeStore.t('comments.form.unsaved.cancel')
    })

    if (!confirmed) {
      return // Don't close, user wants to continue editing
    }
  }

  emit('cancel')
}

function handleSubmit() {
  emit('submit', {
    classification_type: selectedType.value,
    reasoning: reasoning.value
  })
}
</script>

<style scoped>
.classification-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--navy-700);
}

.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--slate-300);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: var(--font-sans);
  color: var(--navy-800);
  background-color: white;
  transition: all var(--transition-fast);
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--blue-500);
  box-shadow: 0 0 0 3px var(--blue-100);
}

.form-textarea {
  resize: vertical;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

/* Markdown Toolbar */
.markdown-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--slate-50);
  border: 1px solid var(--slate-300);
  border-bottom: none;
  border-radius: var(--radius-md);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--slate-300);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--navy-700);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.toolbar-btn:hover {
  border-color: var(--blue-400);
  background: var(--blue-50);
  color: var(--blue-600);
}

.toolbar-btn:active {
  transform: translateY(1px);
}

.toolbar-btn strong,
.toolbar-btn em {
  font-size: 0.875rem;
}

.toolbar-btn code {
  font-size: 0.75rem;
  color: inherit;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--slate-300);
  margin: 0 var(--spacing-2xs);
}

.toolbar-spacer {
  flex: 1;
}

.char-count {
  font-size: 0.6875rem;
  color: var(--navy-500);
  padding: 0 var(--spacing-xs);
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 640px) {
  .markdown-toolbar {
    gap: var(--spacing-2xs);
  }

  .toolbar-btn {
    min-width: 28px;
    height: 28px;
    padding: 0.3rem 0.5rem;
  }

  .char-count {
    display: none;
  }

  .toolbar-spacer {
    display: none;
  }
}
</style>
