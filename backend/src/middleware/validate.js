function validateCreateTask(req, res, next) {
  const { title, description, dueDate, priority, columnPosition } = req.body || {};

  if (title === undefined || title === null || String(title).trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }
  if (String(title).length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or fewer.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string.' });
  }
  if (description && description.length > 2000) {
    return res.status(400).json({ error: 'Description must be 2000 characters or fewer.' });
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: "Priority must be one of: 'low', 'medium', 'high'." });
  }
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    const dateParsed = Date.parse(dueDate);
    if (isNaN(dateParsed)) {
      return res.status(400).json({ error: 'Due date must be a valid date string (e.g. YYYY-MM-DD).' });
    }
  }
  if (columnPosition !== undefined && !Number.isInteger(columnPosition)) {
    return res.status(400).json({ error: 'Column position must be an integer.' });
  }

  req.body.title = String(title).trim();
  next();
}

function validateUpdateTask(req, res, next) {
  const { title, description, completed, dueDate, priority, columnPosition } = req.body || {};

  if (title !== undefined && String(title).trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }
  if (title !== undefined && String(title).length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or fewer.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string.' });
  }
  if (description !== undefined && description.length > 2000) {
    return res.status(400).json({ error: 'Description must be 2000 characters or fewer.' });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean.' });
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: "Priority must be one of: 'low', 'medium', 'high'." });
  }
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    const dateParsed = Date.parse(dueDate);
    if (isNaN(dateParsed)) {
      return res.status(400).json({ error: 'Due date must be a valid date string (e.g. YYYY-MM-DD).' });
    }
  }
  if (columnPosition !== undefined && !Number.isInteger(columnPosition)) {
    return res.status(400).json({ error: 'Column position must be an integer.' });
  }

  if (title !== undefined) req.body.title = String(title).trim();
  next();
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Task id must be a positive integer.' });
  }
  next();
}

function validateRegisterAndLogin(req, res, next) {
  const { username, password } = req.body || {};
  if (!username || String(username).trim() === '') {
    return res.status(400).json({ error: 'Username is required.' });
  }
  if (!password || String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }
  next();
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateIdParam,
  validateRegisterAndLogin
};
