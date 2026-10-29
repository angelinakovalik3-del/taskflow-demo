
import { reactive, computed } from 'vue';
import { tasks as initialTasks } from '../data/tasks.js';

const allowedStatuses = ['todo', 'progress', 'done'];
const allowedPriorities = ['low', 'medium', 'high'];
const allowedCategories = ['study', 'work', 'personal'];

export const tasksStore = reactive({
  tasks: initialTasks.map(task => ({ ...task }))
});

export const taskState = tasksStore;

export const completedTasks = computed(() =>
  tasksStore.tasks.filter(task => task.status === 'done')
);

export const inProgressTasks = computed(() =>
  tasksStore.tasks.filter(task => task.status === 'progress')
);

export const plannedTasks = computed(() =>
  tasksStore.tasks.filter(task => task.status === 'todo')
);

function todayString() {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
}

function validDate(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  return !Number.isNaN(date.getTime()) &&
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-') === value;
}

function normalizeTaskData(data) {
  if (!data || typeof data !== 'object') return null;

  const title = typeof data.title === 'string'
    ? data.title.trim()
    : '';

  const description = typeof data.description === 'string'
    ? data.description.trim()
    : '';

  const category = data.category ?? 'study';

  if (title.length < 3 || title.length > 80) return null;
  if (description.length > 300) return null;
  if (!allowedStatuses.includes(data.status)) return null;
  if (!allowedPriorities.includes(data.priority)) return null;
  if (!allowedCategories.includes(category)) return null;
  if (!validDate(data.dueDate)) return null;

  return {
    title,
    description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    category
  };
}

function isDuplicateTitle(title, excludedId = null) {
  const normalizedTitle = title.toLocaleLowerCase('uk-UA');

  return tasksStore.tasks.some(task =>
    task.id !== excludedId &&
    task.title?.trim().toLocaleLowerCase('uk-UA') === normalizedTitle
  );
}

export function addTask(data) {
  const normalized = normalizeTaskData(data);

  if (!normalized) return null;

  if (normalized.dueDate < todayString()) return null;

  if (isDuplicateTitle(normalized.title)) return null;

  const nextId = tasksStore.tasks.reduce(
    (maxId, task) => Math.max(maxId, Number(task.id) || 0),
    0
  ) + 1;

  const newTask = {
    id: nextId,
    ...normalized
  };

  tasksStore.tasks.push(newTask);

  return newTask;
}

export function updateTask({ id, ...data }) {
  const normalized = normalizeTaskData(data);

  if (!normalized) return null;

  const task = tasksStore.tasks.find(item => item.id === id);

  if (!task) return null;

  // Старі завдання можна редагувати навіть із минулою датою.
  if (isDuplicateTitle(normalized.title, id)) return null;

  Object.assign(task, normalized);

  return task;
}

export function updateTaskStatus(id, status) {
  const task = tasksStore.tasks.find(item => item.id === id);

  if (task && allowedStatuses.includes(status)) {
    task.status = status;
  }
}

export function updateTaskPriority(id, priority) {
  const task = tasksStore.tasks.find(item => item.id === id);

  if (task && allowedPriorities.includes(priority)) {
    task.priority = priority;
  }
}

export function setTaskStatus({ id, status }) {
  updateTaskStatus(id, status);
}

export function setTaskPriority({ id, priority }) {
  updateTaskPriority(id, priority);
}
