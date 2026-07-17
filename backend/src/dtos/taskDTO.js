function toTaskDTO(task) {
  if (!task) return null;
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: !!task.completed,
    dueDate: task.dueDate || null,
    priority: task.priority || 'medium',
    columnPosition: task.columnPosition || 0,
    userId: task.userId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

module.exports = { toTaskDTO };
