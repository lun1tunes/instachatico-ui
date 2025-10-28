# Async Action Handling Guide

## Problem

When buttons are clicked multiple times (especially with slow network/throttling), multiple HTTP requests are sent to the backend, causing:
- Duplicate API calls
- Race conditions
- Poor user experience
- Potential data inconsistency

## Solution

We've implemented a comprehensive **`useAsyncAction`** composable that provides:

✅ **Duplicate Prevention** - Ignores subsequent calls while an action is in progress
✅ **Loading State Management** - Automatic loading flags for UI feedback
✅ **Error Handling** - Centralized error handling with callbacks
✅ **Confirmation Dialogs** - Built-in support for destructive actions
✅ **Type Safety** - Full TypeScript support with proper inference

---

## Usage

### 1. Single Async Action

Use `useAsyncAction` for a single async operation:

```typescript
import { useAsyncAction } from '@/composables/useAsyncAction'

// Define the action
const { execute, loading, error } = useAsyncAction(
  async (id: string) => {
    await apiService.deleteComment(id)
  },
  {
    confirmMessage: 'Are you sure you want to delete?',
    onSuccess: () => console.log('Deleted successfully'),
    onError: (error) => console.error('Failed:', error)
  }
)

// Use in template
<BaseButton
  @click="execute(commentId)"
  :loading="loading"
  :disabled="loading"
>
  Delete
</BaseButton>
```

### 2. Multiple Async Actions

Use `useAsyncActions` for multiple related actions:

```typescript
import { useAsyncActions } from '@/composables/useAsyncAction'

// Define all actions
const actions = useAsyncActions(
  {
    delete: async (id: string) => {
      await commentsStore.deleteComment(id)
    },
    hide: async (id: string, hidden: boolean) => {
      await commentsStore.updateComment(id, { is_hidden: hidden })
    },
    update: async (id: string, data: UpdateRequest) => {
      await commentsStore.updateComment(id, data)
    }
  },
  {
    delete: {
      confirmMessage: 'Delete this comment permanently?',
      onError: (error) => console.error('Delete failed:', error)
    },
    hide: {
      onError: (error) => console.error('Update failed:', error)
    }
  }
)

// Use in template
<BaseButton
  @click="actions.delete.execute(id)"
  :loading="actions.delete.loading"
>
  Delete
</BaseButton>

<BaseButton
  @click="actions.hide.execute(id, true)"
  :loading="actions.hide.loading"
>
  Hide
</BaseButton>
```

---

## API Reference

### `useAsyncAction(action, options?)`

Creates a single async action handler.

**Parameters:**
- `action: (...args: TArgs) => Promise<TResult>` - The async function to execute
- `options?: object` - Optional configuration:
  - `onSuccess?: (result: TResult) => void` - Called on success
  - `onError?: (error: Error) => void` - Called on error
  - `confirmMessage?: string` - Show confirmation dialog before executing

**Returns:**
```typescript
{
  execute: (...args: TArgs) => Promise<TResult | undefined>
  loading: Ref<boolean>
  error: Ref<Error | null>
}
```

### `useAsyncActions(actions, options?)`

Creates multiple async action handlers.

**Parameters:**
- `actions: Record<string, (...args: any[]) => Promise<any>>` - Map of action functions
- `options?: Record<string, ActionOptions>` - Per-action configuration

**Returns:**
```typescript
Record<string, {
  execute: (...args) => Promise<Result | undefined>
  loading: Ref<boolean>
  error: Ref<Error | null>
}>
```

---

## Real-World Examples

### Example 1: Comment Actions (CommentsSection.vue)

```typescript
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
    }
  },
  {
    deleteComment: {
      confirmMessage: 'Delete this comment permanently?',
      onError: (error) => console.error('Failed to delete:', error)
    },
    updateComment: {
      onError: (error) => console.error('Failed to update:', error)
    }
  }
)

// Handlers
function handleDelete(id: string) {
  actions.deleteComment.execute(id)
}

function handleUpdate(id: string, data: UpdateCommentRequest) {
  actions.updateComment.execute(id, data)
}
```

### Example 2: Media Updates (MediaDetail.vue)

```typescript
const { execute: updateMedia, loading: updateLoading } = useAsyncAction(
  async (data: UpdateMediaRequest) => {
    const id = String(route.params.id)
    await mediaStore.updateMedia(id, data)
  },
  {
    onSuccess: () => console.log('Media updated'),
    onError: (error) => console.error('Failed to update:', error)
  }
)

function handleUpdateMedia(data: UpdateMediaRequest) {
  updateMedia(data)
}
```

### Example 3: Form Submission

```typescript
const { execute: submitForm, loading: submitting, error: submitError } = useAsyncAction(
  async (formData: FormData) => {
    return await apiService.submitForm(formData)
  },
  {
    onSuccess: (result) => {
      console.log('Form submitted:', result)
      router.push('/success')
    },
    onError: (error) => {
      alert(`Submission failed: ${error.message}`)
    }
  }
)

// In template
<form @submit.prevent="submitForm(formData)">
  <input v-model="formData.name" :disabled="submitting" />
  <BaseButton type="submit" :loading="submitting">
    Submit
  </BaseButton>
  <p v-if="submitError" class="error">{{ submitError.message }}</p>
</form>
```

---

## How It Works

### 1. Duplicate Prevention

```typescript
const execute = async (...args: TArgs) => {
  // Prevents duplicate calls while loading
  if (loading.value) {
    console.warn('[useAsyncAction] Action already in progress, ignoring duplicate call')
    return
  }

  loading.value = true
  try {
    const result = await action(...args)
    return result
  } finally {
    loading.value = false
  }
}
```

