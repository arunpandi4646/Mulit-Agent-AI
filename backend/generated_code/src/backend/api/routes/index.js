const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getTasks);
router.get('/tasks/:id', taskController.getTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;