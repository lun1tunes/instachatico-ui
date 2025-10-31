<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="fullscreen-editor-overlay" @click.self="handleClose">
        <div class="fullscreen-editor">
          <!-- Header -->
          <div class="editor-header">
            <h2 class="editor-title">{{ resolvedTitle }}</h2>
            <div class="editor-actions">
              <button
                class="view-toggle"
                :class="{ active: viewMode === 'edit' }"
                @click="viewMode = 'edit'"
                :title="localeStore.t('editor.viewModes.edit')"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                class="view-toggle"
                :class="{ active: viewMode === 'split' }"
                @click="viewMode = 'split'"
                :title="localeStore.t('editor.viewModes.split')"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
              </button>
              <button
                class="view-toggle"
                :class="{ active: viewMode === 'preview' }"
                @click="viewMode = 'preview'"
                :title="localeStore.t('editor.viewModes.preview')"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button class="close-btn" @click="handleClose" :title="localeStore.t('editor.closeHint')">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Toolbar -->
          <div class="editor-toolbar">
            <button @click="insertMarkdown('**', '**')" :title="localeStore.t('editor.toolbar.bold')" class="toolbar-btn">
              <strong>B</strong>
            </button>
            <button @click="insertMarkdown('*', '*')" :title="localeStore.t('editor.toolbar.italic')" class="toolbar-btn">
              <em>I</em>
            </button>
            <button @click="insertMarkdown('`', '`')" :title="localeStore.t('editor.toolbar.code')" class="toolbar-btn">
              <code>&lt;/&gt;</code>
            </button>
            <div class="toolbar-divider"></div>
            <button @click="insertMarkdown('# ', '')" :title="localeStore.t('editor.toolbar.heading1')" class="toolbar-btn">H1</button>
            <button @click="insertMarkdown('## ', '')" :title="localeStore.t('editor.toolbar.heading2')" class="toolbar-btn">H2</button>
            <button @click="insertMarkdown('### ', '')" :title="localeStore.t('editor.toolbar.heading3')" class="toolbar-btn">H3</button>
            <div class="toolbar-divider"></div>
            <button @click="insertMarkdown('- ', '')" :title="localeStore.t('editor.toolbar.unorderedList')" class="toolbar-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button @click="insertMarkdown('1. ', '')" :title="localeStore.t('editor.toolbar.orderedList')" class="toolbar-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
              </svg>
            </button>
            <div class="toolbar-divider"></div>
            <button @click="insertMarkdown('[', '](url)')" :title="localeStore.t('editor.toolbar.link')" class="toolbar-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <div class="toolbar-spacer"></div>
            <span class="char-count">{{ characterCountLabel }}</span>
          </div>

          <!-- Content Area -->
          <div class="editor-content" :class="`view-${viewMode}`">
            <!-- Editor Panel -->
            <div v-if="viewMode === 'edit' || viewMode === 'split'" class="editor-panel">
              <textarea
                ref="textareaRef"
                v-model="content"
                class="editor-textarea"
                :placeholder="placeholderText"
                @keydown="handleKeydown"
              ></textarea>
            </div>

            <!-- Preview Panel -->
            <div v-if="viewMode === 'preview' || viewMode === 'split'" class="preview-panel">
              <div class="preview-label">{{ localeStore.t('editor.preview') }}</div>
              <div class="preview-content markdown-body" v-html="renderedMarkdown"></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="editor-footer">
            <div class="footer-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span>{{ localeStore.t('common.hints.markdown') }}</span>
            </div>
            <div class="footer-actions">
              <BaseButton variant="ghost" @click="handleClose">
                {{ localeStore.t('common.actions.cancel') }}
              </BaseButton>
              <BaseButton variant="primary" @click="handleSave">
                {{ saveButtonLabel }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMarkdown } from '@/composables/useMarkdown'
import { useConfirm } from '@/composables/useConfirm'
import BaseButton from './BaseButton.vue'
import { useLocaleStore } from '@/stores/locale'

interface Props {
  modelValue: boolean
  title?: string
  initialContent?: string
  placeholder?: string
  saveButtonText?: string
}

const localeStore = useLocaleStore()

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [content: string]
}>()

const { parseMarkdown } = useMarkdown()
const { confirm } = useConfirm()

const textareaRef = ref<HTMLTextAreaElement>()
const content = ref(props.initialContent ?? '')
const viewMode = ref<'edit' | 'preview' | 'split'>('edit')

const renderedMarkdown = computed(() => parseMarkdown(content.value))
const characterCountLabel = computed(() => localeStore.t('comments.form.characters', { count: content.value.length }))
const resolvedTitle = computed(() => props.title ?? localeStore.t('editor.defaultTitle'))
const placeholderText = computed(() => props.placeholder ?? localeStore.t('editor.defaultPlaceholder'))
const saveButtonLabel = computed(() => props.saveButtonText ?? localeStore.t('editor.saveChanges'))

