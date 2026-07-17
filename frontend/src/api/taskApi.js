const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body;
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('saas-task-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchTasks({ status = 'all', search = '', dueDateFilter = '', sortBy = 'newest' } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  if (dueDateFilter) params.set('dueDateFilter', dueDateFilter);
  if (sortBy) params.set('sortBy', sortBy);

  const res = await fetch(`${API_BASE}/tasks?${params.toString()}`, {
    headers: getHeaders()
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function createTask({ title, description, dueDate, priority, columnPosition }) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, description, dueDate, priority, columnPosition }),
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function updateTask(id, fields) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(fields),
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function toggleTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function fetchActivityTimeline() {
  const res = await fetch(`${API_BASE}/activity`, {
    headers: getHeaders()
  });
  const body = await handleResponse(res);
  return body.data;
}
