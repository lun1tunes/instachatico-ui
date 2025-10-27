<template>
  <form @submit.prevent="handleSubmit" class="classification-form">
    <div class="form-group">
      <label for="type" class="form-label">Classification Type</label>
      <select
        id="type"
        v-model="selectedType"
        class="form-select"
        required
      >
        <option
          v-for="(label, type) in classificationTypes"
          :key="type"
          :value="type"
        >
          {{ label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label for="reasoning" class="form-label">Reasoning</label>
      <textarea
        id="reasoning"
        v-model="reasoning"
        class="form-textarea"
        rows="4"
        placeholder="Explain why this classification is appropriate..."
        required
      ></textarea>
    </div>

    <div class="form-actions">
      <BaseButton type="button" variant="ghost" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        Update Classification
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ClassificationType, ClassificationTypeLabels } from '@/types/api'
import type { UpdateClassificationRequest } from '@/types/api'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  currentType: ClassificationType
  currentReasoning: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: UpdateClassificationRequest]
  cancel: []
}>()

const selectedType = ref(String(props.currentType))
const reasoning = ref(props.currentReasoning)

const classificationTypes = {
  '1': ClassificationTypeLabels[ClassificationType.POSITIVE_FEEDBACK],
  '2': ClassificationTypeLabels[ClassificationType.CRITICAL_FEEDBACK],
  '3': ClassificationTypeLabels[ClassificationType.URGENT_ISSUE],
  '4': ClassificationTypeLabels[ClassificationType.QUESTION_INQUIRY],
  '5': ClassificationTypeLabels[ClassificationType.PARTNERSHIP_PROPOSAL],
  '6': ClassificationTypeLabels[ClassificationType.TOXIC_ABUSIVE],
  '7': ClassificationTypeLabels[ClassificationType.SPAM_IRRELEVANT]
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
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}
</style>
