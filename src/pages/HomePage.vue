
<template>
  <f7-page name="home">
    <f7-navbar title="TaskFlow">
      <f7-nav-right>
        <f7-link href="/about/">
          <f7-icon f7="info_circle" />
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <div class="app-content">
      <div class="page-heading">
        <h1>Головна</h1>
        <p>Огляд ваших завдань</p>
      </div>

      <!-- Статистика -->
      <div class="stats-grid">
        <div class="stat-card">
          <f7-icon f7="square_list" />
          <div class="stat-value">{{ totalTasks }}</div>
          <div class="stat-label">Усього завдань</div>
        </div>

        <div class="stat-card stat-card-success">
          <f7-icon f7="checkmark_circle" />
          <div class="stat-value">{{ completedTasks }}</div>
          <div class="stat-label">Виконано</div>
        </div>

        <div class="stat-card stat-card-pending">
          <f7-icon f7="clock" />
          <div class="stat-value">{{ pendingTasks }}</div>
          <div class="stat-label">Очікує виконання</div>
        </div>

        <div class="stat-card">
          <f7-icon f7="calendar" />
          <div class="stat-value">{{ plannedTasks }}</div>
          <div class="stat-label">Заплановано</div>
        </div>
      </div>

      <!-- Відсоток виконання -->
      <div class="completion-section">
        <h2>Прогрес виконання</h2>

        <div class="completion-value">
          {{ completionPercent }}%
        </div>

        <div class="completion-bar">
          <div
            class="completion-bar-fill"
            :style="{ width: completionPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Компонент TaskCounter -->
      <TaskCounter
        :total="totalTasks"
        :completed="completedTasks"
        :in-progress="inProgressTasksCount"
        :planned="plannedTasks"
      />

      <!-- Актуальні завдання -->
      <div class="section-heading">
        <h2>Актуальні завдання</h2>
        <f7-link href="/tasks/">Переглянути всі</f7-link>
      </div>

      <div v-if="activeTasks.length" class="task-cards-grid">
        <TaskCard
          v-for="task in activeTasks"
          :key="task.id"
          :task="task"
          @status-change="handleStatusChange"
          @priority-change="handlePriorityChange"
          @task-select="handleTaskSelect"
        />
      </div>

      <div v-else class="empty-state">
        Усі завдання виконані.
      </div>

      <div v-if="selectedTask" class="selected-task-info">
        Вибране завдання: {{ selectedTask.title }}
      </div>

      <f7-button
        fill
        large
        href="/tasks/"
        class="page-action"
      >
        Перейти до завдань
      </f7-button>
    </div>

    <AppTabbar active="home" />
  </f7-page>
</template>

<script setup>
import { ref, computed } from 'vue';

import AppTabbar from '../components/AppTabbar.vue';
import TaskCard from '../components/TaskCard.vue';
import TaskCounter from '../components/TaskCounter.vue';

import {
  tasksStore,
  updateTaskStatus,
  updateTaskPriority
} from '../store/tasks.js';

const selectedTask = ref(null);

const totalTasks = computed(() =>
  tasksStore.tasks.length
);

const completedTasks = computed(() =>
  tasksStore.tasks.filter(
    task => task.status === 'done'
  ).length
);

const pendingTasks = computed(() =>
  tasksStore.tasks.filter(
    task => task.status !== 'done'
  ).length
);

const plannedTasks = computed(() =>
  tasksStore.tasks.filter(
    task => task.status === 'todo'
  ).length
);

const inProgressTasksCount = computed(() =>
  tasksStore.tasks.filter(
    task => task.status === 'progress'
  ).length
);

const completionPercent = computed(() => {
  if (totalTasks.value === 0) {
    return 0;
  }

  return Math.round(
    (completedTasks.value / totalTasks.value) * 100
  );
});

const activeTasks = computed(() => {
  const priorityOrder = {
    high: 0,
    medium: 1,
    low: 2
  };

  return tasksStore.tasks
    .filter(task => task.status !== 'done')
    .sort((a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority]
    )
    .slice(0, 3);
});

function handleStatusChange(payload) {
  updateTaskStatus(
    payload.id,
    payload.status
  );
}

function handlePriorityChange(payload) {
  updateTaskPriority(
    payload.id,
    payload.priority
  );
}

function handleTaskSelect(payload) {
  selectedTask.value = payload;
}
</script>
