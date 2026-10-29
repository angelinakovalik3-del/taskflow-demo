
<script setup>
import { computed, nextTick, ref } from 'vue'
import AppTabbar from '../components/AppTabbar.vue'
import TaskCard from '../components/TaskCard.vue'
import TaskForm from '../components/TaskForm.vue'

import {
  tasksStore,
  addTask,
  updateTask,
  setTaskStatus,
  setTaskPriority,
} from '../store/tasks.js'

import '../css/task-form.css'

const statusFilter = ref('all')
const priorityFilter = ref('all')
const searchQuery = ref('')

const formVisible = ref(false)
const editingId = ref(null)
const formAnchor = ref(null)
const feedback = ref('')

const filteredTasks = computed(() =>
  tasksStore.tasks.filter(task => {
    const matchesStatus =
      statusFilter.value === 'all' ||
      task.status === statusFilter.value

    const matchesPriority =
      priorityFilter.value === 'all' ||
      task.priority === priorityFilter.value

    const matchesSearch = task.title
      .toLocaleLowerCase('uk-UA')
      .includes(searchQuery.value.trim().toLocaleLowerCase('uk-UA'))

    return matchesStatus && matchesPriority && matchesSearch
  })
)

const editingTask = computed(() =>
  tasksStore.tasks.find(task => task.id === editingId.value) ?? null
)

function resetFilters() {
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
  searchQuery.value = ''
}

function handleStatusChange(payload) {
  setTaskStatus(payload)
}

function handlePriorityChange(payload) {
  setTaskPriority(payload)
}

async function scrollToForm() {
  await nextTick()
  formAnchor.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

async function createTask() {
  editingId.value = null
  formVisible.value = true
  feedback.value = ''
  await scrollToForm()
}

async function editTask(id) {
  editingId.value = id
  formVisible.value = true
  feedback.value = ''
  await scrollToForm()
}

function cancelForm() {
  formVisible.value = false
  editingId.value = null
}

function saveTask(data) {
  const isEditing = editingId.value !== null

  const saved = isEditing
    ? updateTask({ id: editingId.value, ...data })
    : addTask(data)

  if (!saved) {
    feedback.value =
      'Не вдалося зберегти завдання. Перевірте введені дані.'
    return
  }

  feedback.value = isEditing
    ? `Завдання «${saved.title}» оновлено.`
    : `Завдання «${saved.title}» створено.`

  cancelForm()
  resetFilters()
}
</script>

<template>
  <f7-page name="tasks">
    <f7-navbar title="Мої завдання" />

    <div class="app-content">
      <div class="page-heading">
        <h1>Мої завдання</h1>
        <p>Керуйте завданнями, статусами та пріоритетами.</p>

        <button
          type="button"
          class="tf4-new-task"
          @click="createTask"
        >
          + Додати завдання
        </button>
      </div>

      <p
        v-if="feedback"
        class="tf4-feedback"
        role="status"
      >
        {{ feedback }}
      </p>

      <section
        v-if="formVisible"
        ref="formAnchor"
        class="tf4-form-section"
      >
        <TaskForm
          :key="editingId ?? 'new'"
          :task="editingTask"
          @save="saveTask"
          @cancel="cancelForm"
        />
      </section>

      <div class="task-filters">
        <label>
          Фільтр за статусом:
          <select v-model="statusFilter">
            <option value="all">Усі статуси</option>
            <option value="todo">Заплановано</option>
            <option value="progress">У роботі</option>
            <option value="done">Виконано</option>
          </select>
        </label>

        <label>
          Фільтр за пріоритетом:
          <select v-model="priorityFilter">
            <option value="all">Усі пріоритети</option>
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий</option>
          </select>
        </label>

        <label>
          Пошук за назвою:
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Введіть назву завдання"
            aria-label="Пошук завдань за назвою"
          />
        </label>
      </div>

      <div class="filter-summary">
        Знайдено завдань: {{ filteredTasks.length }}
      </div>

      <div
        v-if="filteredTasks.length"
        class="task-list"
      >
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :editable="true"
          @status-change="handleStatusChange"
          @priority-change="handlePriorityChange"
          @edit="editTask"
        />
      </div>

      <div v-else class="empty-state">
        За вибраними фільтрами завдань не знайдено.
      </div>

      <f7-button
        outline
        large
        class="reset-filters"
        @click="resetFilters"
      >
        Скинути фільтри
      </f7-button>
    </div>

    <AppTabbar active="tasks" />
  </f7-page>
</template>
