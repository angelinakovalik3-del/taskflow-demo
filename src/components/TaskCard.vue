
<script setup>
import { computed } from 'vue'
import StatusBadge from './StatusBadge.vue'
import PriorityBadge from './PriorityBadge.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'status-change',
  'priority-change',
  'task-select',
  'edit',
])

const statusSequence = ['todo', 'progress', 'done']
const prioritySequence = ['low', 'medium', 'high']

const statusActionText = computed(() => ({
  todo: 'Взяти в роботу',
  progress: 'Завершити',
  done: 'Повернути в план',
}[props.task.status] ?? 'Змінити статус'))

const categoryLabels = {
  study: 'Навчання',
  work: 'Робота',
  personal: 'Особисте',
}

const categoryLabel = computed(() => {
  return categoryLabels[props.task.category] ?? 'Не вказано'
})

const formattedDate = computed(() => {
  if (!props.task.dueDate) {
    return 'Без терміну'
  }

  const date = new Date(`${props.task.dueDate}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return 'Дата не визначена'
  }

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
})

function changeStatus() {
  const index = statusSequence.indexOf(props.task.status)

  emit('status-change', {
    id: props.task.id,
    status: statusSequence[(index + 1) % statusSequence.length],
  })
}

function changePriority() {
  const index = prioritySequence.indexOf(props.task.priority)

  emit('priority-change', {
    id: props.task.id,
    priority: prioritySequence[(index + 1) % prioritySequence.length],
  })
}

function selectTask() {
  emit('task-select', {
    id: props.task.id,
    title: props.task.title,
  })
}

function editTask() {
  emit('edit', props.task.id)
}
</script>

<template>
  <div class="task-card">
    <div class="task-card__top">
      <StatusBadge :status="task.status" />
      <PriorityBadge :priority="task.priority" />
    </div>

    <h3 class="task-card__title">
      {{ task.title }}
    </h3>

    <p class="task-card__description">
      {{ task.description }}
    </p>

    <p class="task-card__date">
      Термін виконання: {{ formattedDate }}
    </p>

    <p class="task-card__category">
      Категорія: {{ categoryLabel }}
    </p>

    <div class="task-card__actions">
      <button
        type="button"
        class="task-card__button"
        @click="changeStatus"
      >
        {{ statusActionText }}
      </button>

      <button
        type="button"
        class="task-card__button"
        @click="changePriority"
      >
        Змінити пріоритет
      </button>

      <button
        type="button"
        class="task-card__button"
        @click="selectTask"
      >
        Вибрати завдання
      </button>

      <button
        v-if="editable"
        type="button"
        class="task-card__button"
        @click="editTask"
      >
        Редагувати
      </button>
    </div>
  </div>
</template>
