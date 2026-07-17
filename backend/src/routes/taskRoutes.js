const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  validateCreateTask,
  validateUpdateTask,
  validateIdParam,
} = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all task routes under this router
router.use(authMiddleware);

router.get('/', getTasks);
router.get('/:id', validateIdParam, getTaskById);
router.post('/', validateCreateTask, createTask);
router.put('/:id', validateIdParam, validateUpdateTask, updateTask);
router.patch('/:id/toggle', validateIdParam, toggleTask);
router.delete('/:id', validateIdParam, deleteTask);

module.exports = router;