// Watch for prop changes
watch(() => props.initialContent, (newValue) => {
  content.value = newValue ?? ''
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    // Reset to edit view when opening
    viewMode.value = 'edit'
    // Focus textarea after DOM update
    setTimeout(() => {
      textareaRef.value?.focus()
    }, 100)
  }
})

function insertMarkdown(before: string, after: string) {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const beforeText = content.value.substring(0, start)
  const afterText = content.value.substring(end)

  // Insert markdown syntax
  content.value = beforeText + before + selectedText + after + afterText

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
    content.value = content.value.substring(0, start) + '  ' + content.value.substring(end)
    setTimeout(() => {
      textarea.setSelectionRange(start + 2, start + 2)
    }, 0)
  }
}

async function handleClose() {
  // Check if content has been modified from initial content
  const hasChanges = content.value !== props.initialContent

  if (hasChanges) {
    const confirmed = await confirm({
      title: localeStore.t('editor.unsaved.title'),
      message: localeStore.t('editor.unsaved.message'),
      variant: 'warning',
      confirmText: localeStore.t('editor.unsaved.confirm'),
      cancelText: localeStore.t('editor.unsaved.cancel')
    })
    if (!confirmed) {
      return // Don't close, user wants to continue editing
    }
  }

  emit('update:modelValue', false)
}

function handleSave() {
  emit('save', content.value)
  emit('update:modelValue', false)
}

// ESC to close
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.fullscreen-editor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.fullscreen-editor {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 1400px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--slate-200);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.editor-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--navy-800);
}

.editor-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.view-toggle {
  padding: 0.5rem;
  border: 1px solid var(--slate-300);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--navy-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle:hover {
  border-color: var(--blue-400);
  color: var(--blue-600);
  background: var(--blue-50);
}

.view-toggle.active {
  border-color: var(--blue-500);
  background: var(--blue-500);
  color: white;
}

.close-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--navy-600);
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--slate-200);
  color: var(--navy-800);
}

/* Toolbar */
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-xl);
  border-bottom: 1px solid var(--slate-200);
  background: white;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--slate-300);
  background: white;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--navy-700);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
}

.toolbar-btn:hover {
  border-color: var(--blue-400);
  background: var(--blue-50);
  color: var(--blue-600);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--slate-300);
  margin: 0 var(--spacing-xs);
}

.toolbar-spacer {
  flex: 1;
}

.char-count {
  font-size: 0.75rem;
  color: var(--navy-500);
  padding: 0 var(--spacing-sm);
}

/* Content */
.editor-content {
  flex: 1;
  display: grid;
  overflow: hidden;
}

.editor-content.view-split {
  grid-template-columns: 1fr 1fr;
}

.editor-content.view-edit {
  grid-template-columns: 1fr;
}

.editor-content.view-preview {
  grid-template-columns: 1fr;
}

.editor-panel,
.preview-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-panel {
  border-right: 1px solid var(--slate-200);
}

.editor-textarea {
  flex: 1;
  padding: var(--spacing-xl);
  border: none;
  outline: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--navy-800);
  resize: none;
  background: #fafbfc;
}

.editor-textarea::placeholder {
  color: var(--slate-400);
}

.preview-panel {
  background: white;
}

.preview-label {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--navy-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--slate-200);
  background: var(--slate-50);
}

.preview-content {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}

/* Markdown styles */
.markdown-body {
  color: var(--navy-800);
  line-height: 1.6;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  color: var(--navy-900);
}

.markdown-body :deep(h1) { font-size: 2em; }
.markdown-body :deep(h2) { font-size: 1.5em; }
.markdown-body :deep(h3) { font-size: 1.25em; }

.markdown-body :deep(p) {
  margin-bottom: 1em;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: var(--navy-900);
}

.markdown-body :deep(em) {
  font-style: italic;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  background: var(--slate-100);
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875em;
  color: var(--navy-800);
}

.markdown-body :deep(pre) {
  padding: var(--spacing-md);
  background: var(--navy-900);
  color: #e2e8f0;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-body :deep(li) {
  margin: 0.5em 0;
}

.markdown-body :deep(a) {
  color: var(--blue-600);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: 1em 0;
}

/* Footer */
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--slate-200);
  background: var(--slate-50);
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
  color: var(--navy-600);
}

.footer-hint svg {
  color: var(--blue-500);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-md);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .fullscreen-editor,
.modal-fade-leave-active .fullscreen-editor {
  transition: transform var(--transition-base);
}

.modal-fade-enter-from .fullscreen-editor,
.modal-fade-leave-to .fullscreen-editor {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 1024px) {
  .editor-content.view-split {
    grid-template-columns: 1fr;
  }

  .editor-panel {
    border-right: none;
    border-bottom: 1px solid var(--slate-200);
  }

  .fullscreen-editor {
    height: 95vh;
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    gap: var(--spacing-2xs);
  }

  .toolbar-btn {
    min-width: 32px;
    height: 32px;
    padding: 0.375rem 0.5rem;
  }

  .char-count {
    display: none;
  }
}
</style>
