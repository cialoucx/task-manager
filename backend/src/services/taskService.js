const TaskModel = require('../models/taskModel');
const ActivityModel = require('../models/activityModel');

const TaskService = {
  getTasks({ userId, status, search, dueDateFilter, sortBy }) {
    return TaskModel.findAll({ userId, status, search, dueDateFilter, sortBy });
  },

  getTaskById(id, userId) {
    const task = TaskModel.findById(id);
    if (!task) {
      const err = new Error('Task not found.');
      err.status = 404;
      throw err;
    }
    if (task.userId !== userId) {
      const err = new Error('Access denied.');
      err.status = 403;
      throw err;
    }
    return task;
  },

  createTask({ title, description, dueDate, priority, columnPosition, userId }) {
    const task = TaskModel.create({ title, description, dueDate, priority, columnPosition, userId });
    ActivityModel.create({
      taskId: task.id,
      userId,
      action: 'created',
      details: `Created task "${task.title}"`
    });
    return task;
  },

  updateTask(id, userId, fields) {
    const task = this.getTaskById(id, userId);
    
    const changes = [];
    if (fields.title !== undefined && fields.title !== task.title) {
      changes.push(`renamed to "${fields.title}"`);
    }
    if (fields.description !== undefined && fields.description !== task.description) {
      changes.push('updated description');
    }
    if (fields.completed !== undefined && fields.completed !== task.completed) {
      changes.push(fields.completed ? 'marked complete' : 'marked incomplete');
    }
    if (fields.priority !== undefined && fields.priority !== task.priority) {
      changes.push(`priority set to ${fields.priority}`);
    }
    if (fields.dueDate !== undefined && fields.dueDate !== task.dueDate) {
      changes.push(`due date set to ${fields.dueDate || 'none'}`);
    }
    if (fields.columnPosition !== undefined && fields.columnPosition !== task.columnPosition) {
      changes.push(`moved column position`);
    }

    const updatedTask = TaskModel.update(id, fields);

    if (changes.length > 0) {
      ActivityModel.create({
        taskId: id,
        userId,
        action: fields.completed !== undefined && fields.completed !== task.completed 
          ? (fields.completed ? 'completed' : 'incomplete') 
          : 'updated',
        details: `Task "${updatedTask.title}": ${changes.join(', ')}`
      });
    }

    return updatedTask;
  },

  deleteTask(id, userId) {
    const task = this.getTaskById(id, userId);
    TaskModel.remove(id);
    ActivityModel.create({
      taskId: id,
      userId,
      action: 'deleted',
      details: `Deleted task "${task.title}"`
    });
    return task;
  }
};

module.exports = TaskService;