**Behavior:**
- First click: `loading = true`, action starts
- Rapid clicks 2-5: Ignored with console warning
- Action completes: `loading = false`

### 2. Loading States

Each action has its own `loading` ref:
- `true` - Action is in progress
- `false` - Action is idle

Use this to:
- Disable buttons: `:disabled="loading"`
- Show spinners: `:loading="loading"`
- Show loading text: `v-if="loading"`

### 3. Error Handling

Errors are:
1. Caught automatically
2. Stored in `error` ref
3. Passed to `onError` callback (if provided)
4. Re-thrown for parent handling (if needed)

### 4. Confirmation Dialogs

If `confirmMessage` is provided:
```typescript
if (options?.confirmMessage) {
  const confirmed = window.confirm(options.confirmMessage)
  if (!confirmed) {
    return // Action cancelled
  }
}
```

---

## Migration Guide

### Before (Old Pattern)

```typescript
const loading = ref(false)

async function deleteComment(id: string) {
  if (confirm('Are you sure?')) {
    loading.value = true  // ❌ Manual loading management
    try {
      await apiService.deleteComment(id)
      console.log('Deleted')
    } catch (error) {
      console.error('Failed:', error)
    } finally {
      loading.value = false
    }
  }
}
```

**Problems:**
- No duplicate prevention
- Boilerplate try/catch/finally
- Manual loading state management
- Repetitive code

### After (New Pattern)

```typescript
const { execute: deleteComment, loading } = useAsyncAction(
  async (id: string) => {
    await apiService.deleteComment(id)
  },
  {
    confirmMessage: 'Are you sure?',
    onSuccess: () => console.log('Deleted'),
    onError: (error) => console.error('Failed:', error)
  }
)
```

**Benefits:**
- ✅ Automatic duplicate prevention
- ✅ Automatic loading management
- ✅ Centralized error handling
- ✅ Built-in confirmations
- ✅ Less boilerplate

---

## Best Practices

### ✅ DO

**1. Use for all async operations**
```typescript
// Good
const { execute: save } = useAsyncAction(async (data) => {
  await apiService.save(data)
})
```

**2. Destructure with meaningful names**
```typescript
// Good - clear what the action does
const { execute: deleteComment, loading: deleteLoading } = useAsyncAction(...)
```

**3. Provide error handlers**
```typescript
// Good - user-friendly error handling
useAsyncAction(action, {
  onError: (error) => {
    toast.error(`Failed to save: ${error.message}`)
  }
})
```

**4. Use confirmation for destructive actions**
```typescript
// Good - prevents accidents
useAsyncAction(deleteAction, {
  confirmMessage: 'Delete this item permanently?'
})
```

### ❌ DON'T

**1. Don't bypass the composable**
```typescript
// Bad - no duplicate prevention
async function delete(id: string) {
  await apiService.delete(id)
}
```

**2. Don't create multiple composables for the same action**
```typescript
// Bad - creates separate loading states
const action1 = useAsyncAction(deleteComment)
const action2 = useAsyncAction(deleteComment) // ❌ Duplicate

// Good - reuse the same action
const action = useAsyncAction(deleteComment)
```

**3. Don't ignore loading states**
```typescript
// Bad - button not disabled while loading
<button @click="execute(id)">Delete</button>

// Good - proper loading state
<BaseButton
  @click="execute(id)"
  :loading="loading"
  :disabled="loading"
>
  Delete
</BaseButton>
```

---

## TypeScript Support

The composable is fully typed with proper inference:

```typescript
// Infers parameter types
const { execute } = useAsyncAction(
  async (id: string, data: UpdateData) => {
    return await api.update(id, data)
  }
)

execute('123', data) // ✅ Type safe
execute(123, data)   // ❌ TypeScript error

// Infers return type
const { execute } = useAsyncAction(
  async (id: string) => {
    return await api.get(id) // Returns User
  }
)

const user = await execute('123') // user: User | undefined
```

---

## Testing

### Unit Testing

```typescript
import { useAsyncAction } from '@/composables/useAsyncAction'
import { nextTick } from 'vue'

describe('useAsyncAction', () => {
  it('prevents duplicate calls', async () => {
    const mockAction = vi.fn().mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    )

    const { execute, loading } = useAsyncAction(mockAction)

    // First call
    execute()
    await nextTick()
    expect(loading.value).toBe(true)

    // Duplicate call (should be ignored)
    execute()
    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn()
    const { execute } = useAsyncAction(
      async () => 'result',
      { onSuccess }
    )

    await execute()
    expect(onSuccess).toHaveBeenCalledWith('result')
  })
})
```

---

## Performance Considerations

**Memory:** Each `useAsyncAction` creates 2 refs (`loading` and `error`). This is negligible.

**Network:** Duplicate prevention reduces unnecessary network requests significantly.

**UI:** Loading states provide better perceived performance with visual feedback.

---

## Troubleshooting

### Issue: Action not executing

**Check:**
1. Is loading still `true`? (Previous action not completed)
2. Was confirmation cancelled?
3. Check browser console for warnings

### Issue: Loading state not updating

**Check:**
1. Are you using `loading.value` in templates (not just `loading`)?
2. Is the action actually async?
3. Check for uncaught errors

### Issue: Confirmation not showing

**Check:**
1. Is `confirmMessage` provided in options?
2. Is browser blocking `window.confirm()`?

---

## Summary

The `useAsyncAction` composable provides a modern, type-safe solution for handling async operations in Vue 3:

- ✅ Prevents duplicate requests
- ✅ Automatic loading state management
- ✅ Centralized error handling
- ✅ Built-in confirmation dialogs
- ✅ Full TypeScript support
- ✅ Minimal boilerplate
- ✅ Consistent across the entire codebase

Use it for **all** async operations in your components!
