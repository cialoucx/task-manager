const TaskService = require('../services/taskService');
const { toTaskDTO } = require('../dtos/taskDTO');

// GET /api/tasks?status=all|active|inactive&search=text&dueDateFilter=today|week|overdue|high&sortBy=newest|oldest|priority|dueDate|alphabetical
function getTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { status = 'all', search = '', dueDateFilter = '', sortBy = 'newest' } = req.query;
    
    const tasks = TaskService.getTasks({
      userId,
      status,
      search: String(search),
      dueDateFilter: String(dueDateFilter),
      sortBy: String(sortBy)
    });
    
    res.json({ data: tasks.map(toTaskDTO), count: tasks.length });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
function getTaskById(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const task = TaskService.getTaskById(taskId, userId);
    res.json({ data: toTaskDTO(task) });
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
function createTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, priority, columnPosition } = req.body;
    const task = TaskService.createTask({
      title,
      description,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      columnPosition: columnPosition || 0,
      userId
    });
    res.status(201).json({ data: toTaskDTO(task) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/tasks/:id
function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const task = TaskService.updateTask(taskId, userId, req.body);
    res.json({ data: toTaskDTO(task) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id/toggle
function toggleTask(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const existing = TaskService.getTaskById(taskId, userId);
    const task = TaskService.updateTask(taskId, userId, { completed: !existing.completed });
    res.json({ data: toTaskDTO(task) });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const task = TaskService.deleteTask(taskId, userId);
    res.json({ data: toTaskDTO(task) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, getTaskById, createTask, updateTask, toggleTask, deleteTask };
